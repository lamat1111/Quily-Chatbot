---
sidebar_label: OwnershipControls
title: OwnershipControls
---

# OwnershipControls

Container for ownership controls.

## Contents

### Rule

Container for a rule that defines ownership controls.

**Type**: OwnershipControlsRule  
**Required**: Yes

## Example

```xml
<OwnershipControls xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ObjectOwnership>BucketOwnerPreferred</ObjectOwnership>
   </Rule>
</OwnershipControls>
``` 