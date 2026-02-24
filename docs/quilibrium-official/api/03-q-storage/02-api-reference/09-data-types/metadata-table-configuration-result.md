---
title: MetadataTableConfigurationResult
label: MetadataTableConfigurationResult
---

import ParamsTable from '@site/src/components/ParamsTable';

export const metadataTableConfigResultType = [
  {
    name: 'S3TablesDestinationResult',
    description: 'Contains information about the destination table configuration.',
    type: '<a href="/docs/api/q-storage/api-reference/data-types/s3-tables-destination-result">S3TablesDestinationResult</a>',
    required: true
  }
];

The MetadataTableConfigurationResult data type contains the result of a metadata table configuration operation. This data type is used to represent the output of operations that configure or modify metadata table settings.

## Structure

<ParamsTable parameters={metadataTableConfigResultType} typesEnabled /> 