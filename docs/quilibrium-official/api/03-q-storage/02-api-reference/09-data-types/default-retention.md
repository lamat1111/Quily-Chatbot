---
title: DefaultRetention
label: DefaultRetention
---

import ParamsTable from '@site/src/components/ParamsTable';

# DefaultRetention

The default Object Lock retention settings for new objects placed in the specified bucket.

## Syntax

```xml
<DefaultRetention>
   <Mode>string</Mode>
   <Days>integer</Days>
   <Years>integer</Years>
</DefaultRetention>
```

## Properties

export const PROPERTIES = [
  {
    name: "Mode",
    type: "String",
    description: "The default Object Lock retention mode you want to apply to new objects placed in the specified bucket.",
    required: true,
    validValues: ["COMPLIANCE", "GOVERNANCE"]
  },
  {
    name: "Days",
    type: "Integer",
    description: "The number of days that you want to specify for the default retention period.",
    required: false,
    constraints: ["Must be a positive integer", "Cannot be used with Years", "Must be used with Mode"]
  },
  {
    name: "Years",
    type: "Integer",
    description: "The number of years that you want to specify for the default retention period.",
    required: false,
    constraints: ["Must be a positive integer", "Cannot be used with Days", "Must be used with Mode"]
  }
];

<ParamsTable parameters={PROPERTIES} typesEnabled />

:::note
- Mode must be specified.
- You must specify either Days or Years in a DefaultRetention configuration, but not both.
- The retention period must be a positive integer.
:::

## See Also

- [PutObjectLockConfiguration](/docs/api/q-storage/api-reference/bucket-operations/put-object-lock-configuration)
- [ObjectLockRule](/docs/api/q-storage/api-reference/data-types/object-lock-rule) 