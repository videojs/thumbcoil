# Thumbcoil

Thumbcoil is a video inspector tool that can unpackage various media containers and inspect the bitstreams therein. Thumbcoil runs entirely within your browser so that none of your video data is ever transmitted to a server.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Installation

- [Installation](#installation)
- [About](#about)
- [Container Support](#container-support)
- [Bitstream Support](#bitstream-support)
  - [H.264](#h264)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save thumbcoil
```

## Container Support

Thumbcoil supports the following container formats:

* MPEG2-TS
  * PAT
  * PMT
  * PES
* fMP4 (some support for traditional non-fragmented MP4)
  * Too many boxes to list!
* FLV
  * FLV Header
  * Video Tag
  * Audio Tag

## Bitstream Support

### H.264

Thumbcoil supports the parsing of the following NAL units:

* `access_unit_delimiter`
* `sequence_paramter_set`
  * Including `seq_scaling_list` and `vui_parameters`
* `picture_parameter_set`
  * Including `pic_scaling_list`
* `slice_layer_without_partitioning`
  * Only parses the `slice_header`
* `slice_layer_without_partitioning_idr`
  * Only parses the `slice_header`
* `sei_message` - the following payload types
  * `buffering_period`
  * `pic_timing`
  * `user_data_registered_itu_t_t35`
  * `recovery_point`

## License

Apache-2.0. Copyright (c) Brightcove, Inc.


[videojs]: http://videojs.com/
