---
sidebar_label: Object
title: Object
---

import ParamsTable from '@site/src/components/ParamsTable';

export const OBJECT_PROPERTIES = [
  {
    name: "ChecksumAlgorithm",
    type: "Array<String>",
    description: "The algorithm that was used to create a checksum of the object.<br/><br/>Valid Values: `CRC32 | CRC32C | SHA1 | SHA256 | CRC64NVME`",
    required: false
  },
  {
    name: "ChecksumType",
    type: "String",
    description: "The checksum type that is used to calculate the object's checksum value.<br/><br/>Valid Values: `COMPOSITE | FULL_OBJECT`",
    required: false
  },
  {
    name: "ETag",
    type: "String",
    description: "The entity tag is a hash of the object. The ETag reflects changes only to the contents of an object, not its metadata. The ETag may or may not be an MD5 digest of the object data, depending on how the object was created and encrypted:<br/><br/>* Objects created by PUT Object, POST Object, or Copy operations have ETags that are an MD5 digest of their object data when using standard encryption or no encryption<br/>* Objects created using other encryption methods may have ETags that are not MD5 digests<br/>* Objects created by Multipart Upload or Part Copy operations will not have an MD5 digest ETag regardless of encryption method",
    required: false
  },
  {
    name: "Key",
    type: "String",
    description: "The name that you assign to an object. You use the object key to retrieve the object.",
    required: false,
    minLength: 1
  },
  {
    name: "LastModified",
    type: "Timestamp",
    description: "Creation date of the object",
    required: false
  },
  {
    name: "Owner",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/owner\">Owner</a>",
    description: "The owner of the object",
    required: false
  },
  {
    name: "Size",
    type: "Long",
    description: "Size in bytes of the object",
    required: false
  },
  {
    name: "StorageClass",
    type: "String",
    description: "The class of storage used to store the object.<br/><br/>Valid Values: `STANDARD | REDUCED_REDUNDANCY | GLACIER | STANDARD_IA | ONEZONE_IA | INTELLIGENT_TIERING | DEEP_ARCHIVE | OUTPOSTS | GLACIER_IR | SNOW | EXPRESS_ONEZONE`",
    required: false
  }
];

# Object

An object consists of data and its descriptive metadata.

## Properties

<ParamsTable parameters={OBJECT_PROPERTIES} type="response" /> 