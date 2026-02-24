---
sidebar_position: 2
---

# Hosting Websites on Quilibrium

Quilibrium offers a flexible environment for hosting both **static** and **dynamic** websites, leveraging decentralized storage and computation primitives. Here's how it works:

## Hosting Static Websites

If your website is static (HTML, CSS, JavaScript), you can simply upload the files to **QStorage**, Quilibrium’s decentralized object storage system. Once uploaded, your site will be served through a **QStorage Proxy**. This proxy handles public CNAME dispatch, making your website accessible through a standard web URL.

At the DNS level, you initially point your domain to the proxy endpoint. In the near future, Quilibrium will introduce **MPCTLS**, a mechanism allowing you to bind your domain's A records directly to a Quilibrium node, enhancing trust and decentralization.

No backend server is needed for serving static content.

## Building Dynamic Websites

Dynamic behavior — like reading from or writing to storage, or performing private computation — is handled differently. Rather than maintaining a traditional backend server, your frontend can communicate directly with Quilibrium services using the provided SDKs:

- **QStorage SDK**: for interacting with stored objects.
- **QKMS SDK**: for managing key-based authentication and authorization.
- **Q MPC SDK**: for private, multi-party computation if needed.

This approach lets you build full-featured dynamic applications without traditional cloud servers.

If you only need basic data storage and retrieval, you can accomplish everything through the SDKs — **no QCL code is required**.

However, if your application needs **private validation** (such as verifying conditions before writing data), you can optionally deploy small programs written in **QCL**.  
QCL is Quilibrium’s computation language, designed for privacy and verifiability. It supports a curated subset of the Go standard library, focused on cryptographic, encoding, and mathematical operations.

When a user interacts with the system, the full flow looks like this:

### 1. User requests the website

![User requests website diagram](/img/api/dynamic-websites-user-request-diagram.jpg)

### 2. User attempts to write data, triggering private validation

![Validity check diagram](/img/api/dynamic-websites-validity-check-diagram.jpg)

### 3. Validation succeeds and data is stored

![Storage confirmation diagram](/img/api/dynamic-websites-storage-confirmation-diagram.jpg)

These steps illustrate how the browser, the storage proxy, the QKMS service, and (optionally) QCL computation all cooperate to maintain data integrity without needing a centralized backend.


## Handling Authentication

When users write data (for instance, uploading files or submitting forms), authentication must be handled carefully. Instead of a centralized backend issuing tokens, Quilibrium uses **QKMS keys** pinned to nodes to manage secure operations. Your application signs requests locally using the QKMS SDK, and the network verifies them against the pinned key.

Running your own Q node gives you full control over key management. Alternatively, you can delegate this responsibility to **Q Inc services** if you prefer a managed solution.

## Summary

For static sites, Quilibrium behaves much like a decentralized S3 bucket with a proxy.  
For dynamic functionality, it replaces backend servers with secure SDKs and optional QCL programs for private logic — allowing your app to remain fully decentralized, yet dynamic and interactive.
