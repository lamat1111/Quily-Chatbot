---
title: ImportingKeyMaterial
sidebar_label: ImportingKeyMaterial
---

# Importing Key Material

This guide explains how to import key material into a QKMS key.

## Overview

QKMS allows you to import your own key material to use with your KMS keys. This gives you more control over the generation and management of your cryptographic keys.

## Prerequisites

Before importing key material, ensure you have:
- Created a KMS key without key material
- Necessary permissions to perform key import operations
- Key material ready in the correct format

## Process

The key material import process involves three main steps:

1. Get import parameters using `GetParametersForImport`
2. Prepare your key material using the provided wrapping key
3. Import the wrapped key material using `ImportKeyMaterial`

## Detailed Steps

[Coming Soon]

## Best Practices

[Coming Soon]

## Related Operations

- `GetParametersForImport`
- `ImportKeyMaterial`
- `DeleteImportedKeyMaterial` 