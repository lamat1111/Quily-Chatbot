# Bucket Names
There are two scenarios for bucket names:

## Bucket Name Uniqueness Requirements

| Bucket Type | Must Names Be Unique? | Description |
|-------------|----------------------|-------------|
| Public      | Yes                  | Public bucket names must be globally unique across the entire Quilibrium Network. This is because public buckets are accessible through the Public Bucket Proxy, which requires unique identifiers to properly route requests. |
| Private     | No                   | Private bucket names only need to be unique within your own account namespace. Since private buckets are only accessible with your encryption key, the same bucket name can exist across different user accounts without conflict. |

When creating a bucket, while you should consider whether you plan to make it public in the future, as this will affect your naming strategy.  

Names for buckets can be edited to be unique in the event of a naming conflict after bucket creation when making it public.

## Bucket Naming Rules
The following naming rules apply for buckets:
### General Rules
- Bucket names must be between 3 and 63 characters long.
- Bucket names can consist only of lowercase letters, numbers, periods (.), and hyphens (-).
- Bucket names must begin and end with a letter or number.
- Bucket names must not contain two adjacent periods.
- Bucket names must not be formatted as an IP address (for example, 123.456.7.8).
- Bucket names must not start with the prefix `xn--` (which allows for homoglyph attacks on subdomains)


### Additional Naming Rules
These rules are enforced, in addition to the previous general rules, to maintain a high degree of compatibility with other S3 tooling:
- Bucket names must not start with the prefix `sthree-`.
- Bucket names must not start with the prefix `amzn-s3-demo-`.
- Bucket names must not end with the suffix `-s3alias`.
- Bucket names must not end with the suffix `--ol-s3`.
- Bucket names must not end with the suffix `.mrap`.
- Bucket names must not end with the suffix `--x-s3`.


## Best Practices
- Do not use periods in bucket name, as this may create additional workload when issuing certificates for virtual-host-style addressing.
- Do not delete public buckets to reuse the name, as there is no guarantee it would not get used by another user before you can recomission it. This would allow them to get requests intended for your bucket.
- Append GUIDs in your bucket names if you don't want the name predictable.

For additional information, you can view [AWS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

