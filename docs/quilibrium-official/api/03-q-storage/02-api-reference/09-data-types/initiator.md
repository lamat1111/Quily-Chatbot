---
sidebar_label: Initiator
title: Initiator
---

import ParamsTable from '@site/src/components/ParamsTable';

# Initiator

Container element that identifies who initiated the multipart upload.

## Properties

export const PROPERTIES = [
  {
    name: "DisplayName",
    description: "Name of the Principal. Not supported for directory buckets",
    type: "string",
    required: false
  },
  {
    name: "ID",
    description: "If the principal is an AWS account, it provides the Canonical User ID. If the principal is an IAM User, it provides a user ARN value. For directory buckets, if the principal is an AWS account, it provides the AWS account ID",
    type: "string",
    required: false
  }
];

<ParamsTable parameters={PROPERTIES} />
