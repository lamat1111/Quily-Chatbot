---
title: "Quilibrium Tech Tree — Development Roadmap"
source: qstorage.quilibrium.com/techtree (automated weekly)
date: 2026-03-23
type: roadmap
topics:
  - tech tree
  - roadmap
  - development status
  - web services
  - AWS compatible
  - planned features
  - what is being built
  - quilibrium services
  - feature status
---

# Quilibrium Tech Tree — Development Roadmap

**Last updated:** March 23, 2026
**Source:** [Interactive Tech Tree](https://qstorage.quilibrium.com/techtree/index.html) — a visual, explorable graph of every component in the Quilibrium ecosystem. Users can scroll, zoom, and click on individual items to see details and dependencies.

## Overview

The Quilibrium Tech Tree maps out every component being built across the protocol, cryptographic primitives, consumer products, and cloud-compatible web services. It tracks 248 meaningful components across 4 categories.

| Status | Count | Percentage |
|---|---|---|
| Shipped | 37 | 14.9% |
| In Development | 8 | 3.2% |
| Planned | 203 | 81.9% |

## Protocol

3 shipped, 3 in development, 0 planned.

| Component | Description | Status |
|---|---|---|
| Dispatch Queue | Protocol feature for coordinating ordered message dispatch between participants (used for MPC workflows, etc.). | Shipped |
| Hypersnap | Snapchain, decentralized and hyperdimensional | Shipped |
| Protocol | Core protocol substrate (networking, consensus, state, lifecycle). | Shipped |
| EVM Shard | EVM-compatible app shard, supporting rollup follower mode or EVM raw execution | In Development |
| KLEARU | E2EE ML Training and Inference | In Development |
| MetaVM | Virtualization runtime for RISC-V | In Development |

## Cryptography

12 shipped, 0 in development, 0 planned.

| Component | Description | Status |
|---|---|---|
| AEAD / Symmetric Encryption | Authenticated encryption primitives (e.g., AES-GCM/ChaCha20-Poly1305 style). | Shipped |
| channels | e2ee encrypted channels | Shipped |
| Commitments | Commitment schemes used for state and proofs. | Shipped |
| Crypto Intrinsics | Core cryptographic primitives and proof systems used across the stack. | Shipped |
| Hash Functions | Hashing primitives and hash-to-curve utilities used across the stack. | Shipped |
| KDF / HKDF | Key derivation functions for session keys and envelopes. | Shipped |
| KZG Commitments | Polynomial commitment interface and helpers (KZG-style). | Shipped |
| Merkle / Vector Commitments | Tree and vector commitment helpers used by tries/state. | Shipped |
| Ristretto/Decaf-style group ops | Prime-order group abstractions for privacy primitives. | Shipped |
| Scalar/Field Arithmetic | Field helpers / serialization / domain separation. | Shipped |
| Signatures | Digital signature schemes used by clients and protocol messages. | Shipped |
| VRF / VDF Helpers | Verifiable randomness / delay-related helper primitives. | Shipped |

## Consumer

16 shipped, 3 in development, 0 planned.

| Component | Description | Status |
|---|---|---|
| Authentication & Onboarding | Account creation, key setup, sign-in, and first-run flows. | Shipped |
| Contacts & Identity | Contact book, identity display, QR/invite flows. | Shipped |
| Local Storage & Cache | On-device persistence, caching, and offline behavior. | Shipped |
| Media & Attachments | File/image attachment handling and viewer UX. | Shipped |
| Messaging | Direct and space messaging UI and transport integration. | Shipped |
| Mini apps | Researching new horizons. | Shipped |
| Mobile App Shell | Core mobile application container, navigation, and bootstrapping. | Shipped |
| Notifications | Push/local notifications and in-app alerts. | Shipped |
| On-device Crypto Module | Device crypto (keys, signing, encryption) module integration. | Shipped |
| Quorum | Consumer product foundation for Quorum mobile and its user-facing experiences. | Shipped |
| Service Layer | Network/service abstraction used by the app. | Shipped |
| Settings & Preferences | User settings, privacy toggles, account management. | Shipped |
| Social Feed | Researching new horizons. | Shipped |
| Spaces | Community spaces (Discord-like servers) and membership management. | Shipped |
| UI Component Library | Reusable UI primitives for consistent screens. | Shipped |
| Wallet | Researching new horizons. | Shipped |
| Group Wallet (Spaces) | Space-controlled group wallet UI (surfacing MPC wallet control). | In Development |
| Video Calls | Researching new horizons. | In Development |
| Voice Calls | Researching new horizons. | In Development |

## Web Services

6 shipped, 2 in development, 203 planned.

| Service | Description | AWS Equivalent | Status |
|---|---|---|---|
| QKMS | KMS-compatible API backed by MPC key operations and secure dispatch coordination. | KMS | Shipped |
| QName | DNS-like naming/identity service with programmable controls. | Route 53 | Shipped |
| QNZM | Built on Quilibrium; depends on Hypergraph state and schema repository. | IAM | Shipped |
| QPing | Built on Quilibrium; uses protocol Dispatch Queue semantics. | SNS | Shipped |
| QQ | Built on Quilibrium; uses protocol Dispatch Queue semantics. | SQS | Shipped |
| QStorage | S3-compatible object storage API and bucket website hosting. | S3 | Shipped |
| F(x) | Lambda-compatible serverless compute API. | Lambda | In Development |
| Relational | Managed relational + Cassandra-compatible database service. | RDS/Keyspaces | In Development |
| Alchemist | (Internal codename: Alchemist.) | SageMaker | Planned |
| Amber Delta | (Internal codename: Amber Delta.) | Redshift | Planned |
| Amber Fjord | (Internal codename: Amber Fjord.) | Inspector | Planned |
| Amber Forge | (Internal codename: Amber Forge.) | PrivateLink | Planned |
| Amber Grotto | (Internal codename: Amber Grotto.) | MemoryDB | Planned |
| Amber Pylon | (Internal codename: Amber Pylon.) | IoT Device Management | Planned |
| Amber Sanctum | (Internal codename: Amber Sanctum.) | Elastic File System | Planned |
| Amber Spindle | (Internal codename: Amber Spindle.) | Chime SDK | Planned |
| Amber Workshop | (Internal codename: Amber Workshop.) | Control Tower | Planned |
| Arctic Cairn | (Internal codename: Arctic Cairn.) | ParallelCluster | Planned |
| Arctic Coffer | (Internal codename: Arctic Coffer.) | WAF | Planned |
| Arctic Forge | (Internal codename: Arctic Forge.) | Managed Services | Planned |
| Arctic Foundry | (Internal codename: Arctic Foundry.) | OpenSearch Service | Planned |
| Arctic Lattice | (Internal codename: Arctic Lattice.) | QuickSight | Planned |
| Arctic Relay | (Internal codename: Arctic Relay.) | DeepRacer | Planned |
| Arctic Ridge | (Internal codename: Arctic Ridge.) | Elemental MediaConvert | Planned |
| Arctic Switch | (Internal codename: Arctic Switch.) | Database Migration Service | Planned |
| Atlas Kiln | (Internal codename: Atlas Kiln.) | Elemental MediaStore | Planned |
| Atlas Lattice | (Internal codename: Atlas Lattice.) | Clean Rooms | Planned |
| Atlas Quarry | (Internal codename: Atlas Quarry.) | Ground Station | Planned |
| Atlas Ridge | (Internal codename: Atlas Ridge.) | FSx | Planned |
| Atlas Sanctum | (Internal codename: Atlas Sanctum.) | Forecast | Planned |
| Atlas Silo | (Internal codename: Atlas Silo.) | IoT Events | Planned |
| Atlas Summit | (Internal codename: Atlas Summit.) | Textract | Planned |
| Atlas Workshop | (Internal codename: Atlas Workshop.) | Chime | Planned |
| Basalt Delta | (Internal codename: Basalt Delta.) | Entity Resolution | Planned |
| Basalt Mesa | (Internal codename: Basalt Mesa.) | Device Farm | Planned |
| Basalt Tide | (Internal codename: Basalt Tide.) | IAM Access Analyzer | Planned |
| Basalt Vault | (Internal codename: Basalt Vault.) | Elemental MediaPackage | Planned |
| Beacon Coffer | (Internal codename: Beacon Coffer.) | Elemental MediaTailor | Planned |
| Beacon Forge | (Internal codename: Beacon Forge.) | Timestream | Planned |
| Beacon Grotto | (Internal codename: Beacon Grotto.) | API Gateway | Planned |
| Beacon Silo | (Internal codename: Beacon Silo.) | Cloud9 | Planned |
| Boreal Spindle | (Internal codename: Boreal Spindle.) | Lex | Planned |
| Bright Grotto | (Internal codename: Bright Grotto.) | QLDB | Planned |
| Bright Kiln | (Internal codename: Bright Kiln.) | Proton | Planned |
| Bright Library | (Internal codename: Bright Library.) | End User Messaging | Planned |
| Cairn Coffer | (Internal codename: Cairn Coffer.) | Resource Explorer | Planned |
| Cairn Dock | (Internal codename: Cairn Dock.) | Security Hub | Planned |
| Cairn Fjord | (Internal codename: Aurora Dock.) | EC2 Auto Scaling | Planned |
| Cairn Gale | (Internal codename: Cairn Gale.) | FIS | Planned |
| Cairn Lattice | (Internal codename: Cairn Lattice.) | CloudHSM | Planned |
| Cairn Observatory | (Internal codename: Cairn Observatory.) | Migration Hub | Planned |
| Cairn Ridge | (Internal codename: Cairn Ridge.) | Glue | Planned |
| Cairn Weave | (Internal codename: Cairn Weave.) | WorkDocs | Planned |
| Chainyard | Managed blockchain networks and node operations. | Managed Blockchain | Planned |
| Cinder Cairn | (Internal codename: Atlas Aurora.) | AI Operations | Planned |
| Cinder Delta | (Internal codename: Cinder Delta.) | EKS | Planned |
| Cinder Fjord | (Internal codename: Cinder Fjord.) | Fraud Detector | Planned |
| Cinder Foundry | (Internal codename: Cinder Foundry.) | VPN | Planned |
| Cinder Kiln | (Internal codename: Cinder Kiln.) | CodePipeline | Planned |
| Cinder Torrent | (Internal codename: Cinder Torrent.) | Organizations | Planned |
| Cinder Vault | (Internal codename: Cinder Vault.) | Aurora | Planned |
| Cinder Weave | (Internal codename: Cinder Weave.) | B2B Data Interchange | Planned |
| Cobalt Canopy | (Internal codename: Cobalt Canopy.) | Transcribe | Planned |
| Cobalt Lattice | (Internal codename: Verdant Aurora.) | Step Functions | Planned |
| Cobalt Relay | (Internal codename: Cobalt Relay.) | CodeBuild | Planned |
| Cobalt Sanctum | (Internal codename: Cobalt Sanctum.) | Direct Connect | Planned |
| Cobalt Tide | (Internal codename: Cobalt Tide.) | HealthImaging | Planned |
| Copper Constellation | (Internal codename: Copper Constellation.) | FreeRTOS | Planned |
| Copper Gale | (Internal codename: Copper Gale.) | Billing and Cost Management | Planned |
| Copper Hearth | (Internal codename: Copper Hearth.) | Application Migration Service | Planned |
| Copper Pylon | (Internal codename: Copper Pylon.) | Pinpoint | Planned |
| Copper River | (Internal codename: Copper River.) | DevOps Guru | Planned |
| Copper Tide | (Internal codename: Copper Tide.) | Translate | Planned |
| Crimson Mesa | (Internal codename: Crimson Mesa.) Includes variants: Aurora Beacon. | IoT Greengrass V1 | Planned |
| Crimson Weave | (Internal codename: Crimson Weave.) | IoT FleetWise | Planned |
| Deep Cairn | (Internal codename: Arctic Aurora.) | Batch | Planned |
| Deep Forge | (Internal codename: Deep Forge.) | Global Networks for Transit Gateways | Planned |
| Deep Grotto | (Internal codename: Deep Grotto.) | Audit Manager | Planned |
| Deep Hearth | (Internal codename: Deep Hearth.) | IAM Roles Anywhere | Planned |
| Deep Ledger | (Internal codename: Deep Ledger.) | Billing Conductor | Planned |
| Deep Pylon | (Internal codename: Deep Pylon.) | AppSync | Planned |
| Deep Sanctum | (Internal codename: Deep Sanctum.) | Outposts | Planned |
| Forge Atlas | (Internal codename: Forge Atlas.) | IoT TwinMaker | Planned |
| Forge Canyon | (Internal codename: Forge Canyon.) Includes variants: Cinder Mesa. | WorkSpaces | Planned |
| Forge Delta | (Internal codename: Forge Delta.) | Snow Family | Planned |
| Forge Dock | (Internal codename: Forge Dock.) | CodeCommit | Planned |
| Forge Fjord | (Internal codename: Forge Fjord.) | Elastic Transcoder | Planned |
| Forge Silo | (Internal codename: Forge Silo.) | VPC | Planned |
| Forge Summit | (Internal codename: Forge Summit.) | Cloud WAN | Planned |
| Forge Vault | (Internal codename: Forge Vault.) | Personalize | Planned |
| Golden Beacon | (Internal codename: Golden Beacon.) | IVS | Planned |
| Golden Canyon | (Internal codename: Golden Canyon.) | Elastic Beanstalk | Planned |
| Golden Dock | (Internal codename: Golden Dock.) | HealthLake | Planned |
| Golden Grotto | (Internal codename: Golden Grotto.) | GuardDuty | Planned |
| Golden Harbor | (Internal codename: Golden Harbor.) | Amplify | Planned |
| Golden Quarry | (Internal codename: Golden Quarry.) | Application Discovery Service | Planned |
| Golden Relay | (Internal codename: Golden Relay.) | Transfer Family | Planned |
| Golden Ridge | (Internal codename: Golden Ridge.) | Service Catalog | Planned |
| Golden River | (Internal codename: Golden River.) | Security Lake | Planned |
| Granite Atlas | (Internal codename: Granite Atlas.) | Wavelength | Planned |
| Granite Beacon | (Internal codename: Granite Beacon.) | Athena | Planned |
| Granite River | (Internal codename: Granite River.) | Q Business | Planned |
| Grove Coffer | (Internal codename: Grove Coffer.) | Network Firewall | Planned |
| Grove Relay | (Internal codename: Grove Relay.) | Trusted Advisor | Planned |
| Harbor Delta | (Internal codename: Harbor Delta.) | IAM Identity Center | Planned |
| Harbor Gale | (Internal codename: Harbor Gale.) | Secrets Manager | Planned |
| Harbor Harbor | (Internal codename: Harbor Harbor.) | Data Pipeline | Planned |
| Harbor Hearth | (Internal codename: Aurora Canopy.) | Braket | Planned |
| Harbor Lattice | (Internal codename: Harbor Lattice.) | HealthOmics | Planned |
| Harbor Observatory | (Internal codename: Harbor Observatory.) | EBS | Planned |
| Harbor Sanctum | (Internal codename: Harbor Sanctum.) | Cloud Map | Planned |
| Hidden Relay | (Internal codename: Swift Aurora.) | Lookout for Metrics | Planned |
| Hidden Ridge | (Internal codename: Hidden Ridge.) | CloudShell | Planned |
| Hidden Silo | (Internal codename: Hidden Silo.) | Private CA | Planned |
| Hidden Vault | (Internal codename: Hidden Vault.) | Recycle Bin | Planned |
| Indigo Canopy | (Internal codename: Indigo Canopy.) | Neptune | Planned |
| Indigo Sanctum | (Internal codename: Indigo Sanctum.) | Config | Planned |
| Indigo Spindle | (Internal codename: Indigo Spindle.) | Cloud Directory | Planned |
| Indigo Torrent | (Internal codename: Indigo Torrent.) | ECS | Planned |
| Indigo Weave | (Internal codename: Indigo Weave.) Includes variants: Forge Hearth, Prairie Fjord. | Kinesis Data Streams | Planned |
| Iron Canopy | (Internal codename: Iron Canopy.) | AppFlow | Planned |
| Iron Fjord | (Internal codename: Iron Fjord.) | Service Quotas | Planned |
| Iron Quarry | (Internal codename: Iron Quarry.) | Serverless Application Repository | Planned |
| Ivory Kiln | (Internal codename: Ivory Kiln.) | Transit Gateway | Planned |
| Ivory Ledger | (Internal codename: Ivory Ledger.) | ElastiCache | Planned |
| KeyStone | (Internal codename: KeyStone.) | DynamoDB | Planned |
| LedgerLens | Cost analytics, trend exploration, and reporting. | Cost Explorer | Planned |
| Lunar Forge | (Internal codename: Lunar Forge.) | RoboMaker | Planned |
| Lunar Gale | (Internal codename: Lunar Gale.) | SimSpace Weaver | Planned |
| Lunar Grotto | (Internal codename: Lunar Grotto.) | IoT Core | Planned |
| Lunar Hearth | (Internal codename: Lunar Hearth.) | Lookout for Vision | Planned |
| Lunar Ledger | (Internal codename: Lunar Ledger.) | IoT Wireless | Planned |
| Lunar Relay | (Internal codename: Lunar Relay.) | Lightsail | Planned |
| Maildrop | Transactional and bulk email sending service. | SES | Planned |
| Matchforge | Managed game session hosting, matchmaking, and fleet scaling. | GameLift | Planned |
| Mosaic Cairn | (Internal codename: Harbor Aurora.) | DocumentDB | Planned |
| Mosaic Coffer | (Internal codename: Mosaic Coffer.) | CloudFormation | Planned |
| Mosaic Mesa | (Internal codename: Mosaic Mesa.) | Elemental MediaLive | Planned |
| Mosaic Quarry | (Internal codename: Mosaic Quarry.) | Deadline Cloud | Planned |
| Nimbus Hearth | (Internal codename: Nimbus Hearth.) | DataSync | Planned |
| Nimbus Observatory | (Internal codename: Nimbus Observatory.) | CodeStar Notifications | Planned |
| Nimbus Spindle | (Internal codename: Nimbus Spindle.) | Elastic Disaster Recovery | Planned |
| Nimbus Summit | (Internal codename: Nimbus Summit.) | DataZone | Planned |
| Obsidian Quarry | (Internal codename: Obsidian Quarry.) | Well-Architected Tool | Planned |
| Obsidian Switch | (Internal codename: Obsidian Switch.) | CodeConnections | Planned |
| Open Constellation | (Internal codename: Open Constellation.) | IoT Device Defender | Planned |
| Open Tide | (Internal codename: Open Tide.) | VMware Cloud on AWS | Planned |
| Prairie Delta | (Internal codename: Prairie Delta.) | Storage Gateway | Planned |
| Prairie Library | (Internal codename: Prairie Library.) | Connect | Planned |
| Prairie River | (Internal codename: Prairie River.) | Incident Manager | Planned |
| QStorage | (Internal codename: QStorage.) | S3 Glacier | Planned |
| QStorage | (Internal codename: QStorage.) | S3 on Outposts | Planned |
| Quantum Constellation | (Internal codename: Quantum Constellation.) | Rekognition | Planned |
| Quantum Foundry | (Internal codename: Quantum Foundry.) | DataBrew | Planned |
| Quantum Sanctum | (Internal codename: Quantum Sanctum.) | WorkMail | Planned |
| Quarry | (Internal codename: Quarry.) Includes variants: Quarry. | Bedrock | Planned |
| Quill Archive | (Internal codename: Quill Archive.) | App Runner | Planned |
| Quill Pylon | (Internal codename: Quill Pylon.) | EMR | Planned |
| Saffron Ledger | (Internal codename: Saffron Ledger.) | Firewall Manager | Planned |
| Silent Atlas | (Internal codename: Silent Atlas.) | CodeStar Connections | Planned |
| Silent Canyon | (Internal codename: Silent Canyon.) | CloudSearch | Planned |
| Silent Library | (Internal codename: Silent Library.) | Mainframe Modernization | Planned |
| Silent Mesa | (Internal codename: Silent Mesa.) | Resilience Hub | Planned |
| Silent Nimbus | (Internal codename: Silent Nimbus.) | Kendra | Planned |
| Silent Observatory | (Internal codename: Silent Observatory.) | Local Zones | Planned |
| Silent Ridge | (Internal codename: Silent Ridge.) | CloudTrail | Planned |
| Silent Silo | (Internal codename: Silent Silo.) | Comprehend Medical | Planned |
| Silent Torrent | (Internal codename: Silent Torrent.) | EC2 | Planned |
| Silent Vault | (Internal codename: Silent Vault.) | Red Hat OpenShift Service on AWS | Planned |
| Silver Archive | (Internal codename: Silver Archive.) | Macie | Planned |
| Silver Beacon | (Internal codename: Silver Beacon.) | FinSpace | Planned |
| Silver Kiln | (Internal codename: Silver Kiln.) | Polly | Planned |
| Silver Lattice | (Internal codename: Silver Lattice.) | Lake Formation | Planned |
| Solar Cairn | (Internal codename: Solar Cairn.) | CodeArtifact | Planned |
| Solar Constellation | (Internal codename: Solar Constellation.) | Systems Manager | Planned |
| Solar Fjord | (Internal codename: Solar Fjord.) | A2I | Planned |
| Solar Gale | (Internal codename: Aurora Mesa.) | Clean Rooms ML | Planned |
| Solar Grotto | (Internal codename: Solar Grotto.) | Fargate | Planned |
| Solar Harbor | (Internal codename: Solar Harbor.) | Location Service | Planned |
| Solar Lattice | (Internal codename: Solar Lattice.) | Backup | Planned |
| Solar Observatory | (Internal codename: Solar Observatory.) | License Manager | Planned |
| Solar River | (Internal codename: Solar River.) | Resource Groups and Tagging | Planned |
| SpendGuard | Budget limits, alerts, and forecast-based controls. | Budgets | Planned |
| Steady Delta | (Internal codename: Steady Delta.) | CloudFront | Planned |
| Steady Nimbus | (Internal codename: Steady Nimbus.) | DMS | Planned |
| Steady Pylon | (Internal codename: Steady Pylon.) Includes variants: Swift Foundry, Mosaic Summit, Zephyr Ledger, Golden Vault. | CloudWatch | Planned |
| Steady Spindle | (Internal codename: Steady Spindle.) | Health | Planned |
| Stellar Harbor | (Internal codename: Stellar Harbor.) | Security Incident Response | Planned |
| Stellar Spindle | (Internal codename: Stellar Spindle.) | IoT SiteWise | Planned |
| Stellar Torrent | (Internal codename: Stellar Torrent.) | Cloud Control API | Planned |
| Stellar Workshop | (Internal codename: Stellar Workshop.) | CodeCatalyst | Planned |
| Swift Canopy | (Internal codename: Swift Canopy.) | Global Accelerator | Planned |
| Swift Forge | (Internal codename: Swift Forge.) | Compute Optimizer | Planned |
| Swift Gale | (Internal codename: Swift Gale.) | App Mesh | Planned |
| Swift Grotto | (Internal codename: Swift Grotto.) | Signer | Planned |
| Swift Switch | (Internal codename: Swift Switch.) | Data Exchange | Planned |
| Torrent Canopy | (Internal codename: Aurora Kiln.) | Elastic Load Balancing | Planned |
| Torrent Coffer | (Internal codename: Torrent Coffer.) | STS | Planned |
| Torrent Forge | (Internal codename: Torrent Forge.) | CodeDeploy | Planned |
| Torrent Grotto | (Internal codename: Torrent Grotto.) | Certificate Manager | Planned |
| Torrent Lattice | (Internal codename: Torrent Lattice.) | Shield | Planned |
| Torrent Pylon | (Internal codename: Torrent Pylon.) | EVS | Planned |
| UsageRollup | Detailed cost and usage export/reporting. | Cost and Usage Report | Planned |
| Verdant Nimbus | (Internal codename: Verdant Nimbus.) | MQ | Planned |
| Verdant Observatory | (Internal codename: Verdant Observatory.) | Comprehend | Planned |
| Verdant Pylon | (Internal codename: Verdant Pylon.) | Lookout for Equipment | Planned |
| Zephyr Archive | (Internal codename: Zephyr Archive.) | EFS | Planned |
| Zephyr Gale | (Internal codename: Zephyr Gale.) | Q Developer | Planned |
| Zephyr Grotto | (Internal codename: Zephyr Grotto.) | AppStream 2 | Planned |
| Zephyr Sanctum | (Internal codename: Zephyr Sanctum.) | Quick Setup | Planned |
| Zephyr Silo | (Internal codename: Zephyr Silo.) Includes variants: Saffron Gale, Saffron Nimbus. | EventBridge | Planned |

---

*This document is auto-generated weekly from the [Quilibrium Tech Tree](https://qstorage.quilibrium.com/techtree/index.html). To explore the full interactive graph with dependency relationships and visual layout, visit the link directly.*
