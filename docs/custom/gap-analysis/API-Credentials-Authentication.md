---
title: "Quilibrium API Credentials & Authentication"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - API credentials
  - authentication
  - HMAC
  - access keys
  - secret keys
  - Q Console
  - QStorage credentials
  - QKMS credentials
---

# Quilibrium API Credentials & Authentication

Quilibrium provides a suite of cloud-compatible APIs that allow developers to interact with the Quilibrium Network. All API access is authenticated using a credential system modeled after AWS IAM, making it familiar to developers who have worked with Amazon Web Services. This document covers the credential types, how to create and manage them, and how they are used across Quilibrium services.

## Available API Services

Quilibrium currently offers two production services, both accessible through authenticated API calls:

- **QStorage** -- An S3-compatible object storage service for secure, decentralized data storage and retrieval. Endpoint: `https://qstorage.quilibrium.com`
- **QKMS (Key Management Service)** -- A KMS-compatible service for managing cryptographic keys using Multi-Party Computation (MPC), supporting symmetric, asymmetric, elliptic curve, HMAC, and other key types.

Both services are designed as drop-in replacements for their AWS equivalents. Existing S3 clients, SDKs, and CLI tools work with QStorage by changing the endpoint. Similarly, existing KMS toolsets work with QKMS by redirecting to Quilibrium's endpoint.

## Credential Components

To authenticate with Quilibrium APIs, you need the following credential components:

| Component | Format | Example |
|-----------|--------|---------|
| **Access Key ID** | Alphanumeric string | `ABCDEF12D213546709A` |
| **Secret Access Key** | String with special characters | `AbcdI32/daY+jjad4M...` |
| **Account ID** | Integer | `1000000000` |
| **Endpoint** | URL | `https://qstorage.quilibrium.com` |
| **Region** | String | `q-world-1` |

The Access Key ID identifies who is making a request. The Secret Access Key is used to sign requests cryptographically. The Account ID associates credentials with a specific Q Console account. The region for Quilibrium services is `q-world-1`.

## How to Create Credentials

There are three ways to set up and manage credentials, depending on your workflow and tooling preferences.

### Using Q Console (Recommended)

Q Console is Quilibrium's web-based management interface. Through Q Console you can:

- Create new API keys for QStorage and QKMS
- Manage access permissions using a hierarchical key structure
- Monitor credential usage
- Rotate keys for security purposes
- Visually manage keys associated with different services

Q Console keys follow a hierarchical structure similar to AWS accounts. This means you can create custom roles with limited permissions, implementing the principle of least privilege for different users or services accessing your resources. Q Console also supports cross-account asset sharing, allowing composability between different accounts -- a feature that goes beyond what AWS IAM offers.

### Using QKMS

QKMS itself offers a dedicated service for managing cryptographic keys, including:

- Centralized key management
- Automated key rotation
- Audit logging for key usage
- Integration with other Quilibrium services (e.g., using QKMS keys to encrypt data stored in QStorage)

### Using Third-Party Tools

Because QStorage is S3-compatible and QKMS is KMS-compatible, you can use existing third-party tools such as the AWS CLI. You may need to map credential fields appropriately depending on which tool you use.

## Authentication Mechanism: HMAC Request Signing

QStorage and QKMS use the same HMAC-based authentication mechanism as Amazon S3 and AWS KMS (AWS Signature Version 4). Each API request is signed using your Secret Access Key, and the service verifies the signature using your Access Key ID.

The signing process works as follows:

1. Construct a canonical request from the HTTP method, URI, query parameters, headers, and payload hash.
2. Create a string to sign that includes the date, region (`q-world-1`), service name, and the hash of the canonical request.
3. Derive a signing key from your Secret Access Key, the date, region, and service.
4. Compute an HMAC-SHA256 signature using the derived key and the string to sign.
5. Include the signature in the `Authorization` header of the request.

In practice, S3-compatible SDKs and CLI tools handle this signing automatically. You only need to provide your Access Key ID and Secret Access Key.

## Configuring Credentials for QStorage

### Using Quilibrium's CLI (qcli)

```bash
# Configure your credentials
qcli configure

# Verify by listing buckets
qcli s3 ls
```

The `qcli` tool automatically uses the correct QStorage endpoint and authentication settings.

### Using AWS CLI

To use the AWS CLI with QStorage, configure your credentials files as follows:

```ini
# ~/.aws/config
[default]
region = q-world-1
```

