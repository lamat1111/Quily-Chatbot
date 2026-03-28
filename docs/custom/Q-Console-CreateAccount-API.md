---
title: "Q Console: Programmatic Account Creation API"
source: Community Contribution (Issue #44)
date: 2026-03-28
type: technical_reference
topics: [q-console, QNZM, API, account-creation, wallet-auth, IAM]
---

# Q Console: Programmatic Account Creation API

## Overview

Q Console accounts can be created programmatically via the QNZM API. All QNZM actions follow the IAM spec, but account creation uses wallet-based authentication rather than standard IAM credentials (since the caller does not yet have an account).

## Endpoint

**All QNZM actions** use the same endpoint format:

- **Method:** `POST /`
- **Content-Type:** Form parameters
- **Response format:** XML (unless otherwise noted)

Every response includes a `<ResponseMetadata>` block:

```xml
<ResponseMetadata>
  <RequestId>uuid</RequestId>
</ResponseMetadata>
```

## CreateAccount

### Authentication

Wallet authentication via the `X-QNZM-Auth` header. This is the only QNZM action that uses wallet auth; all other actions use standard IAM credentials obtained from the account creation response.

### Request Parameters

| Parameter     | Required | Description                                              |
|---------------|----------|----------------------------------------------------------|
| `Action`      | Yes      | Must be `CreateAccount`                                  |
| `AccountName` | No       | Defaults to the value of `Email`, or `"default"` if both are omitted |
| `Email`       | No       | Optional email address to associate with the account     |

### Response

```xml
<CreateAccountResponse xmlns="https://iam.amazonaws.com/doc/2010-05-08/">
  <CreateAccountResult>
    <Account>
      <AccountId>string</AccountId>
      <AccountName>string</AccountName>
      <Email>string</Email>
      <EthAddress>string</EthAddress>       <!-- or QuilibriumKey, depending on sig type -->
      <QuilibriumKey>string</QuilibriumKey>
      <Arn>string</Arn>
      <CreateDate>RFC3339</CreateDate>
    </Account>
    <RootUser>
      <Path>string</Path>
      <UserName>string</UserName>
      <UserId>string</UserId>
      <Arn>string</Arn>
      <CreateDate>RFC3339</CreateDate>
    </RootUser>
    <AccessKey>
      <UserName>string</UserName>
      <AccessKeyId>string</AccessKeyId>
      <Status>Active</Status>
      <SecretAccessKey>string</SecretAccessKey>
      <CreateDate>RFC3339</CreateDate>
    </AccessKey>
  </CreateAccountResult>
  <ResponseMetadata>
    <RequestId>uuid</RequestId>
  </ResponseMetadata>
</CreateAccountResponse>
```

### Response Fields

**Account:**
- `AccountId` -- Unique identifier for the new account
- `AccountName` -- Display name (defaults to email or "default")
- `Email` -- Email address if provided
- `EthAddress` -- Ethereum-compatible address (present when using Ethereum signature type)
- `QuilibriumKey` -- Quilibrium native key (present when using Quilibrium signature type)
- `Arn` -- Amazon Resource Name-style identifier for the account
- `CreateDate` -- RFC3339-formatted creation timestamp

**RootUser:**
The root IAM user automatically created for the account, with its own `Path`, `UserName`, `UserId`, `Arn`, and `CreateDate`.

**AccessKey:**
The initial access credentials for API access:
- `AccessKeyId` -- Use this as your access key for subsequent API calls
- `SecretAccessKey` -- Secret key (only returned at creation time; store securely)
- `Status` -- Always `Active` for newly created keys

## Usage Notes

- The `EthAddress` or `QuilibriumKey` field in the Account response depends on the wallet signature type used in the `X-QNZM-Auth` header.
- After account creation, use the returned `AccessKeyId` and `SecretAccessKey` for all subsequent QNZM/IAM API calls (standard IAM auth, not wallet auth).
- All other QNZM actions follow the standard IAM spec. See the API Credentials and Authentication guide for details on managing keys, roles, and permissions after account creation.
