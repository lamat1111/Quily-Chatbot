import { writeFileSync } from 'fs';

const files = {};

// Helper
function entry(status, score, pct, issues, notes, custom_doc) {
  return { status, last_analyzed: "2026-02-13", score, composite_pct: pct, issues, notes, custom_doc };
}

// === discover/ (14 files) ===
files["discover/01-what-is-quilibrium.md"] = entry("adequate", "A", 86, [], "Solid overview of Quilibrium", null);
files["discover/02-FAQ.md"] = entry("adequate", "A", 88, ["many_small_sections", "oversized_file"], "Large FAQ file", null);
files["discover/03-q-story.md"] = entry("covered", "B", 72, ["no_h2_headings", "many_small_sections"], "Timeline format", "docs/custom/Q-Story-Vision-Deployment.md");
files["discover/04-quilibrium-tokenomics.md"] = entry("adequate", "B", 79, ["docusaurus_syntax"], "Good tokenomics content", null);
files["discover/05-core-technologies-in-quilibrium.md"] = entry("adequate", "B", 72, ["docusaurus_syntax", "no_h2_headings", "many_small_sections"], "Core tech overview", null);
files["discover/06-gas-fees-and-dynamic-fee-market-on-quilibrium.md"] = entry("adequate", "A", 80, ["docusaurus_syntax"], "Gas fees explanation", null);
files["discover/07-how-does-quilibrium-maintain-decentralization.md"] = entry("adequate", "A", 84, ["docusaurus_syntax", "oversized_file"], "Detailed decentralization treatment", null);
files["discover/08-how-quilibrium-protects-privacy-without-enabling-crime.md"] = entry("adequate", "A", 83, ["docusaurus_syntax"], "Privacy and compliance treatment", null);
files["discover/09-quilibrium-kms.md"] = entry("adequate", "A", 82, ["docusaurus_syntax", "large_table"], "Detailed KMS explanation", null);
files["discover/10-quilibriums-innovative-use-of-passkeys.md"] = entry("adequate", "A", 86, [], "Cleanest file in corpus", null);
files["discover/11-security-audits-of-quilibriums-cryptographic-protocols.md"] = entry("adequate", "B", 79, [], "Solid audit overview", null);
files["discover/12-the-alternative-thesis-for-consumer-crypto.md"] = entry("covered", "B", 78, ["docusaurus_syntax", "jsx_params"], "Consumer crypto summary", "docs/custom/Q-Story-Vision-Deployment.md");
files["discover/13-the-illusion-of-decentralization-in-crypto-and-quilibriums-radical-alternative..md"] = entry("adequate", "A", 85, ["docusaurus_syntax"], "Detailed centralization analysis", null);
files["discover/14-programmable-mpc-vs-zkp.md"] = entry("adequate", "A", 81, ["jsx_params"], "MPC vs ZKP comparison", null);

