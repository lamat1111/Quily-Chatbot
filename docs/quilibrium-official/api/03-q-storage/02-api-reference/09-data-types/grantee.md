---
sidebar_label: Grantee
title: Grantee
---

# Grantee

The person being granted permissions.

## Contents

### ID

The canonical user ID of the grantee.

**Type**: String  
**Required**: No

### DisplayName

Screen name of the grantee.

**Type**: String  
**Required**: No

### EmailAddress

Email address of the grantee.

**Type**: String  
**Required**: No

### URI

URI of the grantee group.

**Type**: String  
**Required**: No

### Type

The type of grantee.

**Type**: String  
**Valid Values**: `CanonicalUser | AmazonCustomerByEmail | Group`  
**Required**: Yes

## Examples

### Example 1: Canonical User

```xml
<Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="CanonicalUser">
   <ID>123456789012</ID>
   <DisplayName>John Doe</DisplayName>
</Grantee>
```

### Example 2: Email User

```xml
<Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="AmazonCustomerByEmail">
   <EmailAddress>user@example.com</EmailAddress>
</Grantee>
```

### Example 3: Group

```xml
<Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Group">
   <URI>http://acs.amazonaws.com/groups/global/AllUsers</URI>
</Grantee>
``` 