---
sidebar_label: Part
title: Part
---

import ParamsTable from '@site/src/components/ParamsTable';

export const PART_PROPERTIES = [
  {
    name: "ChecksumCRC32",
    type: "string",
    description: "The Base64 encoded, 32-bit CRC32 checksum of the object. This checksum is only present if the checksum was uploaded with the object.",
    required: false
  },
  {
    name: "ChecksumCRC32C",
    type: "string",
    description: "The Base64 encoded, 32-bit CRC32C checksum of the object. This checksum is only present if the checksum was uploaded with the object.",
    required: false
  },
  {
    name: "ChecksumCRC64NVME",
    type: "string",
    description: "The Base64 encoded, 64-bit CRC64NVME checksum of the object. This checksum is only present if the checksum was uploaded with the object.",
    required: false
  },
  {
    name: "ChecksumSHA1",
    type: "string",
    description: "The Base64 encoded, 160-bit SHA1 digest of the object. This checksum is only present if the checksum was uploaded with the object.",
    required: false
  },
  {
    name: "ChecksumSHA256",
    type: "string",
    description: "The Base64 encoded, 256-bit SHA256 digest of the object. This checksum is only present if the checksum was uploaded with the object.",
    required: false
  },
  {
    name: "ETag",
    type: "string",
    description: "Entity tag returned when the part was uploaded",
    required: true
  },
  {
    name: "PartNumber",
    type: "integer",
    description: "Part number identifying the part",
    required: true
  }
];

# Part

A container for information about a part of a multipart upload.

## Properties

<ParamsTable parameters={PART_PROPERTIES} /> 