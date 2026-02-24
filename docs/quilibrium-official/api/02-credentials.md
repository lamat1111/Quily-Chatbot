---
title: Credentials
description: How to set up and manage QConsole credentials for authenticating with Quilibrium services, including configuration for CLI tools and third-party S3-compatible clients.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Credentials

Quilibrium services use a credential system to authenticate and authorize access to resources. This section covers how to set up and manage your credentials.

## Setting Up Your Credentials

There are a few ways that can manage your credentials and it will depend on what solution you want.  You can use QConsole, QKMS (cli-based tool), or other 3rd-party tools that are compatible. 

If you choose to use the 3rd-party tools, setting up credentials may take a bit of translation getting the credentials to the correct fields depending on which provider the tools was built for.

<Tabs>
  <TabItem value="qconsole" label="QConsole" default>
    QConsole provides a web interface for managing your credentials and permissions. Through QConsole, you can:
    - Create new API keys
    - Manage access permissions
    - Monitor credential usage
    - Rotate keys for security purposes
    - Can visually manage keys associated with different services in a user-interface.
  </TabItem>
  <TabItem value="qkms" label="QKMS">
    QKMS offers a dedicated service for managing cryptographic keys:
    - Centralized key management
    - Automated key rotation
    - Audit logging for key usage
    - Integration with other Quilibrium services
  </TabItem>
  <TabItem value="third-party" label="Third-Party Tools">
    Quilibrium also supports integration with third-party Key Management Service (KMS) tools:
    - Import existing keys from external KMS systems
    - Use standard protocols for key exchange
    - Maintain existing security workflows

    As QStorage is S3-compatible, you can also use something like AWS CLI.
  </TabItem>
</Tabs>

## QConsole Key Hierarchy 
QConsole keys follow a hierarchical structure similar to AWS accounts. 

This means you can create custom roles with limited permissions, allowing you to implement the principle of least privilege for different users or services accessing your resources.

## Best Practices 
When setting up credentials, always follow security best practices:
- Use unique credentials for different services
- Implement the principle of least privilege
- Regularly rotate keys
- Monitor for unauthorized access
