'use strict';

import {nalParseAnnexB} from './common/nal-parse';
import {parseAdts} from './common/aac-parse';
import dataToHex from './common/data-to-hex.js';

// constants
const MP2T_PACKET_LENGTH = 188; // in bytes
const SYNC_BYTE = 0x47;
const STREAM_TYPES  = {
  h264: 0x1b,
  adts: 0x0f,
  metadata: 0x15
};

/**
 * Splits an incoming stream of binary data into MPEG-2 Transport
 * Stream packets.
 */
const parseTransportStream = function(bytes) {
  var
    startIndex = 0,
    endIndex = MP2T_PACKET_LENGTH,
    lastSync = -1,
    packets = [];

  // While we have enough data for a packet
  while (endIndex < bytes.byteLength) {
    // Look for a pair of start and end sync bytes in the data..
    if (bytes[startIndex] === SYNC_BYTE && bytes[endIndex] === SYNC_BYTE) {
      if (lastSync !== -1) {
        packets.push({
          type:'unknown-bytes',
          data: bytes.subarray(lastSync, startIndex)
        });
        lastSync = -1;
      }

      // We found a packet so emit it and jump one whole packet forward in
      // the stream
      packets.push({
        type: 'transportstream-packet',
        data: bytes.subarray(startIndex, endIndex)
      });
      startIndex += MP2T_PACKET_LENGTH;
      endIndex += MP2T_PACKET_LENGTH;
      continue;
    }
    // If we get here, we have somehow become de-synchronized and we need to step
    // forward one byte at a time until we find a pair of sync bytes that denote
    // a packet
    lastSync = startIndex;
    startIndex++;
    endIndex++;
  }

  if (startIndex + MP2T_PACKET_LENGTH === bytes.byteLength) {
      // We found a final packet so emit it and jump one whole packet forward in
      // the stream
      packets.push({
        type: 'transportstream-packet',
        data: bytes.subarray(startIndex, endIndex)
      });
      startIndex += MP2T_PACKET_LENGTH;
      endIndex += MP2T_PACKET_LENGTH;
  }

  // If there was some data left over at the end of the segment that couldn't
  // possibly be a whole packet, emit it for completeness
  if (startIndex < bytes.byteLength) {
    packets.push({
      type:'unknown-bytes',
      data: bytes.subarray(startIndex)
    });
  }

  return parseTransportStreamPackets(packets);
};

/**
 * Accepts an MP2T TransportPacketStream and emits data events with parsed
 * forms of the individual transport stream packets.
 */
