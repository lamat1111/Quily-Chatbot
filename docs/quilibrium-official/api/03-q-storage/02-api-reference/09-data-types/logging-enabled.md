---
sidebar_label: LoggingEnabled
title: LoggingEnabled
---

# LoggingEnabled

Describes where logs are stored and the prefix that QStorage assigns to all log object keys for a bucket.

## Contents

### TargetBucket

Specifies the bucket where you want QStorage to store server access logs.

**Type**: String  
**Required**: Yes

### TargetPrefix

A prefix for all log object keys.

**Type**: String  
**Required**: No

### TargetGrants

Container for granting information.

**Type**: Array of Grant  
**Required**: No

## Example

```xml
<LoggingEnabled>
   <TargetBucket>my-logging-bucket</TargetBucket>
   <TargetPrefix>logs/</TargetPrefix>
   <TargetGrants>
      <Grant>
         <Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="AmazonCustomerByEmail">
            <EmailAddress>user@example.com</EmailAddress>
         </Grantee>
         <Permission>READ</Permission>
      </Grant>
   </TargetGrants>
</LoggingEnabled>
``` 