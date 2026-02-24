---
sidebar_position: 2
sidebar_label: Setting Up Credentials
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Credentials

Setting up credentials for QStorage will require at the minimum the following requirements:

| Credential | Value | Example |
|---|---|---|
| Access Key ID | Alphanumeric String | ABCDEF12D213546709A |
| Account ID | Integer | 1000000000 |
| Secret Key | String | AbcdI32/daY+jjad4M... |
| Endpoint | `https://qstorage.quilibrium.com` | N/A |
| Region   | `q-world-1` | N/A |

## Setting Up Your Credentials

There are a few ways that you can manage your credentials depending on your preferred solution. You can use Q CLI or other 3rd-party tools that are compatible with S3.

<Tabs>
  <TabItem value="q-cli" label="Q CLI" default>
   Coming soon
  </TabItem>
  <TabItem value="third-party" label="Third-Party CLI">
    For example: using AWS CLI you can edit your credential files:
    ```bash
    # ~/.aws/config
    [default]
    region = q-world-1
    ```
    and
    ```bash
    # ~/.aws/credentials
    [default]
    aws_access_key_id = Secret Key ID
    aws_secret_access_key = Secret Access Key
    aws_account_id = Account ID
    services = qstorage

    [services qstorage]
    s3 =
      endpoint_url = https://qstorage.quilibrium.com
    ```
  </TabItem>
</Tabs>