const parseTransportStreamPackets = function(packets) {
  let packetsPendingPmt = [];
  let packetsPendingPmtPid = [];
  let programMapTable = null;
  let pmtPid = null;

  const processPmtOrPes = function (packet) {
    if (packet.pid === pmtPid) {
      packet.content.type = 'pmt';
      parsePsi(packet);
    } else if (programMapTable === null) {
      // When we have not seen a PMT yet, defer further processing of
      // PES packets until one has been parsed
      packetsPendingPmt.push(packet);
    } else {
      processPes(packet);
    }
  };

  const processPes = function(packet) {
    let pmtTable = programMapTable[packet.pid];
    if (pmtTable) {
      packet.content.streamType = pmtTable.streamType;
    } else {
      packet.content.streamType = ' unknown';
    }
    packet.content.type = 'pes';
  };

  const parsePsi = function(packet) {
    var offset = 0;
    var psi = packet.content;
    var payload = psi.data;

    // PSI packets may be split into multiple sections and those
    // sections may be split into multiple packets. If a PSI
    // section starts in this packet, the payload_unit_start_indicator
    // will be true and the first byte of the payload will indicate
    // the offset from the current position to the start of the
    // section.
    if (packet.payloadUnitStartIndicator) {
      offset += payload[0] + 1;
    }

    psi.data = payload.subarray(offset);

    if (psi.type === 'pat') {
      parsePat(packet);
    } else {
      parsePmt(packet);
    }
  };

  const parsePat = function(packet) {
    let pat = packet.content;
    let payload = pat.data;

    pat.sectionNumber = payload[7]; // eslint-disable-line camelcase
    pat.lastSectionNumber = payload[8]; // eslint-disable-line camelcase

    // skip the PSI header and parse the first PMT entry
    pmtPid = (payload[10] & 0x1F) << 8 | payload[11];
    pat.pmtPid = pmtPid;

    // if there are any packets waiting for a PMT PID to be found, process them now
    while (packetsPendingPmtPid.length) {
      processPmtOrPes(packetsPendingPmtPid.shift());
    }
  };

  /**
   * Parse out the relevant fields of a Program Map Table (PMT).
   * @param payload {Uint8Array} the PMT-specific portion of an MP2T
   * packet. The first byte in this array should be the table_id
   * field.
   * @param pmt {object} the object that should be decorated with
   * fields parsed from the PMT.
   */
  const parsePmt = function(packet) {
    let pmt = packet.content;
    let payload = pmt.data;

    var sectionLength, tableEnd, programInfoLength, offset;

    // PMTs can be sent ahead of the time when they should actually
    // take effect. We don't believe this should ever be the case
    // for HLS but we'll ignore "forward" PMT declarations if we see
    // them. Future PMT declarations have the current_next_indicator
    // set to zero.
    if (!(payload[5] & 0x01)) {
      return;
    }

    // overwrite any existing program map table
    programMapTable = {};

    // the mapping table ends at the end of the current section
    sectionLength = (payload[1] & 0x0f) << 8 | payload[2];
    tableEnd = 3 + sectionLength - 4;

    // to determine where the table is, we have to figure out how
    // long the program info descriptors are
    programInfoLength = (payload[10] & 0x0f) << 8 | payload[11];

    // advance the offset to the first entry in the mapping table
    offset = 12 + programInfoLength;

    while (offset < tableEnd) {
      let esInfoLength = ((payload[offset + 3] & 0x0F) << 8 | payload[offset + 4]);
      // add an entry that maps the elementary_pid to the stream_type
      programMapTable[(payload[offset + 1] & 0x1F) << 8 | payload[offset + 2]] = {
        streamType: payload[offset],
        esInfo: payload.subarray(offset + 5, offset + 5 + esInfoLength)
      };

      // move to the next table entry
      // skip past the elementary stream descriptors, if present
      offset += esInfoLength + 5;
    }

    // record the map on the packet as well
    pmt.programMapTable = programMapTable;

    // if there are any packets waiting for a PMT to be found, process them now
    while (packetsPendingPmt.length) {
      processPes(packetsPendingPmt.shift());
    }
  };

  /**
   * Deliver a new MP2T packet to the stream.
   */
  const parsePacket = function(packet) {
    let offset = 4;
    let payload = packet.data;
    let content = {};

    packet.payloadUnitStartIndicator = !!(payload[1] & 0x40);

    // pid is a 13-bit field starting at the last bit of packet[1]
    packet.pid = payload[1] & 0x1f;
    packet.pid <<= 8;
    packet.pid |= payload[2];
    packet.content = content;

    // if an adaption field is present, its length is specified by the
    // fifth byte of the TS packet header. The adaptation field is
    // used to add stuffing to PES packets that don't fill a complete
    // TS packet, and to specify some forms of timing and control data
    // that we do not currently use.
    if (((payload[3] & 0x30) >>> 4) > 0x01) {
      offset += payload[offset] + 1;
    }

    content.data = payload.subarray(offset);

    // parse the rest of the packet based on the type
    if (packet.pid === 0) {
      content.type = 'pat';
      parsePsi(packet);
      return packet;
    }

    if (pmtPid === null) {
      packetsPendingPmtPid.push(packet);
      return packet;
    }

    return processPmtOrPes(packet);
  };

  packets
    .forEach((packet) => {
      if (packet.type === 'transportstream-packet') {
        parsePacket(packet);
      } else {
        packet.content = {};
      }
    });

  return packets;
};

/**
 * Reconsistutes program elementary stream (PES) packets from parsed
 * transport stream packets. That is, if you pipe an
 * mp2t.TransportParseStream into a mp2t.ElementaryStream, the output
 * events will be events which capture the bytes for individual PES
 * packets plus relevant metadata that has been extracted from the
 * container.
 */
