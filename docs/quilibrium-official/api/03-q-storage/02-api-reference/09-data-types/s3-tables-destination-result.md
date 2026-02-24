---
title: S3TablesDestinationResult
label: S3TablesDestinationResult
---

import ParamsTable from '@site/src/components/ParamsTable';

export const s3TablesDestinationResultType = [
  {
    name: 'TableArn',
    description: 'The Resource Name (ARN) of the metadata table',
    type: 'String',
    required: true
  },
  {
    name: 'TableBucketArn',
    description: 'The ARN of the bucket containing the metadata table',
    type: 'String',
    required: true
  },
  {
    name: 'TableName',
    description: 'The name of the metadata table',
    type: 'String',
    required: true
  },
  {
    name: 'TableNamespace',
    description: 'The namespace of the metadata table',
    type: 'String',
    required: true
  }
];

The S3TablesDestinationResult data type contains information about the destination table for metadata.

<ParamsTable parameters={s3TablesDestinationResultType} typesEnabled /> 