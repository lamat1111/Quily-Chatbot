# Privacy

QStorage is designed with privacy as a fundamental principle. When you use QStorage, your data privacy is protected through several mechanisms:

## Data Privacy

- **End-to-end encryption**: Your data is encrypted in transit and the data blob for each Object and associated metadata are encrypted with protocol encryption for storage
- **Private by default**: All objects and buckets are private unless explicitly made public
- **Access control**: Fine-grained permissions allow you to fine-tune who can access what data

## Making QStorage Data Public

While making Buckets or Objects public doesn't expose your decryption key, you do pass the network your key so that the [Public Bucket Proxy](/docs/api/q-storage/user-manual/working-with-buckets/edit-bucket-visibility#public-bucket-proxy) can decrypt the necessary public data when an agent (user or program) requests it. 

This key is still not visible to other parties, as the decryption is handled behind the proxy and those requesting the data receive the unencrypted data on the other side of the proxy.

## Metadata Privacy

Quilibrium Inc. and the underlying network do not have access to any metadata and the billing is done by the network.

All other metadata is encrypted and inaccessible to Quilibrium or the network operators. Only public data (data that you have explicitly made public) is visible to others. For more information on how QStorage handles data privacy and encryption, please check out the [Learn section on block storage](/docs/learn/block-storage).

## User Control

You maintain complete control over:
- Who can access your data
- How long your data is stored
- What information is made public

## Compliance

QStorage's privacy-first approach helps you meet regulatory requirements while maintaining the security and confidentiality of your data.