```ini
# ~/.aws/credentials
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
aws_account_id = YOUR_ACCOUNT_ID
services = qstorage

[services qstorage]
s3 =
  endpoint_url = https://qstorage.quilibrium.com
```

Then use S3 commands with the QStorage endpoint:

```bash
aws s3 ls --endpoint-url https://qstorage.quilibrium.com
```

### Using Any S3-Compatible SDK

Point any S3-compatible SDK (boto3, MinIO client, etc.) to `https://qstorage.quilibrium.com` with your Q Console Access Key ID and Secret Access Key. No region-specific configuration is required beyond setting `q-world-1`.

## Configuring Credentials for QKMS

QKMS uses the same Q Console credentials as QStorage. The authentication mechanism is identical -- HMAC-based request signing with your Access Key ID and Secret Access Key. Redirect your KMS-compatible toolset to Quilibrium's QKMS endpoint.

QKMS uses Multi-Party Computation (MPC) under the hood, meaning key operations are distributed and Quilibrium never acts as a key custodian. When using the Q Console browser interface, a delegate key is created to handle MPC operations client-side. When using the API directly, additional tooling alongside the SDK may be needed for MPC steps -- Q Console and the documentation site provide instructions for this.

## Multi-Account Hierarchy

Quilibrium supports an AWS-style multi-account hierarchical structure for both QStorage and QKMS APIs. This allows organizations to:

- Create sub-accounts with scoped permissions
- Delegate access to specific buckets or keys
- Share assets across accounts (a capability that extends beyond AWS IAM's cross-account features)
- Implement role-based access control

## Verifiable Encryption and Data Security

QStorage uses verifiable encryption for data stored on the network. Data is encrypted at rest, even for public buckets (the free tier replicates across multiple Q Inc data centers in multiple geographic regions). For private buckets, data is only accessible to holders of the appropriate key material.

When using the browser interface through Q Console, a delegate key is created for browser-based decryption. When accessing data through the S3 API without a Q Console-created key to dispatch proxy calls, encrypted data cannot be decrypted. This means credentials alone are not sufficient for private data -- the corresponding key material from Q Console or QKMS is also required.

## Security Best Practices

Follow these practices when managing Quilibrium API credentials:

- **Use unique credentials per service** -- Create separate Access Key / Secret Key pairs for QStorage and QKMS if possible.
- **Apply least privilege** -- Use Q Console's hierarchical key structure to grant only the permissions each user or service requires.
- **Rotate keys regularly** -- Q Console supports key rotation. Schedule periodic rotation and update all systems that use the rotated credentials.
- **Monitor for unauthorized access** -- Use Q Console to review credential usage and audit logs.
- **Never expose Secret Access Keys** -- Do not commit Secret Access Keys to version control, embed them in client-side code, or transmit them in plaintext.
- **Use environment variables or credential files** -- Store credentials in `~/.aws/credentials` or environment variables rather than hardcoding them.

## Frequently Asked Questions

**Q: Are Quilibrium API credentials the same as AWS credentials?**
A: They follow the same format and signing mechanism (HMAC / AWS Signature V4), but they are separate credentials issued through Q Console. You cannot use AWS credentials with Quilibrium services or vice versa.

**Q: Can I use the same credentials for QStorage and QKMS?**
A: Yes. Both services use Q Console credentials. A single Access Key / Secret Key pair can authenticate to both services, subject to the permissions assigned to that key.

**Q: What region do I specify?**
A: Use `q-world-1` for all Quilibrium services. The network is globally distributed, so there is no need to select a geographic region.

**Q: Do I need special setup for QKMS MPC operations?**
A: When using Q Console's browser interface, MPC operations run client-side automatically. When using the API directly, you may need additional tooling alongside the SDK for the client-side MPC steps. Refer to Q Console or the documentation site for setup instructions.

**Q: Is my data safe if my credentials are compromised?**
A: For private buckets, QStorage uses verifiable encryption. Credentials alone are not sufficient to decrypt private data -- the corresponding key material is also required. However, you should still immediately rotate compromised credentials through Q Console to prevent unauthorized bucket or object operations.

**Q: What happens if I use the AWS CLI without configuring the QStorage endpoint?**
A: Your requests will go to AWS instead of Quilibrium. Always specify `--endpoint-url https://qstorage.quilibrium.com` or configure it in your AWS config file under a services section.

*Last updated: 2026-02-11T15:00:00*