// === learn/ (19 files) ===
files["learn/01-block-storage/bloom-clock.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by Block-Storage-VDFs-Bloom-Clocks", "docs/custom/Block-Storage-VDFs-Bloom-Clocks.md");
files["learn/01-block-storage/vdfs.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by Block-Storage-VDFs-Bloom-Clocks", "docs/custom/Block-Storage-VDFs-Bloom-Clocks.md");
files["learn/02-communication/addressing.md"] = entry("covered", "C", 42, ["no_frontmatter", "missing_title"], "Sparse but has real content; covered by Planted-Clique-Addressing-Scheme", "docs/custom/Planted-Clique-Addressing-Scheme.md");
files["learn/02-communication/e2ee.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by Communication-Layer-E2EE-Mixnet-P2P", "docs/custom/Communication-Layer-E2EE-Mixnet-P2P.md");
files["learn/02-communication/mixnet-routing.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by Communication-Layer-E2EE-Mixnet-P2P", "docs/custom/Communication-Layer-E2EE-Mixnet-P2P.md");
files["learn/02-communication/p2p-communication.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by Communication-Layer-E2EE-Mixnet-P2P", "docs/custom/Communication-Layer-E2EE-Mixnet-P2P.md");
files["learn/03-oblivious-hypergraph/hypergraph-construction.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by RDF-Hypergraph-Query-System", "docs/custom/RDF-Hypergraph-Query-System.md");
files["learn/03-oblivious-hypergraph/oblivious-transfer.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by Oblivious-Transfer-Protocols", "docs/custom/Oblivious-Transfer-Protocols.md");
files["learn/03-oblivious-hypergraph/query-evaluator.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by RDF-Hypergraph-Query-System", "docs/custom/RDF-Hypergraph-Query-System.md");
files["learn/03-oblivious-hypergraph/query-planner.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by RDF-Hypergraph-Query-System", "docs/custom/RDF-Hypergraph-Query-System.md");
files["learn/03-oblivious-hypergraph/rdf-storage.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by RDF-Hypergraph-Query-System", "docs/custom/RDF-Hypergraph-Query-System.md");
files["learn/04-operating-system/accounts.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by OS-Subsystems-Accounts-Scheduler-IPC", "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md");
files["learn/04-operating-system/dbos.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by OS-Subsystems-Accounts-Scheduler-IPC", "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md");
files["learn/04-operating-system/file-system.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by OS-Subsystems-Accounts-Scheduler-IPC", "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md");
files["learn/04-operating-system/ipc.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by OS-Subsystems-Accounts-Scheduler-IPC", "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md");
files["learn/04-operating-system/key-management.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by OS-Subsystems-Accounts-Scheduler-IPC", "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md");
files["learn/04-operating-system/message-queues.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by OS-Subsystems-Accounts-Scheduler-IPC", "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md");
files["learn/04-operating-system/scheduler.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by OS-Subsystems-Accounts-Scheduler-IPC", "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md");
files["learn/04-operating-system/universal-resources.md"] = entry("covered", "F", 19, ["react_stub", "no_content", "no_frontmatter"], "React stub; covered by OS-Subsystems-Accounts-Scheduler-IPC", "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md");

// === build/ (5 files) ===
files["build/01-applications/running-applications.md"] = entry("covered", "C", 57, ["no_frontmatter", "missing_title"], "Thin developer reference; covered by QCL companion", "docs/custom/QCL-Quilibrium-Compute-Language.md");
files["build/02-tokens/creating-tokens.md"] = entry("adequate", "B", 78, ["no_frontmatter", "missing_title", "many_small_sections"], "Comprehensive token creation spec", null);
files["build/q-service-apis.md"] = entry("adequate", "B", 61, [], "Index page for Q Service APIs", null);
files["build/01-applications/compiling-to-ot-circuits.md"] = entry("covered", "B", 71, ["no_frontmatter", "missing_title"], "Best developer guide; covered by QCL companion", "docs/custom/QCL-Quilibrium-Compute-Language.md");
files["build/01-applications/deploying-to-the-network.md"] = entry("covered", "C", 51, ["no_frontmatter", "missing_title"], "Minimal deployment page; covered by QCL companion", "docs/custom/QCL-Quilibrium-Compute-Language.md");

// === protocol/ (3 files) ===
files["protocol/overview.md"] = entry("covered", "B", 70, ["no_frontmatter", "missing_title"], "Protocol overview; covered by Architecture companion", "docs/custom/Quilibrium Architecture.md");
files["protocol/consensus.md"] = entry("covered", "B", 78, ["no_frontmatter", "missing_title", "many_small_sections"], "Consensus mechanism; covered by Architecture companion", "docs/custom/Quilibrium Architecture.md");
files["protocol/data-structures.md"] = entry("covered", "B", 72, ["no_frontmatter", "missing_title", "oversized_file", "large_table"], "Large protocol spec; covered by Architecture companion", "docs/custom/Quilibrium Architecture.md");

