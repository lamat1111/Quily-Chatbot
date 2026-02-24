# What is an Object

QStorage is an object store that uses unique key-values to store as many objects as you want. You store these objects in one or more buckets, and each object can be up to 5 TB in size. An object consists of the following:

## Key

The name that you assign to an object. You use the object key to retrieve the object. The object key is the complete path to an object in a bucket, including the object name.

For example, if you upload an object named `document.txt` to a folder named `reports` in a bucket, the key name is `reports/document.txt`. However, the object is displayed in the console as `document.txt` in the `reports` folder.

## Value

The content that you are storing. An object value can be any sequence of bytes. Objects can range in size from zero to 5 TB.

## Metadata

A set of name-value pairs with which you can store information regarding the object. There are two kinds of metadata:

### System-defined Metadata

QStorage maintains a set of system metadata for each object stored in a bucket. QStorage processes this system metadata as needed. For example, QStorage maintains object creation date and size metadata and uses this information as part of object management.

System metadata falls into two categories:
- **System controlled**: Metadata such as the object creation date, which only QStorage can modify.
- **User controlled**: Metadata such as user-added tags configured for the object, which you can control.

### User-defined Metadata

When uploading an object, you can also assign your own metadata to the object. This user-defined metadata is stored with the object and returned when you download the object. User-defined metadata is a set of name-value pairs that you specify when uploading an object.

## Access Control Information

You can control access to the objects you store in QStorage. QStorage supports both resource-based access control (such as access control lists) and user-based access control.

Your QStorage resources (for example, buckets and objects) are private by default. You must explicitly grant permission for others, e.g. make them public, to access these resources.

## Tags

You can use tags to categorize your stored objects for access control or cost allocation. Each tag is a key-value pair, and you can assign up to 10 tags per object.