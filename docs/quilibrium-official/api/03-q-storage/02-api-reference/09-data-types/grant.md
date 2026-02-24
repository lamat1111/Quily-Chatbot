---
sidebar_label: Grant
title: Grant
---

# Grant

Container for grant information.

## Contents

### Grantee

The person being granted permissions.

**Type**: Grantee  
**Required**: Yes

### Permission

Logging permissions assigned to the grantee for the bucket.

**Type**: String  
**Valid Values**: `READ | WRITE | READ_ACP | WRITE_ACP | FULL_CONTROL`  
**Required**: Yes

## Example

```xml
<Grant>
   <Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="AmazonCustomerByEmail">
      <EmailAddress>user@example.com</EmailAddress>
   </Grantee>
   <Permission>READ</Permission>
</Grant>
```

## Grantee Type

The Grantee type specifies who is being granted the permissions. This can be specified using:

- Email address of the AWS account
- ID of the AWS account
- URI of a predefined group

### Example

```xml
<Grant>
  <Grantee>
    <ID>user-id</ID>
    <DisplayName>user-name</DisplayName>
  </Grantee>
  <Permission>FULL_CONTROL</Permission>
</Grant>
```

## Usage

The Grant type is used in operations that manage access control lists (ACLs) for buckets and objects, such as:

- PutBucketAcl
- PutObjectAcl
- CreateBucket (when specifying ACLs)

When using grant-related headers (e.g. x-amz-grant-read), the value should be a comma-separated list of grants where each grant is in the format: `id=ID, emailAddress=EMAIL_ADDRESS, uri=URI`