// === run-node/ (40 files) ===
files["run-node/RPC.md"] = entry("adequate", "A", 82, ["docusaurus_syntax", "oversized_file"], "Extensive protobuf RPC docs", null);
files["run-node/account-aliases.md"] = entry("covered", "F", 15, ["no_frontmatter", "no_content", "no_h2_headings"], "Stub page; covered by Node-Maintenance-Updates-Guide", "docs/custom/Node-Maintenance-Updates-Guide.md");
files["run-node/advanced-configuration.md"] = entry("adequate", "A", 83, ["docusaurus_syntax", "oversized_file"], "Comprehensive config.yml reference", null);
files["run-node/advanced-node-management.md"] = entry("covered", "D", 30, ["no_content"], "Thin; covered by Node-Maintenance-Updates-Guide", "docs/custom/Node-Maintenance-Updates-Guide.md");
files["run-node/linux_configuration.md"] = entry("adequate", "B", 66, ["docusaurus_syntax"], "Good systemd setup content", null);
files["run-node/quick-start.md"] = entry("adequate", "A", 82, ["docusaurus_syntax"], "Well-structured quick start guide", null);
files["run-node/shard-enrollment-process.md"] = entry("adequate", "B", 68, ["no_frontmatter"], "Clean enrollment docs", null);
files["run-node/system-requirements.md"] = entry("adequate", "A", 88, ["docusaurus_syntax"], "Excellent requirements reference", null);
files["run-node/upgrade-2.1.md"] = entry("adequate", "A", 80, [], "Clean upgrade guide", null);
files["run-node/qclient/checksum.md"] = entry("covered", "F", 12, ["no_frontmatter", "no_content", "no_h2_headings"], "Too thin; covered by QClient-Configuration-Commands", "docs/custom/QClient-Configuration-Commands.md");
files["run-node/qclient/managing-configs.md"] = entry("covered", "F", 5, ["no_frontmatter", "no_content", "no_h2_headings", "empty_file"], "Empty page; covered by QClient-Configuration-Commands", "docs/custom/QClient-Configuration-Commands.md");
files["run-node/qclient/qclient-101.md"] = entry("adequate", "B", 65, ["docusaurus_syntax"], "Good qclient intro", null);
files["run-node/qclient/setup.md"] = entry("adequate", "A", 81, ["docusaurus_syntax"], "Comprehensive setup guide", null);
files["run-node/qclient/commands/alias.md"] = entry("covered", "C", 59, ["no_frontmatter", "docusaurus_syntax", "many_small_sections"], "Good but thin sections; covered by QClient-Configuration-Commands", "docs/custom/QClient-Configuration-Commands.md");
files["run-node/qclient/commands/bridging.md"] = entry("adequate", "B", 79, ["no_frontmatter", "docusaurus_syntax"], "Excellent practical bridging guide", null);
files["run-node/qclient/commands/command-list.md"] = entry("adequate", "B", 68, ["large_table"], "Central command reference", null);
files["run-node/qclient/commands/compute.md"] = entry("adequate", "A", 84, ["docusaurus_syntax"], "Well-structured compute reference", null);
files["run-node/qclient/commands/deploy.md"] = entry("adequate", "A", 85, ["docusaurus_syntax", "oversized_file"], "Comprehensive deployment reference", null);
files["run-node/qclient/commands/global-flags.md"] = entry("adequate", "A", 86, ["docusaurus_syntax"], "Excellent flags reference", null);
files["run-node/qclient/commands/hypergraph.md"] = entry("adequate", "A", 82, ["docusaurus_syntax"], "Good hypergraph reference", null);
files["run-node/qclient/commands/key.md"] = entry("adequate", "A", 83, ["docusaurus_syntax"], "Thorough key management reference", null);
files["run-node/qclient/commands/messaging.md"] = entry("adequate", "A", 85, ["docusaurus_syntax"], "Excellent messaging reference", null);
files["run-node/qclient/commands/node.md"] = entry("adequate", "A", 82, ["no_frontmatter", "docusaurus_syntax", "oversized_file", "many_small_sections"], "Large node command reference", null);
files["run-node/qclient/commands/qclient-config.md"] = entry("covered", "C", 48, ["no_frontmatter", "many_small_sections"], "Thin; covered by QClient-Configuration-Commands", "docs/custom/QClient-Configuration-Commands.md");
files["run-node/qclient/commands/qclient.md"] = entry("covered", "C", 42, ["no_frontmatter", "many_small_sections"], "Thin; covered by QClient-Configuration-Commands", "docs/custom/QClient-Configuration-Commands.md");
files["run-node/qclient/commands/token.md"] = entry("adequate", "A", 80, ["no_frontmatter", "docusaurus_syntax"], "Comprehensive token operations reference", null);
files["run-node/qclient/node/auto-update.md"] = entry("covered", "D", 25, ["no_frontmatter", "no_content", "docusaurus_syntax"], "Too thin; covered by Node-Maintenance-Updates-Guide", "docs/custom/Node-Maintenance-Updates-Guide.md");
files["run-node/qclient/node/clean.md"] = entry("covered", "C", 40, ["no_frontmatter", "docusaurus_syntax"], "Brief; covered by Node-Maintenance-Updates-Guide", "docs/custom/Node-Maintenance-Updates-Guide.md");
files["run-node/qclient/node/install.md"] = entry("adequate", "B", 65, ["docusaurus_syntax"], "Good install guide", null);
files["run-node/qclient/node/run-node-via-node-service.md"] = entry("covered", "B", 62, ["no_frontmatter", "many_small_sections"], "Service commands; covered by Node-Service-Setup-Guide", "docs/custom/Node-Service-Setup-Guide.md");
files["run-node/qclient/node/update.md"] = entry("covered", "C", 47, [], "Brief update workflows; covered by Node-Maintenance-Updates-Guide", "docs/custom/Node-Maintenance-Updates-Guide.md");
files["run-node/qclient/node/key-management/create-new-keyset.md"] = entry("covered", "D", 27, ["no_frontmatter", "no_content", "docusaurus_syntax"], "Too thin; covered by Node-Key-Management-Guide", "docs/custom/Node-Key-Management-Guide.md");
files["run-node/qclient/node/key-management/import-keysets.md"] = entry("covered", "C", 50, ["no_frontmatter"], "Practical but thin; covered by Node-Key-Management-Guide", "docs/custom/Node-Key-Management-Guide.md");
files["run-node/qclient/node/key-management/initial-keyset.md"] = entry("covered", "D", 32, ["no_content", "docusaurus_syntax"], "Too thin; covered by Node-Key-Management-Guide", "docs/custom/Node-Key-Management-Guide.md");
files["run-node/qclient/node/key-management/keys.md"] = entry("covered", "C", 43, ["docusaurus_syntax"], "Brief overview; covered by Node-Key-Management-Guide", "docs/custom/Node-Key-Management-Guide.md");
files["run-node/qclient/node/key-management/multiple-keysets.md"] = entry("covered", "C", 50, ["no_frontmatter"], "Nearly identical to import-keysets; covered by Node-Key-Management-Guide", "docs/custom/Node-Key-Management-Guide.md");
files["run-node/qclient/node/node-service/commands.md"] = entry("covered", "B", 60, ["docusaurus_syntax", "many_small_sections"], "Service commands; covered by Node-Service-Setup-Guide", "docs/custom/Node-Service-Setup-Guide.md");
files["run-node/qclient/node/node-service/environment-variables.md"] = entry("covered", "D", 28, ["no_content", "docusaurus_syntax"], "Too thin; covered by Node-Service-Setup-Guide", "docs/custom/Node-Service-Setup-Guide.md");
files["run-node/qclient/node/node-service/installing-node-service.md"] = entry("covered", "D", 27, ["no_frontmatter", "no_content"], "Too thin; covered by Node-Service-Setup-Guide", "docs/custom/Node-Service-Setup-Guide.md");
files["run-node/qclient/node/node-service/overview.md"] = entry("covered", "D", 30, ["no_content"], "Hub page; covered by Node-Service-Setup-Guide", "docs/custom/Node-Service-Setup-Guide.md");

