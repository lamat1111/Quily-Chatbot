---
title: ErrorDetails
label: ErrorDetails
---

import ParamsTable from '@site/src/components/ParamsTable';

export const errorDetailsType = [
  {
    name: 'ErrorCode',
    description: 'The error code associated with the failure',
    type: 'String',
    required: true
  },
  {
    name: 'ErrorMessage',
    description: 'A description of the error that occurred',
    type: 'String',
    required: true
  }
];

The ErrorDetails data type contains information about errors that occurred during an operation.

<ParamsTable parameters={errorDetailsType} typesEnabled /> 