const parsePesPackets = function(packets) {
  var
    completeEs = [],
    // PES packet fragments
    streams = [],
    parsePes = function(payload, pes) {
      var ptsDtsFlags;

      // find out if this packets starts a new keyframe
      pes.dataAlignmentIndicator = (payload[6] & 0x04) !== 0;
      // PES packets may be annotated with a PTS value, or a PTS value
      // and a DTS value. Determine what combination of values is
      // available to work with.
      ptsDtsFlags = payload[7];

      // PTS and DTS are normally stored as a 33-bit number.  Javascript
      // performs all bitwise operations on 32-bit integers but javascript
      // supports a much greater range (52-bits) of integer using standard
      // mathematical operations.
      // We construct a 31-bit value using bitwise operators over the 31
      // most significant bits and then multiply by 4 (equal to a left-shift
      // of 2) before we add the final 2 least significant bits of the
      // timestamp (equal to an OR.)
      if (ptsDtsFlags & 0xC0) {
        // the PTS and DTS are not written out directly. For information
        // on how they are encoded, see
        // http://dvd.sourceforge.net/dvdinfo/pes-hdr.html
        pes.pts = (payload[9] & 0x0E) << 27 |
          (payload[10] & 0xFF) << 20 |
          (payload[11] & 0xFE) << 12 |
          (payload[12] & 0xFF) <<  5 |
          (payload[13] & 0xFE) >>>  3;
        pes.pts *= 4; // Left shift by 2
        pes.pts += (payload[13] & 0x06) >>> 1; // OR by the two LSBs
        pes.dts = pes.pts;
        if (ptsDtsFlags & 0x40) {
          pes.dts = (payload[14] & 0x0E) << 27 |
            (payload[15] & 0xFF) << 20 |
            (payload[16] & 0xFE) << 12 |
            (payload[17] & 0xFF) << 5 |
            (payload[18] & 0xFE) >>> 3;
          pes.dts *= 4; // Left shift by 2
          pes.dts += (payload[18] & 0x06) >>> 1; // OR by the two LSBs
        }
      }

      // the data section starts immediately after the PES header.
      // pes_header_data_length specifies the number of header bytes
      // that follow the last byte of the field.
      pes.data = payload.subarray(9 + payload[8]);
    },
    flushStream = function(stream) {
      var
        packetData = new Uint8Array(stream.size),
        event = {
          type: stream.streamType
        },
        i = 0,
        fragment;

      // do nothing if there is no buffered data
      if (!stream.data.length) {
        return;
      }
      event.pid = stream.pid;
      event.packetCount = stream.data.length;
      event.tsPacketIndices = stream.tsPacketIndices;
      // reassemble the packet
      while (stream.data.length) {
        fragment = stream.data.shift();

        packetData.set(fragment.data, i);
        i += fragment.data.byteLength;
      }

      // parse assembled packet's PES header
      parsePes(packetData, event);

      if (event.type === 'video') {
        parseNals(event);
      }

      if (event.type === 'audio') {
        parseAac(event);
      }

      stream.size = 0;
      stream.tsPacketIndices = [];

      completeEs.push(event);
    };

  const packetTypes = {
    pat: function(packet, packetIndex) {
      let pat = packet.content;
      completeEs.push({
        pid: packet.pid,
        type: 'pat',
        packetCount: 1,
        sectionNumber: pat.sectionNumber,
        lastSectionNumber: pat.lastSectionNumber,
        tsPacketIndices: [packetIndex],
        pmtPid: pat.pmtPid,
        data: pat.data
      });
    },
    pes: function(packet, packetIndex) {
      let stream;
      let streamType;
      let pes = packet.content;

      if (!streams[packet.pid]) {
        stream = streams[packet.pid] = {
          data: [],
          tsPacketIndices: [],
          size: 0
        };

        switch (pes.streamType) {
        case STREAM_TYPES.h264:
          stream.streamType = 'video';
          break;
        case STREAM_TYPES.adts:
          stream.streamType = 'audio';
          break;
        case STREAM_TYPES.metadata:
          stream.streamType = 'timed-metadata';
          break;
        default:
          stream.streamType = 'unknown-' + packet.pid;
        }
      }

      stream = streams[packet.pid];

      // if a new packet is starting, we can flush the completed
      // packet
      if (packet.payloadUnitStartIndicator) {
        flushStream(stream);
      }

      stream.pid = packet.pid;
      stream.tsPacketIndices.push(packetIndex);
      // buffer this fragment until we are sure we've received the
      // complete payload
      stream.data.push(pes);
      stream.size += pes.data.byteLength;
    },
    pmt: function(packet, packetIndex) {
      let pmt = packet.content;
      let programMapTable = pmt.programMapTable;
      let event = {
        pid: packet.pid,
        type: 'pmt',
        tracks: [],
        tsPacketIndices: [packetIndex],
        packetCount: 1,
        data: pmt.data
      };
      let k;
      let track;

      // translate streams to tracks
      for (k in programMapTable) {
        if (programMapTable.hasOwnProperty(k)) {
          track = {};

          track.id = +k;
          track.streamType = programMapTable[k].streamType;
          if (programMapTable[k].streamType === STREAM_TYPES.h264) {
            track.codec = 'avc';
            track.type = 'video';
          } else if (programMapTable[k].streamType === STREAM_TYPES.adts) {
            track.codec = 'adts';
            track.type = 'audio';
          } else if (programMapTable[k].streamType === STREAM_TYPES.metadata) {
            track.type = 'metadata';
          } else {
            track.type = 'unknown';
          }
          track.esInfo = programMapTable[k].esInfo;
          event.tracks.push(track);
        }
      }
      completeEs.push(event);
    }
  };

  const parsePacket = function (packet, packetIndex) {
    switch (packet.content.type) {
      case 'pat':
      case 'pmt':
      case 'pes':
        packetTypes[packet.content.type](packet, packetIndex);
        break;
      default:
        break;
    }
  };

  packets.forEach((packet, packetIndex) => {
    parsePacket(packet, packetIndex);
  });

  streams.forEach((stream) => {
    flushStream(stream);
  });

  return completeEs;
};