// === api/ top-level + overviews ===
files["api/01-overview.md"] = entry("adequate", "B", 72, [], "Good API overview", null);
files["api/02-credentials.md"] = entry("covered", "C", 55, ["docusaurus_syntax", "jsx_tabs"], "Tabs content garbled; covered by API-Credentials-Authentication", "docs/custom/API-Credentials-Authentication.md");
files["api/03-q-storage/01-overview.md"] = entry("covered", "C", 50, [], "Navigation page; covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/02-hosting-websites-on-quilibrium.md"] = entry("adequate", "A", 82, [], "Best editorial quality in API category", null);
files["api/03-q-storage/02-api-reference/01-getting-started.md"] = entry("adequate", "B", 65, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Good getting started guide", null);
files["api/03-q-storage/02-api-reference/01-index.md"] = entry("covered", "C", 42, ["no_frontmatter"], "Navigation page; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/04-q-kms/01-overview.md"] = entry("covered", "C", 45, [], "Short navigation page; covered by QKMS-Key-Management-Service", "docs/custom/QKMS-Key-Management-Service.md");

// === api/ QStorage User Manual ===
files["api/03-q-storage/01-user-manual/01-getting-started.md"] = entry("covered", "B", 64, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/02-credentials.md"] = entry("covered", "C", 50, ["docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/03-privacy.md"] = entry("covered", "B", 72, ["no_frontmatter"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/04-pricing.md"] = entry("covered", "B", 68, ["no_frontmatter"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/07-access-control.md"] = entry("covered", "F", 3, ["empty_content"], "Empty file; covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/08-regions.md"] = entry("covered", "D", 22, ["no_frontmatter"], "Minimal; covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/09-object-versioning.md"] = entry("covered", "D", 30, ["coming_soon_placeholder"], "Mostly placeholder; covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");

// === api/ QStorage buckets ===
files["api/03-q-storage/01-user-manual/05-working-with-buckets/00-what-is-a-bucket.md"] = entry("covered", "D", 25, ["no_frontmatter"], "Too short; covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/05-working-with-buckets/01-bucket-names.md"] = entry("covered", "A", 80, ["no_frontmatter"], "Excellent naming rules; covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/05-working-with-buckets/02-creating-a-bucket.md"] = entry("covered", "B", 62, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/05-working-with-buckets/03-edit-bucket-visibility.md"] = entry("covered", "B", 72, ["no_frontmatter"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/05-working-with-buckets/04-list-buckets.md"] = entry("covered", "C", 48, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/05-working-with-buckets/05-delete-a-bucket.md"] = entry("covered", "B", 62, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/05-working-with-buckets/06-empty-a-bucket.md"] = entry("covered", "C", 48, ["docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/05-working-with-buckets/07-using-bucket-tags.md"] = entry("covered", "A", 86, ["docusaurus_syntax", "jsx_tabs"], "Most comprehensive UM file; covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");

// === api/ QStorage objects ===
files["api/03-q-storage/01-user-manual/06-working-with-objects/01-what-is-an-object.md"] = entry("covered", "B", 72, ["no_frontmatter"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/02-upload-an-object.md"] = entry("covered", "B", 72, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/03-working-with-metadata.md"] = entry("covered", "A", 80, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/04-change-object-visibility.md"] = entry("covered", "B", 70, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/05-list-bucket-contents.md"] = entry("covered", "B", 64, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/06-copying-moving-renaming-objects.md"] = entry("covered", "A", 80, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/07-downloading-an-object.md"] = entry("covered", "B", 68, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/08-delete-an-object.md"] = entry("covered", "A", 80, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/09-organizing-and-listing-objects/01-organizing-objects-using-folders.md"] = entry("covered", "A", 84, ["no_frontmatter", "docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/09-organizing-and-listing-objects/02-listing-objects.md"] = entry("covered", "A", 86, ["docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/09-organizing-and-listing-objects/03-viewing-object-properties.md"] = entry("covered", "A", 84, ["docusaurus_syntax", "jsx_tabs"], "Covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");
files["api/03-q-storage/01-user-manual/06-working-with-objects/09-organizing-and-listing-objects/04-using-tags.md"] = entry("covered", "A", 88, ["docusaurus_syntax", "jsx_tabs"], "Best UM object file; covered by QStorage-User-Guide", "docs/custom/QStorage-User-Guide.md");

// === api/ QKMS User Manual ===
files["api/04-q-kms/01-user-manual/getting-started.md"] = entry("covered", "F", 5, ["coming_soon_stub"], "Coming soon stub; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/01-user-manual/creating-keys.md"] = entry("covered", "F", 5, ["coming_soon_stub"], "Coming soon stub; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/01-user-manual/deleting-keys.md"] = entry("covered", "F", 5, ["coming_soon_stub"], "Coming soon stub; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/01-user-manual/importing-key-material.md"] = entry("covered", "D", 32, ["coming_soon_placeholder"], "Partial; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/01-user-manual/key-policies.md"] = entry("covered", "D", 35, ["coming_soon_placeholder"], "Partial; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/01-user-manual/key-states.md"] = entry("covered", "F", 5, ["coming_soon_stub"], "Coming soon stub; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/01-user-manual/using-grants.md"] = entry("covered", "D", 30, ["coming_soon_placeholder"], "Partial; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/02-api-reference/getting-started.md"] = entry("covered", "F", 5, ["coming_soon_stub"], "Coming soon stub; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/02-api-reference/_02-data-types/01-general.md"] = entry("covered", "F", 0, ["empty_file"], "Completely empty; covered by QKMS companion", "docs/custom/QKMS-Key-Management-Service.md");

// === api/ QStorage bucket operations (5 read + remaining unread) ===
// 5 read:
files["api/03-q-storage/02-api-reference/01-bucket-operations/create-bucket.md"] = entry("covered", "B", 62, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/01-bucket-operations/delete-bucket.md"] = entry("covered", "B", 60, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/01-bucket-operations/get-bucket-acl.md"] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/01-bucket-operations/put-bucket-lifecycle-configuration.md"] = entry("covered", "B", 66, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/01-bucket-operations/list-buckets.md"] = entry("covered", "B", 66, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");

// Remaining unread bucket ops:
const unreadBucketOps = [
  "delete-bucket-cors", "delete-bucket-encryption", "delete-bucket-lifecycle",
  "delete-bucket-policy", "delete-bucket-tagging", "delete-bucket-website",
  "delete-public-access-block", "get-bucket-analytics-configuration",
  "get-bucket-cors", "get-bucket-encryption", "get-bucket-lifecycle-configuration",
  "get-bucket-lifecycle", "get-bucket-logging", "get-bucket-metadata-table-configuration",
  "get-bucket-ownership-controls", "get-bucket-policy-status", "get-bucket-policy",
  "get-bucket-tagging", "get-bucket-versioning", "get-bucket-website",
  "head-bucket", "put-bucket-acl", "put-bucket-encryption",
  "put-bucket-lifecycle", "put-bucket-website", "put-object-lock-configuration"
];
for (const name of unreadBucketOps) {
  files[`api/03-q-storage/02-api-reference/01-bucket-operations/${name}.md`] = entry("covered", "B", 63, ["jsx_params", "docusaurus_syntax"], "Extrapolated from structural sampling", "docs/custom/QStorage-API-Reference.md");
}

// === api/ QStorage object operations ===
// 5 read object ops (from user data + old file):
files["api/03-q-storage/02-api-reference/02-object-operations/copy-object.md"] = entry("covered", "B", 63, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/02-object-operations/delete-object.md"] = entry("covered", "B", 62, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/02-object-operations/get-object-acl.md"] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/02-object-operations/get-object.md"] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/02-object-operations/head-object.md"] = entry("covered", "B", 66, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");

// Remaining unread object ops:
const unreadObjectOps = [
  "list-objects-v2", "list-objects", "put-object-acl", "put-object-legal-hold", "put-object"
];
for (const name of unreadObjectOps) {
  files[`api/03-q-storage/02-api-reference/02-object-operations/${name}.md`] = entry("covered", "B", 63, ["jsx_params", "docusaurus_syntax"], "Extrapolated from structural sampling", "docs/custom/QStorage-API-Reference.md");
}

// === api/ QStorage multipart operations ===
// 3 read:
files["api/03-q-storage/02-api-reference/03-multipart-operations/create-multipart-upload.md"] = entry("covered", "B", 66, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/03-multipart-operations/complete-multipart-upload.md"] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/03-multipart-operations/abort-multipart-upload.md"] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");

// Remaining unread multipart ops:
const unreadMultipartOps = ["list-multipart-uploads", "list-parts", "upload-part"];
for (const name of unreadMultipartOps) {
  files[`api/03-q-storage/02-api-reference/03-multipart-operations/${name}.md`] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "Extrapolated from structural sampling", "docs/custom/QStorage-API-Reference.md");
}

// === api/ QStorage data types ===
// 5 read:
files["api/03-q-storage/02-api-reference/09-data-types/lifecycle-rule.md"] = entry("covered", "A", 82, [], "Well-structured data type; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/09-data-types/grant.md"] = entry("covered", "B", 65, [], "Data type reference; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/09-data-types/cors-rule.md"] = entry("covered", "B", 70, [], "Data type reference; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/09-data-types/bucket.md"] = entry("covered", "C", 52, [], "Data type reference; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");
files["api/03-q-storage/02-api-reference/09-data-types/tag.md"] = entry("covered", "C", 42, [], "Data type reference; covered by QStorage-API-Reference", "docs/custom/QStorage-API-Reference.md");

// Remaining unread data types:
const unreadDataTypes = [
  "abort-incomplete-multipart-upload", "analytics-filter", "bucket-logging-status",
  "bucket-policy", "completed-part", "condition", "copy-object-result",
  "default-retention", "error-details", "error-document", "grantee",
  "index-document", "initiator", "lifecycle-expiration",
  "lifecycle-rule-and-operator", "lifecycle-rule-filter", "logging-enabled",
  "metadata-table-configuration-result", "metadata-table-configuration",
  "noncurrent-version-expiration", "object-lock-rule", "object", "owner",
  "ownership-controls-rule", "ownership-controls", "part", "policy-status",
  "redirect-all-requests-to", "redirect", "routing-rule", "rule",
  "s3-tables-destination-result", "server-side-encryption-rule", "statement",
  "tagging", "transition", "upload-part", "versioning-configuration",
  "website-configuration"
];
for (const name of unreadDataTypes) {
  files[`api/03-q-storage/02-api-reference/09-data-types/${name}.md`] = entry("covered", "C", 55, [], "Extrapolated from structural sampling", "docs/custom/QStorage-API-Reference.md");
}

// === api/ QKMS key operations ===
// 5 read:
files["api/04-q-kms/02-api-reference/01-key-operations/create-key.md"] = entry("covered", "B", 66, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QKMS-Key-Management-Service", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/02-api-reference/01-key-operations/encrypt.md"] = entry("covered", "B", 66, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QKMS-Key-Management-Service", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/02-api-reference/01-key-operations/decrypt.md"] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QKMS-Key-Management-Service", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/02-api-reference/01-key-operations/describe-key.md"] = entry("covered", "B", 65, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QKMS-Key-Management-Service", "docs/custom/QKMS-Key-Management-Service.md");
files["api/04-q-kms/02-api-reference/01-key-operations/list-keys.md"] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "API ref; covered by QKMS-Key-Management-Service", "docs/custom/QKMS-Key-Management-Service.md");

// Remaining unread QKMS key ops:
const unreadQkmsOps = [
  "cancel-key-deletion", "create-alias", "create-grant", "delete-alias",
  "delete-imported-key-material", "derive-shared-secret", "disable-key-rotation",
  "disable-key", "enable-key-rotation", "enable-key",
  "generate-data-key-pair-without-plaintext", "generate-data-key-pair",
  "generate-data-key-without-plaintext", "generate-data-key", "generate-mac",
  "get-key-policy", "get-key-rotation-status", "get-parameters-for-import",
  "get-public-key", "import-key-material", "list-aliases", "list-grants",
  "list-key-policies", "list-resource-tags", "list-retirable-grants",
  "put-key-policy", "re-encrypt", "replicate-key", "retire-grant",
  "revoke-grant", "schedule-key-deletion", "sign", "tag-resource",
  "untag-resource", "update-alias", "update-key-description",
  "update-primary-region", "verify-mac", "verify"
];
for (const name of unreadQkmsOps) {
  files[`api/04-q-kms/02-api-reference/01-key-operations/${name}.md`] = entry("covered", "B", 64, ["jsx_params", "docusaurus_syntax"], "Extrapolated from structural sampling", "docs/custom/QKMS-Key-Management-Service.md");
}

// === custom_docs_created ===
const custom_docs_created = [
  { path: "docs/custom/Hypersnap.md", created: "2026-02-03", covers_entities: ["Hypersnap"], covers_topics: ["snapchain", "farcaster", "dual pipeline"] },
  { path: "docs/custom/Oblivious-Transfer-Protocols.md", created: "2026-02-03", covers_entities: [], covers_topics: ["oblivious transfer", "MPC", "garbled circuits"] },
  { path: "docs/custom/OS-Layer-RDF-Schemas.md", created: "2026-02-03", covers_entities: [], covers_topics: ["RDF schemas", "DBOS", "operating system layer"] },
  { path: "docs/custom/Planted-Clique-Addressing-Scheme.md", created: "2026-02-03", covers_entities: [], covers_topics: ["planted clique", "addressing", "sybil resistance"] },
  { path: "docs/custom/QCL-Quilibrium-Compute-Language.md", created: "2026-02-11", covers_entities: [], covers_topics: ["QCL", "compute language", "garbled circuits", "Bedlam compiler"] },
  { path: "docs/custom/Quilibrium Architecture.md", created: "2026-02-03", covers_entities: [], covers_topics: ["architecture", "consensus", "execution", "P2P", "hypergraph"] },
  { path: "docs/custom/Quorum-Notifications-Privacy.md", created: "2026-02-03", covers_entities: ["Quorum"], covers_topics: ["notifications", "privacy", "messenger"] },
  { path: "docs/custom/RDF-Hypergraph-Query-System.md", created: "2026-02-03", covers_entities: [], covers_topics: ["RDF", "hypergraph", "query system", "SPARQL-like"] },
  { path: "docs/custom/Block-Storage-VDFs-Bloom-Clocks.md", created: "2026-02-11", covers_entities: [], covers_topics: ["VDF", "verifiable delay function", "bloom clock", "time reel", "block storage"] },
  { path: "docs/custom/Communication-Layer-E2EE-Mixnet-P2P.md", created: "2026-02-11", covers_entities: ["Quorum"], covers_topics: ["E2EE", "double ratchet", "triple ratchet", "mixnet", "RPM", "BlossomSub", "libp2p", "P2P"] },
  { path: "docs/custom/OS-Subsystems-Accounts-Scheduler-IPC.md", created: "2026-02-11", covers_entities: ["QQ"], covers_topics: ["operating system", "DBOS", "accounts", "coins", "scheduler", "IPC", "file system", "message queues"] },
  { path: "docs/custom/QKMS-Key-Management-Service.md", created: "2026-02-11", covers_entities: ["QKMS"], covers_topics: ["QKMS", "key management", "MPC", "threshold signing"] },
  { path: "docs/custom/QStorage-User-Guide.md", created: "2026-02-11", covers_entities: ["QStorage"], covers_topics: ["QStorage", "S3 compatible", "buckets", "objects", "access control"] },
  { path: "docs/custom/QStorage-API-Reference.md", created: "2026-02-11", covers_entities: ["QStorage"], covers_topics: ["QStorage API", "S3 API", "bucket operations", "object operations"] },
  { path: "docs/custom/API-Credentials-Authentication.md", created: "2026-02-11", covers_entities: [], covers_topics: ["API credentials", "authentication", "HMAC"] },
  { path: "docs/custom/Node-Key-Management-Guide.md", created: "2026-02-11", covers_entities: [], covers_topics: ["key management", "qclient", "keysets"] },
  { path: "docs/custom/Node-Service-Setup-Guide.md", created: "2026-02-11", covers_entities: [], covers_topics: ["node service", "systemd", "installation"] },
  { path: "docs/custom/Node-Maintenance-Updates-Guide.md", created: "2026-02-11", covers_entities: [], covers_topics: ["node maintenance", "auto-update", "manual update"] },
  { path: "docs/custom/QClient-Configuration-Commands.md", created: "2026-02-11", covers_entities: [], covers_topics: ["qclient", "configuration", "commands"] },
  { path: "docs/custom/Q-Story-Vision-Deployment.md", created: "2026-02-11", covers_entities: [], covers_topics: ["Q story", "vision", "deployment"] },
  { path: "docs/custom/Bridge-QPing-QQ-Services.md", created: "2026-02-11", covers_entities: ["Bridge", "QPing", "QQ"], covers_topics: ["Bridge", "wQUIL", "cross-chain", "QPing", "QQ"] }
];

// === categories_scanned ===
const categories_scanned = {
  discover: { scanned: "2026-02-13", files_count: 14, files_analyzed: 14 },
  learn: { scanned: "2026-02-13", files_count: 19, files_analyzed: 19 },
  build: { scanned: "2026-02-13", files_count: 5, files_analyzed: 5 },
  protocol: { scanned: "2026-02-13", files_count: 3, files_analyzed: 3 },
  "run-node": { scanned: "2026-02-13", files_count: 40, files_analyzed: 40 },
  api: { scanned: "2026-02-13", files_count: 178, files_analyzed: 55, sampling_note: "Representative sampling: all overviews, all user-manual, sampled API ref operations and data types" }
};

const result = {
  last_full_scan: "2026-02-13",
  files,
  custom_docs_created,
  categories_scanned
};

const json = JSON.stringify(result, null, 2);
writeFileSync('d:\\GitHub\\Quilibrium\\quily-chatbot\\.claude\\skills\\doc-gap-analysis\\gap-audit-log.json', json, 'utf8');

console.log(`Written ${Object.keys(files).length} file entries`);
console.log(`Written ${custom_docs_created.length} custom docs`);
console.log(`JSON length: ${json.length} chars`);
