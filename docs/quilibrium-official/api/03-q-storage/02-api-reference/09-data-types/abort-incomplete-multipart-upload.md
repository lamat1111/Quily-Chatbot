---
sidebar_label: AbortIncompleteMultipartUpload
title: AbortIncompleteMultipartUpload
---

# AbortIncompleteMultipartUpload

Specifies the days since the initiation of an incomplete multipart upload that QStorage will wait before permanently removing all parts of the upload.

## Contents

### DaysAfterInitiation

Specifies the number of days after which the multipart upload becomes eligible for abort operation.

**Type**: Integer  
**Required**: Yes

## Example

```xml
<AbortIncompleteMultipartUpload>
   <DaysAfterInitiation>7</DaysAfterInitiation>
</AbortIncompleteMultipartUpload>
``` 