const inspectTs = function (data) {
  var object = {};
  var tsPackets = parseTransportStream(data);
  var pesPackets = parsePesPackets(tsPackets);

  object.tsMap = tsPackets;
  object.esMap = pesPackets;

  return object;
};

const domifyTs = function (object) {
  let tsPackets = object.tsMap;
  let pesPackets = object.esMap;
  let container = document.createElement('div');

  parsePESPackets(pesPackets, container, 1);

  return container;
};

const parsePESPackets = function (pesPackets, parent, depth) {
  pesPackets.forEach((packet) => {
    var packetEl = document.createElement('div');
    domifyBox(packet, parent, depth + 1);
  });
};

const parseNals = function (packet) {
  packet.nals = nalParseAnnexB(packet.data);
  packet.nals.size = packet.data.length;

  return packet;
};

const parseAac = function (packet) {
  packet.adts = parseAdts(packet);
  packet.adts.ize = packet.data.length;

  return packet;
};

const domifyBox = function (box, parentNode, depth) {
  var isObject = (o) => Object.prototype.toString.call(o) === '[object Object]';
  var attributes = ['size', 'flags', 'type', 'version'];
  var specialProperties = ['boxes', 'nals', 'samples', 'packetCount'];
  var objectProperties = Object.keys(box).filter((key) => {
    return isObject(box[key]) ||
      (Array.isArray(box[key]) && isObject(box[key][0]));
  });
  var propertyExclusions =
    attributes
      .concat(specialProperties)
      .concat(objectProperties);
  var subProperties = Object.keys(box).filter((key) => {
    return propertyExclusions.indexOf(key) === -1;
  });

  var boxNode = document.createElement('mp4-box');
  var propertyNode = document.createElement('mp4-properties');
  var subBoxesNode = document.createElement('mp4-boxes');
  var boxTypeNode = document.createElement('mp4-box-type');

  if (box.type) {
    boxTypeNode.textContent = box.type;

    if (depth > 1) {
      boxTypeNode.classList.add('collapsed');
    }

    boxNode.appendChild(boxTypeNode);
  }

  attributes.forEach((key) => {
    if (typeof box[key] !== 'undefined') {
      boxNode.setAttribute('data-' + key, box[key]);
    }
  });

  if (subProperties.length) {
    subProperties.forEach((key) => {
      makeProperty(key, box[key], propertyNode);
    });
    boxNode.appendChild(propertyNode);
  }

  if (box.boxes && box.boxes.length) {
    box.boxes.forEach((subBox) => domifyBox(subBox, subBoxesNode, depth + 1));
    boxNode.appendChild(subBoxesNode);
  } else if (objectProperties.length) {
    objectProperties.forEach((key) => {
      if (Array.isArray(box[key])) {
        domifyBox({
          type: key,
          boxes: box[key],
          size: box[key].size
        },
        subBoxesNode,
        depth + 1);
      } else {
        domifyBox(box[key], subBoxesNode, depth + 1);
      }
    });
    boxNode.appendChild(subBoxesNode);
  }

  parentNode.appendChild(boxNode);
};

const makeProperty = function (name, value, parentNode) {
  var nameNode = document.createElement('mp4-name');
  var valueNode = document.createElement('mp4-value');
  var propertyNode = document.createElement('mp4-property');

  nameNode.setAttribute('data-name', name);
  nameNode.textContent = name;

  if (value instanceof Uint8Array || value instanceof Uint32Array) {
    let strValue = dataToHex(value, '');
    let sliceOffset = 0;
    let lines = 0;

    for (; sliceOffset < strValue.length; sliceOffset++) {
      if (strValue[sliceOffset] === '\n') {
        if (++lines === 21) {
          sliceOffset++;
          break;
        }
      }
    }
    let truncValue = strValue.slice(0, sliceOffset);

    if (truncValue.length < strValue.length) {
      truncValue += '<' + (value.byteLength - 336) + 'b remaining of ' + value.byteLength + 'b total>';
    }

    valueNode.setAttribute('data-value', truncValue.toUpperCase());
    valueNode.innerHTML = truncValue;
    valueNode.classList.add('pre-like');
  } else if (Array.isArray(value)) {
    let strValue = '[' + value.join(', ') + ']';
    valueNode.setAttribute('data-value', strValue);
    valueNode.textContent = strValue;
  } else {
    valueNode.setAttribute('data-value', value);
    valueNode.textContent = value;
  }

  propertyNode.appendChild(nameNode);
  propertyNode.appendChild(valueNode);

  parentNode.appendChild(propertyNode);
};

export default {
  inspect: inspectTs,
  domify: domifyTs
};
