---
title: Q Service APIs
label: Q Service APIs
---
# Using Q Services APIs

Quilibrium's APIs are designed to provide access to the Quilibrium Network, offering developers a toolset for creating the world's censorship-resistant and decentralized applications. 

Each API is built with privacy-first principles and takes full advantage of Quilibrium's open-source, privacy-respecting, decentralized infrastructure to deliver enterprise-grade functionality without compromising on security or user/developer autonomy.

To learn more about how Q accomplishes this, read more in the [Discover](/docs/discover/q-story) section.

## API Documentation

For comprehensive documentation on all Quilibrium services and APIs, please visit our [API Documentation](/docs/api/overview) section. This resource provides detailed information on endpoints, request formats, response structures, and examples to help you integrate Quilibrium services into your applications effectively.


## Service Credentials
To access and manage resources on the Quilibrium Network, you'll need to set up and use QConsole credentials. These credentials follow a hierarchical structure that allows for fine-grained access control and permission management.

For detailed instructions on how to set up and manage your credentials, see the [QConsole Credentials](/docs/api/credentials) guide.


## Available Services

### [QStorage](/docs/api/q-storage/overview)
A robust object storage service that leverages the Quilibrium Network's distributed architecture to provide secure, scalable, and high-performance data storage and retrieval capabilities.
#### S3 Compatibility
This is a S3-compatible service, meaning developers can leverage other S3-compatible SDK or CLI tooling by pointing it to Quilibrium's endpoint with little to no changes. 

### [QKMS (Key Management System)](/docs/api/q-kms/overview)
A sophisticated key management system designed for secure multi-party key management, providing a foundation for cryptographic operations within the Quilibrium ecosystem.
#### KMS Compatibility
Similarly to the S3 service, this can use existing KMS toolsets by changing their endpoints to Quilibrium's.

<!-- ## Planned Services -->
<!-- TBD: need to find list of services -->
