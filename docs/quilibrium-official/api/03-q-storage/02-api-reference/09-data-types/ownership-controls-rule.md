---
sidebar_label: OwnershipControlsRule
title: OwnershipControlsRule
---

# OwnershipControlsRule

Container for a rule that defines ownership controls.

## Contents

### ObjectOwnership

Specifies the ownership control.

**Type**: String  
**Valid Values**: `BucketOwnerPreferred | ObjectWriter`  
**Required**: Yes

## Example

```xml
<Rule>
   <ObjectOwnership>BucketOwnerPreferred</ObjectOwnership>
</Rule>
``` 