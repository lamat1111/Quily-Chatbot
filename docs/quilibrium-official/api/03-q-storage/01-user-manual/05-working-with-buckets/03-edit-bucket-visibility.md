# Making a Bucket Public

Bucket visibility is straight forward: 
- S3 Buckets and Objects are by default private and will not be publicly exposed until set otherwise.
- No key = no data (unless the key holder has set that data to public)
- Scopes for that key must allow read.

## Setting a Private Bucket to Public
```
# Instructions to follow
```

## Accessing Private Buckets or Objects
In order to access uploaded data or even know of it's existance in the network, users must have the original key used to encrypt the data.

The design of the network is such that there is no way to query against or determine if that data even exists on the network, even by the original uploader, if the correct key is not provided.

The caveat to this is if the owner of the file sets an Object or Bucket to Public. However, this is merely a technicality, as the original uploader is essentially allowing their key (behind a proxy) to be used to decrypt selected data.

## Accessing Public Buckets or Objects
When a Bucket or Objects are made public, they are associated with what is called a "Public Bucket Proxy", essentially a publicly available proxy in which can be queried against by the public.  

This proxy stores a cache of bucket and file names which have been associated with the bucket proxy.

Decryption happens behind the scenes after a user requests a file/bucket that has been flagged as public.


### Public Bucket Proxy 
Public access is allowed through a series of actions such that the private content with a public flag exists exactly the same as if it was private, the difference being that Bucket Names and Object Keys are exposed. 

The Public Bucket Proxy communicates with the network to request data with a user's provided key (not accessible to the public) to find the network-hosted private Buckets or Objects. 

Once found, the network fetches and decrypts data without the user accessing the actual buckets/objects themselves.  

The Public Proxy process works as follows:
1. A program or user sends a request to the public bucket proxy
2. There will be a set of cached bucket and file names that can be requested
3. The requested file or bucket will be looked up inside the network 
4. If found, the data will be decrypted using the configured key
5. Once decrypted, that data will be sent back to the proxy
6. The proxy server sends the unencrypted data to the original request (as a response)