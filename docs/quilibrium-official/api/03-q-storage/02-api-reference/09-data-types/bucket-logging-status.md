---
sidebar_label: BucketLoggingStatus
title: BucketLoggingStatus
---

# BucketLoggingStatus

Root level tag for the BucketLoggingStatus parameters.

## Contents

### LoggingEnabled

Describes where logs are stored and the prefix that QStorage assigns to all log object keys for a bucket.

**Type**: LoggingEnabled  
**Required**: No

## Example

```xml
<BucketLoggingStatus xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
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
</BucketLoggingStatus>
``` 