# Change Object Visibility

By default, all objects in QStorage are private, meaning only the object owner has permission to access them. However, you can modify object permissions to make them accessible to others or even publicly available.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Object Access Control

QStorage provides several ways to control access to your objects:

1. **Access Control Lists (ACLs)**: Define who can access objects and what actions they can perform.
2. **Bucket Policies**: Apply permissions to all objects within a bucket.
3. **Presigned URLs**: Generate temporary URLs that grant time-limited access to objects.

## Making Objects Public

You can make an object publicly accessible, allowing anyone to read it without authentication. [Read more about privacy here](/docs/api/q-storage/user-manual/privacy).

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Make an object public
qcli s3api put-object-acl --bucket bucket-name --acl public-read

# Make multiple objects public
qcli s3api put-object-acl --bucket bucket-name --prefix directory/ --acl public-read --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
External tooling may not work as intended as as the decryption key must be passed to the network in order to programatically decrypt the specified data upon request. This will likely be done via a signed url or similar method.
  </TabItem>
</Tabs>

## Making Objects Private

If you've previously made an object public, you can make it private again.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Make an object private
qcli s3api put-object-acl --bucket bucket-name --acl private

# Make multiple objects private
qcli s3api put-object-acl --bucket bucket-name --prefix directory/ --acl private --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Make an object private
aws s3api put-object-acl --bucket bucket-name --key file.txt --acl private --endpoint-url https://qstorage.quilibrium.com

# Make all objects in a bucket private
aws s3 cp s3://bucket-name/ s3://bucket-name/ --acl private --recursive --metadata-directive REPLACE --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>


## Best Practices for Object Visibility

1. **Default to Private**: Keep objects private by default and only make them public when necessary.

2. **Use Presigned URLs**: Instead of making objects public, use presigned URLs to grant temporary access.

3. **Regular Audits**: Regularly audit your object permissions to ensure they align with your security requirements.

4. **Least Privilege**: Apply the principle of least privilege by granting only the permissions necessary for the intended use case.

5. **Consider Encryption**: For sensitive data, consider using encryption in addition to access controls.