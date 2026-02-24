---
sidebar_label: CompletedPart
title: CompletedPart
---

import ParamsTable from '@site/src/components/ParamsTable';

export const COMPLETED_PART_PROPERTIES = [
  {
    name: "ChecksumCRC32",
    type: "string",
    description: "The Base64 encoded, 32-bit CRC32 checksum of the part. This checksum is present if the multipart upload request was created with the CRC32 checksum algorithm",
    required: false
  },
  {
    name: "ChecksumCRC32C",
    type: "string",
    description: "The Base64 encoded, 32-bit CRC32C checksum of the part. This checksum is present if the multipart upload request was created with the CRC32C checksum algorithm",
    required: false
  },
  {
    name: "ChecksumCRC64NVME",
    type: "string",
    description: "The Base64 encoded, 64-bit CRC64NVME checksum of the part. This checksum is present if the multipart upload request was created with the CRC64NVME checksum algorithm",
    required: false
  },
  {
    name: "ChecksumSHA1",
    type: "string",
    description: "The Base64 encoded, 160-bit SHA1 checksum of the part. This checksum is present if the multipart upload request was created with the SHA1 checksum algorithm",
    required: false
  },
  {
    name: "ChecksumSHA256",
    type: "string",
    description: "The Base64 encoded, 256-bit SHA256 checksum of the part. This checksum is present if the multipart upload request was created with the SHA256 checksum algorithm",
    required: false
  },
  {
    name: "ETag",
    type: "string",
    description: "Entity tag returned when the part was uploaded",
    required: false
  },
  {
    name: "PartNumber",
    type: "integer",
    description: "Part number that identifies the part. This is a positive integer between 1 and 10,000. For CompleteMultipartUpload, when a checksum algorithm is used, the part numbers must start at 1 and be consecutive",
    required: false
  }
];

# CompletedPart

Details of the parts that were uploaded.

## Properties

<ParamsTable parameters={COMPLETED_PART_PROPERTIES} /> 