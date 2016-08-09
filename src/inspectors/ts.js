/**
 * mux.js
 *
 * Copyright (c) 2015 Brightcove
 * All rights reserved.
 *
 * A stream-based mp2t to mp4 converter. This utility can be used to
 * deliver mp4s to a SourceBuffer on platforms that support native
 * Media Source Extensions.
 */
'use strict';

import {nalParseAnnexB} from './common/nal-parse';

// constants
var
  MP2T_PACKET_LENGTH = 188, // bytes
  SYNC_BYTE = 0x47;

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
        type: 'ts-packet',
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
        type: 'ts-packet',
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

  return packets;
};

/**
 * Accepts an MP2T TransportPacketStream and emits data events with parsed
 * forms of the individual transport stream packets.
 */
const parseTransportStreamPackets = function(packets) {
  var packetsWaitingForPmt = [];
  var results = [];
  var programMapTable = undefined;
  var pmtPid = null;

  const parsePsi = function(payload, psi) {
    var offset = 0;

    // PSI packets may be split into multiple sections and those
    // sections may be split into multiple packets. If a PSI
    // section starts in this packet, the payload_unit_start_indicator
    // will be true and the first byte of the payload will indicate
    // the offset from the current position to the start of the
    // section.
    if (psi.payloadUnitStartIndicator) {
      offset += payload[offset] + 1;
    }

    if (psi.type === 'pat') {
      parsePat(payload.subarray(offset), psi);
    } else {
      parsePmt(payload.subarray(offset), psi);
    }
  };

  const parsePat = function(payload, pat) {
    pat.section_number = payload[7]; // eslint-disable-line camelcase
    pat.last_section_number = payload[8]; // eslint-disable-line camelcase

    // skip the PSI header and parse the first PMT entry
    pmtPid = (payload[10] & 0x1F) << 8 | payload[11];
    pat.pmtPid = pmtPid;
  };

  /**
   * Parse out the relevant fields of a Program Map Table (PMT).
   * @param payload {Uint8Array} the PMT-specific portion of an MP2T
   * packet. The first byte in this array should be the table_id
   * field.
   * @param pmt {object} the object that should be decorated with
   * fields parsed from the PMT.
   */
  const parsePmt = function(payload, pmt) {
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
      // add an entry that maps the elementary_pid to the stream_type
      programMapTable[(payload[offset + 1] & 0x1F) << 8 | payload[offset + 2]] = payload[offset];

      // move to the next table entry
      // skip past the elementary stream descriptors, if present
      offset += ((payload[offset + 3] & 0x0F) << 8 | payload[offset + 4]) + 5;
    }

    // record the map on the packet as well
    pmt.programMapTable = programMapTable;

    // if there are any packets waiting for a PMT to be found, process them now
    while (packetsWaitingForPmt.length) {
      processPes.apply(null, packetsWaitingForPmt.shift());
    }
  };

  /**
   * Deliver a new MP2T packet to the stream.
   */
  const parsePacket = function(packet) {
    var
      result = {},
      offset = 4;

    result.payloadUnitStartIndicator = !!(packet[1] & 0x40);

    // pid is a 13-bit field starting at the last bit of packet[1]
    result.pid = packet[1] & 0x1f;
    result.pid <<= 8;
    result.pid |= packet[2];

    // if an adaption field is present, its length is specified by the
    // fifth byte of the TS packet header. The adaptation field is
    // used to add stuffing to PES packets that don't fill a complete
    // TS packet, and to specify some forms of timing and control data
    // that we do not currently use.
    if (((packet[3] & 0x30) >>> 4) > 0x01) {
      offset += packet[offset] + 1;
    }

    // parse the rest of the packet based on the type
    if (result.pid === 0) {
      result.type = 'pat';
      parsePsi(packet.subarray(offset), result);
      results.push(result);
    } else if (result.pid === pmtPid) {
      result.type = 'pmt';
      parsePsi(packet.subarray(offset), result);
      results.push(result);
    } else if (programMapTable === undefined) {
      // When we have not seen a PMT yet, defer further processing of
      // PES packets until one has been parsed
      packetsWaitingForPmt.push([packet, offset, result]);
    } else {
      processPes(packet, offset, result);
    }
  };

  const processPes = function(packet, offset, result) {
    result.streamType = programMapTable[result.pid];
    result.type = 'pes';
    result.data = packet.subarray(offset);

    results.push(result);
  };

  packets.forEach((packet) => {
    if (packet.type === 'ts-packet') {
      parsePacket(packet.data);
    } else {
      results.push(packet);
    }
  });

  return results;
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
    video = {
      data: [],
      size: 0
    },
    audio = {
      data: [],
      size: 0
    },
    timedMetadata = {
      data: [],
      size: 0
    },
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
    flushStream = function(stream, type) {
      var
        packetData = new Uint8Array(stream.size),
        event = {
          type: type
        },
        i = 0,
        fragment;

      // do nothing if there is no buffered data
      if (!stream.data.length) {
        return;
      }
      event.pid = stream.data[0].pid;
      event.packetCount = stream.data.length;
      // reassemble the packet
      while (stream.data.length) {
        fragment = stream.data.shift();

        packetData.set(fragment.data, i);
        i += fragment.data.byteLength;
      }

      // parse assembled packet's PES header
      parsePes(packetData, event);

      stream.size = 0;

      completeEs.push(event);
    };

  const packetTypes = {
    pat: function(data) {
      completeEs.push({
        pid: data.pid,
        type: 'pat',
        packetCount: 1,
        sectionNumber: data.section_number,
        lastSectionNumber: data.last_section_number,
        pmtPid: data.pmtPid
      });
    },
    pes: function(data) {
      var stream, streamType;

      switch (data.streamType) {
      case STREAM_TYPES.h264:
        stream = video;
        streamType = 'video';
        break;
      case STREAM_TYPES.adts:
        stream = audio;
        streamType = 'audio';
        break;
      case STREAM_TYPES.metadata:
        stream = timedMetadata;
        streamType = 'timed-metadata';
        break;
      default:
        // ignore unknown stream types
        return;
      }

      // if a new packet is starting, we can flush the completed
      // packet
      if (data.payloadUnitStartIndicator) {
        flushStream(stream, streamType);
      }
      stream.pid = data.pid;
      // buffer this fragment until we are sure we've received the
      // complete payload
      stream.data.push(data);
      stream.size += data.data.byteLength;
    },
    pmt: function(data) {
      var
        event = {
          pid: data.pid,
          type: 'pmt',
          tracks: [],
          packetCount: 1
        },
        programMapTable = data.programMapTable,
        k,
        track;

      // translate streams to tracks
      for (k in programMapTable) {
        if (programMapTable.hasOwnProperty(k)) {
          track = {};

          track.id = +k;
          if (programMapTable[k] === STREAM_TYPES.h264) {
            track.codec = 'avc';
            track.type = 'video';
          } else if (programMapTable[k] === STREAM_TYPES.adts) {
            track.codec = 'adts';
            track.type = 'audio';
          }
          event.tracks.push(track);
        }
      }
      completeEs.push(event);
    }
  };

  packets.forEach((packet) => {
    packetTypes[packet.type](packet);
  });

  flushStream(video, 'video');
  flushStream(audio, 'audio');
  flushStream(timedMetadata, 'timed-metadata');

  return completeEs;
};

