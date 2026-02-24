---
title: MetadataTableConfiguration
label: MetadataTableConfiguration
---

import ParamsTable from '@site/src/components/ParamsTable';

export const metadataTableConfigType = [
  {
    name: 'MetadataTableConfigurationResult',
    description: 'Contains the configuration details of the metadata table',
    type: 'Container',
    required: true
  },
  {
    name: 'Status',
    description: 'The status of the metadata table. Possible values: CREATING, ACTIVE, FAILED',
    type: 'String',
    required: true
  },
  {
    name: 'Error',
    description: 'Contains error information if the table creation fails',
    type: 'ErrorDetails',
    required: false
  }
];

The MetadataTableConfiguration data type contains information about the metadata table configuration for a bucket.

<ParamsTable data={metadataTableConfigType} typesEnabled /> 