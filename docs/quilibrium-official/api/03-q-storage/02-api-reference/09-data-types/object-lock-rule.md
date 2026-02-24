---
title: ObjectLockRule
label: ObjectLockRule
---

import ParamsTable from '@site/src/components/ParamsTable';

# ObjectLockRule

Container for the Object Lock rule for the specified object.

## Syntax

```xml
<Rule>
   <DefaultRetention>
      <Mode>string</Mode>
      <Years>integer</Years>
   </DefaultRetention>
</Rule>
```
or

```xml
<Rule>
   <DefaultRetention>
      <Mode>string</Mode>
      <Days>integer</Days>
   </DefaultRetention>
</Rule>
```
:::note
- You must specify either Days or Years in a DefaultRetention configuration, but not both.
- The retention period must be a positive integer.
:::
## Properties

export const PROPERTIES = [
  {
    name: "DefaultRetention",
    type: "<a href='/docs/api/q-storage/api-reference/data-types/default-retention'>DefaultRetention</a>",
    description: "The default Object Lock retention settings for new objects placed in the specified bucket.",
    required: false
  }
];

<ParamsTable parameters={PROPERTIES} typesEnabled /> 