const inspect = function (data) {
  var tsPackets = parseTransportStream(data);
  var packets = parseTransportStreamPackets(tsPackets);
  var table = makeTable(packets);
  var pesPackets = parsePesPackets(packets);

  addToTable(pesPackets, table);

  return table;
};

const makeTable = function (packets) {
  var tableEl = document.createElement('table');
  tableEl.setAttribute('border', '1');
  tableEl.setAttribute('width', '100%');
  // Generate table based on ts packets
  packets.forEach((packet) => {
    tableEl.appendChild(makeRow(packet));
  });

  return tableEl;
};

const makeRow = function (packet) {
  var rowEl = document.createElement('tr');
  var rowHead = document.createElement('th');
  rowHead.innerHTML = packet.type;
  rowHead.setAttribute('type', packet.type);
  rowEl.appendChild(rowHead);
  return rowEl;
};

const addToTable = function (pesPackets, table) {
  var rows = table.querySelectorAll('tr');
  var currentRow = 0;

  pesPackets.forEach((packet) => {
    var rowData = document.createElement('td');
    domifyBox(packetToText(packet), rowData, 2);
    rowData.setAttribute('type', packet.type);
    rowData.setAttribute('rowspan', packet.packetCount);
    rows[currentRow].appendChild(rowData);
    currentRow += packet.packetCount;
  });
};

const packetToText = function (packet) {
  if (packet.type === 'video') {
    packet.nals = nalParseAnnexB(packet.data);
  }
  return packet;
};

const domifyBox = function (box, parentNode, depth) {
  var isObject = (o) => Object.prototype.toString.call(o) === '[object Object]';
  var attributes = ['size', 'flags', 'type', 'version'];
  var specialProperties = ['boxes', 'nals', 'samples', 'packetCount', 'data'];
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
      boxNode.setAttribute(key, box[key]);
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
          boxes: box[key]
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

  nameNode.setAttribute('name', name);
  nameNode.textContent = name;
  valueNode.setAttribute('value', value);
  valueNode.textContent = value;

  propertyNode.appendChild(nameNode);
  propertyNode.appendChild(valueNode);

  parentNode.appendChild(propertyNode);
};

export default {
  inspect
};
