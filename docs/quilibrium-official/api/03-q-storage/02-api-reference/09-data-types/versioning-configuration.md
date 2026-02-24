---
sidebar_label: VersioningConfiguration
title: VersioningConfiguration
---

# VersioningConfiguration

Container for bucket versioning configuration.

## Contents

### Status

The versioning state of the bucket.

**Type**: String  
**Valid Values**: `Enabled | Suspended`  
**Required**: No

### MFADelete

Specifies whether MFA delete is enabled in the bucket versioning configuration. This element is only returned if the bucket has been configured with MFA delete. If the bucket has never been so configured, this element is not returned.

**Type**: String  
**Valid Values**: `Enabled | Disabled`  
**Required**: No

## Examples

### Example 1: Versioning enabled

```xml
<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Status>Enabled</Status>
</VersioningConfiguration>
```

### Example 2: Versioning suspended

```xml
<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Status>Suspended</Status>
</VersioningConfiguration>
```

### Example 3: Never versioned

```xml
<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"/>
```

### Example 4: With MFA Delete enabled

```xml
<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Status>Enabled</Status>
   <MFADelete>Enabled</MFADelete>
</VersioningConfiguration>
``` 