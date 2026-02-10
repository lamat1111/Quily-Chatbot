# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.0] - 2026-02-10

### Features

- skip Turnstile re-verification on page reload ([5832824](https://github.com/lamat1111/Quily-Chatbot/commit/583282464bcce53f512ccce46466c8efe2a919ef))
- add beta warning callout to bot replies ([23852a1](https://github.com/lamat1111/Quily-Chatbot/commit/23852a16474496f26587abf50f06b917704944b9))
- strengthen anti-hallucination guardrails in RAG ([4af8f5f](https://github.com/lamat1111/Quily-Chatbot/commit/4af8f5fe19ad3ac32bad47b8c27320e2cf86cc06))
- add /2 to / redirect in next.config ([9e09d3e](https://github.com/lamat1111/Quily-Chatbot/commit/9e09d3e2cfef11bee99ef18487ba627e9b6d78c6))
- add query decomposition with RRF to RAG retriever ([9252e27](https://github.com/lamat1111/Quily-Chatbot/commit/9252e279dbb01f5484013dbce3c5662b6764530b))

### Bug Fixes

- correct env var names in sync-docs workflow ([33a8959](https://github.com/lamat1111/Quily-Chatbot/commit/33a895968717cdace9e735f046f84226e15e86e3))

### Documentation

- add Hypersnap custom documentation for RAG ([bab7cec](https://github.com/lamat1111/Quily-Chatbot/commit/bab7cecfbf46a28a3c3acc27e892da80791db150))

## [0.11.0] - 2026-02-09

### Features

- add free mode with graceful credit exhaustion fallback ([f94aaa0](https://github.com/lamat1111/Quily-Chatbot/commit/f94aaa071493fa77e2743e0bf71a0ffd1ca7832a))
- free mode skips user API keys and shows settings callout ([58d046f](https://github.com/lamat1111/Quily-Chatbot/commit/58d046f90bd0dea3c12a98b63d1f8354768dc0c5))
- add daily GitHub Actions workflow for docs sync and RAG ingestion ([2388ead](https://github.com/lamat1111/Quily-Chatbot/commit/2388ead2cb4d6b453278e5c5ddaca1ea482cff3b))
- hide provider controls in free mode settings ([12803c9](https://github.com/lamat1111/Quily-Chatbot/commit/12803c9311a332493856192a25e3e30858455fc1))
- add 4,000 character limit to chat input ([ba93d90](https://github.com/lamat1111/Quily-Chatbot/commit/ba93d9017d0b72246929267a63dea8a085b3830e))
- add Kimi K2.5 and upgrade to DeepSeek V3.1-TEE ([f5d55c8](https://github.com/lamat1111/Quily-Chatbot/commit/f5d55c831fb037396ef207bc60cc300be89821bb))

### Bug Fixes

- add Klearu status clarifications and planned feature detection ([5488713](https://github.com/lamat1111/Quily-Chatbot/commit/5488713e273388d2f65c5b30e95c9b0eb30e6cfc))

## [0.10.0] - 2026-02-06

### Features

- add rate limiting and Cloudflare Turnstile bot protection ([d3d5429](https://github.com/lamat1111/Quily-Chatbot/commit/d3d54290290dc08e83d9f2c345a09649c2666952))
- add modular cypherpunk personality for Quily chatbot ([432bdcb](https://github.com/lamat1111/Quily-Chatbot/commit/432bdcb2d0c22898b46cb16f85456508456da01c))
- add Chutes model fallback and fix Turnstile widget ([ee93bee](https://github.com/lamat1111/Quily-Chatbot/commit/ee93beec45d97c0bb3efcd7a06394ba378cf1b4f))

### Bug Fixes

- show Turnstile widget when user interaction required ([31b614e](https://github.com/lamat1111/Quily-Chatbot/commit/31b614e0def5cc9250aa9f5539c95bfc90096deb))
- disable chat input until Turnstile verification completes ([2c034d8](https://github.com/lamat1111/Quily-Chatbot/commit/2c034d808fcc0d225889d8b23df1d6b79284c477))
- hide Turnstile widget after successful verification ([577b6ae](https://github.com/lamat1111/Quily-Chatbot/commit/577b6ae7d0a4ca990dcb028ce149fa4e190a54fb))
- persist Turnstile verification across chat switches ([3757ee1](https://github.com/lamat1111/Quily-Chatbot/commit/3757ee1e7e7a25c5924d0d56e655d8f1c82f9cb6))

## [0.9.0] - 2026-02-05

### Features

- add RAG doc taxonomy with community/custom folders ([af1e2bc](https://github.com/lamat1111/Quily-Chatbot/commit/af1e2bc6aa02588372c9f763694525f6fba2e399))
- add Cloudflare Workers AI as free reranking fallback ([d701e33](https://github.com/lamat1111/Quily-Chatbot/commit/d701e335c9c1c850986f3fa3e27e55ec17c19d6a))

### Bug Fixes

- keep input visible when mobile keyboard appears ([76c9631](https://github.com/lamat1111/Quily-Chatbot/commit/76c963151ecb8bd6baf03e515cc83f59d02f61c1))
- enable sidebar scrolling on mobile devices ([3006318](https://github.com/lamat1111/Quily-Chatbot/commit/3006318bab6d26fbe4ff048413596810f7831ff6))
- scroll input into view on mobile focus ([b8278b8](https://github.com/lamat1111/Quily-Chatbot/commit/b8278b8a9a61f832562ff09798de84397cc10acf))

### Documentation

- add 4 community wiki articles to RAG knowledge base ([f6eed57](https://github.com/lamat1111/Quily-Chatbot/commit/f6eed578f061b21c1d7fe1a13fe5953cad765cc5))

### Styles

- improve mobile touch targets and fonts ([d299346](https://github.com/lamat1111/Quily-Chatbot/commit/d299346f4b032a781dc1b7628645e08c9b42b43d))
- improve mobile font sizes for readability ([f198e8a](https://github.com/lamat1111/Quily-Chatbot/commit/f198e8a0a17bd13596605ee5c7642c54c101c33a))
- switch title font from Jost to Poppins ([aa873cf](https://github.com/lamat1111/Quily-Chatbot/commit/aa873cffac5523eb973309926a0eabfd041b0523))

### Maintenance

- mobile UX improvements and RAG source linking ([ecc6843](https://github.com/lamat1111/Quily-Chatbot/commit/ecc6843b5e119a2919f13ef8cda428455cf4cd64))

## [0.8.0] - 2026-02-03

### Features

- add SVG logo components with theme support ([fd540c9](https://github.com/lamat1111/Quily-Chatbot/commit/fd540c9dbc615b0408d17a0bb14c81bd57a76e21))
- add desktop collapsed sidebar with tooltips ([5cb0a2b](https://github.com/lamat1111/Quily-Chatbot/commit/5cb0a2b590c15fc4632cd766e1632458e84bccd9))
- center chat input in welcome screen ([05faa9f](https://github.com/lamat1111/Quily-Chatbot/commit/05faa9f86cdcb5e4cb3a348ae882e5df03372d55))
- add mobile search page with chat management ([ab9c3b2](https://github.com/lamat1111/Quily-Chatbot/commit/ab9c3b2ef16ffc121eb031d879e4a6e340c90900))
- improve sidebar and focus state consistency ([914aa84](https://github.com/lamat1111/Quily-Chatbot/commit/914aa8407d90014e5a999fd56628e3b1f1d918c6))

### Maintenance

- add skills, og-image asset, and adjust logo theme colors ([d8d07a7](https://github.com/lamat1111/Quily-Chatbot/commit/d8d07a78dec354612e4029c3fb30959791d2b302))

## [0.7.0] - 2026-02-02

### Features

- add real-time status indicator during chat ([4a03d7a](https://github.com/lamat1111/Quily-Chatbot/commit/4a03d7ad113bb6b21881a8d31d5734488e003974))
- add playful random search status messages ([c696e30](https://github.com/lamat1111/Quily-Chatbot/commit/c696e309c133a3674d79a44e119949fc4b7f7e46))
- add follow-up question suggestions ([1ca85c3](https://github.com/lamat1111/Quily-Chatbot/commit/1ca85c35eb5cff64b52d6c9fba906aef153d73e6))
- improve sidebar UX with logo and delete flow ([54ddc65](https://github.com/lamat1111/Quily-Chatbot/commit/54ddc65002a94291395a39ca0a68a9ae142a6f69))

### Bug Fixes

- persist citation sources across page refresh ([92fba30](https://github.com/lamat1111/Quily-Chatbot/commit/92fba30e5b8fbca15e9882c6c6782593949a8f61))

### Documentation

- add Quorum notifications doc, remove footers ([a0c050b](https://github.com/lamat1111/Quily-Chatbot/commit/a0c050bacaec7f203d5fa73bec1b0d06239847a7))
- update README to prioritize Chutes provider ([f76e3ed](https://github.com/lamat1111/Quily-Chatbot/commit/f76e3edb3290efc9b5904ba113ff5c25ef625ea9))

### Styles

- widen sidebar on 2xl screens ([604a2b4](https://github.com/lamat1111/Quily-Chatbot/commit/604a2b4043cc8409998886b870b94d68a114553d))
- rebrand from burgundy to blue color scheme ([5352e26](https://github.com/lamat1111/Quily-Chatbot/commit/5352e262c5481056485a1124a1b4e7d73e8d3320))

### Maintenance

- update next-env.d.ts types path ([c00d6ec](https://github.com/lamat1111/Quily-Chatbot/commit/c00d6eca73dd12940eaaacef32e33a7a6fc9b50f))

## [0.6.0] - 2026-02-01

### Features

- improve chat input layout and fix rendering ([b6d91c9](https://github.com/lamat1111/Quily-Chatbot/commit/b6d91c9ba09c658e77cd6686e6efb87e23da5a46))
- add expert panel analysis command ([c546ed2](https://github.com/lamat1111/Quily-Chatbot/commit/c546ed225858c40e1ddcfcf4a5506b997b0e7d78))
- add transcript and improve cleaning guides ([4e03384](https://github.com/lamat1111/Quily-Chatbot/commit/4e03384682ac53c3c5152b9056c86d5ac8b1a797))
- add conversational context to RAG ([1cf66a5](https://github.com/lamat1111/Quily-Chatbot/commit/1cf66a512acc7542ce4bd6ea695436458b2af326))

## [0.5.0] - 2026-01-31

### Features

- add document metadata for RAG citations ([47cc485](https://github.com/lamat1111/Quily-Chatbot/commit/47cc4852943222efcbe22d3a6137619d1f66531c))
- add temporal awareness to RAG retrieval ([43ab83b](https://github.com/lamat1111/Quily-Chatbot/commit/43ab83b3e3c5ccb9f7ed4b0d3a25534a906e8a64))
- natural scroll occlusion for sidebar nav ([21f21cc](https://github.com/lamat1111/Quily-Chatbot/commit/21f21cc3164a4c75e854a11cae6822b23b3976e0))

### Styles

- mute sidebar chat text color ([b2f861f](https://github.com/lamat1111/Quily-Chatbot/commit/b2f861f2828c2e429fe23832c7754a376ddf76a5))

## [0.4.0] - 2026-01-31

### Features

- update /sources command with live streams ([ac4ebf8](https://github.com/lamat1111/Quily-Chatbot/commit/ac4ebf81f5bd6d25fdcbf558d698450e4172ec20))
- add danger zone with wipe data option ([63c3e51](https://github.com/lamat1111/Quily-Chatbot/commit/63c3e51c9c966b73b5a235359b0bf67b7e4bd954))
- add user profile customization ([c2ee2ce](https://github.com/lamat1111/Quily-Chatbot/commit/c2ee2ce4467734dc1243bf3aeb428a97bac86f95))

### Bug Fixes

- improve Chutes OAuth workflow and UX ([15030d0](https://github.com/lamat1111/Quily-Chatbot/commit/15030d06162d6ddfd148dcedce3f127374aa8fa2))

### Styles

- implement semantic color system ([7124724](https://github.com/lamat1111/Quily-Chatbot/commit/712472423352653402323a82f6aeead6dc1fe899))

### Maintenance

- stop tracking .agents files except docs/ ([b192ddf](https://github.com/lamat1111/Quily-Chatbot/commit/b192ddfe834a2f0f5db6fff3f073c71e69f01221))

## [0.3.0] - 2026-01-30

### Features

- add push confirmation to release skill ([46d9141](https://github.com/lamat1111/Quily-Chatbot/commit/46d914129a82d1d6a117ee31c60c0b7b19fe070b))
- add starred chats and chat management UI ([a3d3d1e](https://github.com/lamat1111/Quily-Chatbot/commit/a3d3d1e71b72ded5f1642622cfb67869cc8e5566))
- add conversation search modal ([83d3ee8](https://github.com/lamat1111/Quily-Chatbot/commit/83d3ee8514b989a256a082426c49acad4e553da0))
- add estimated cost info to provider setup ([fd3979d](https://github.com/lamat1111/Quily-Chatbot/commit/fd3979dfea4e0cc70358060ac8e7e8b498e64962))

### Documentation

- update agents documentation and tasks ([3039337](https://github.com/lamat1111/Quily-Chatbot/commit/3039337fe3e1a1043d5ce7fb3adad5e9e3878d9c))

### Refactoring

- consolidate settings layout and move theme toggle ([9979803](https://github.com/lamat1111/Quily-Chatbot/commit/99798037b5875f4617d723d3018bb703eef5f500))

### Styles

- new og image ([366f701](https://github.com/lamat1111/Quily-Chatbot/commit/366f701829e41e38c6d864d46620dc197039d6bf))
- update og image ([61eccdb](https://github.com/lamat1111/Quily-Chatbot/commit/61eccdb8928f99a80df02606491610e1436724ad))

### Maintenance

- add report issues link ([224280e](https://github.com/lamat1111/Quily-Chatbot/commit/224280eed0ffbd01769610292fff3ff538290a41))

### Other

- Merge pull request #6 from lamat1111/dev ([56327d8](https://github.com/lamat1111/Quily-Chatbot/commit/56327d80664262143bceebbf4ff31eb5db690c3b))
- Merge pull request #7 from lamat1111/dev ([2304eef](https://github.com/lamat1111/Quily-Chatbot/commit/2304eefdd1caa8a6abea6465ab6af2e4031316fc))
- reorganize completed tasks to .done folder ([37b004f](https://github.com/lamat1111/Quily-Chatbot/commit/37b004f2ca6c08b20b63d38f8de6bdf74fad89a5))

## [0.2.0] - 2026-01-30

### Features

- **01-01**: initialize TypeScript project with dependencies ([d8eb269](https://github.com/lamat1111/Quily-Chatbot/commit/d8eb2697422c2ccc5bb42a15aff89443189a7356))
- **01-01**: create pgvector database schema ([a0d4ea9](https://github.com/lamat1111/Quily-Chatbot/commit/a0d4ea9e317df3c5df6b10a144144ad3150e8982))
- **01-01**: define shared TypeScript interfaces ([58593af](https://github.com/lamat1111/Quily-Chatbot/commit/58593af99636db6afbe68718bd7185c73e1abf7b))
- **01-02**: create markdown document loader ([91b8dc8](https://github.com/lamat1111/Quily-Chatbot/commit/91b8dc8088d95d821d4cb045eedfedcf71cd62f0))
- **01-03**: create batch embedding generator ([685ff12](https://github.com/lamat1111/Quily-Chatbot/commit/685ff12000f7f1670945246b5ec27f5654c6d043))
- **01-02**: create semantic text chunker with heading context ([01374c7](https://github.com/lamat1111/Quily-Chatbot/commit/01374c7b34b7778750b271106f160cc064bcb4c2))
- **01-03**: create Supabase vector uploader ([98a5db4](https://github.com/lamat1111/Quily-Chatbot/commit/98a5db4baee867fa5c698c9ab09b101a82bfef34))
- **01-04**: create CLI entry point for ingestion pipeline ([18f309e](https://github.com/lamat1111/Quily-Chatbot/commit/18f309ec890f81a35202916f7bd2e9b7768fd898))
- **02-01**: add RAG types and dependencies ([b8afcb6](https://github.com/lamat1111/Quily-Chatbot/commit/b8afcb6dc032e49c2f4f620d4e329be6895036ff))
- **02-01**: create Supabase client singleton ([953316f](https://github.com/lamat1111/Quily-Chatbot/commit/953316f583d04c1b0a8af7b7be36ad032120c2d8))
- **02-01**: create two-stage retriever with reranking ([d1947c2](https://github.com/lamat1111/Quily-Chatbot/commit/d1947c229c6a66da0d8e56ee62e7a996f6e54e7f))
- **02-02**: create prompt builder module ([0023898](https://github.com/lamat1111/Quily-Chatbot/commit/00238987b418055cfe54f256f7a3b5923eb307f5))
- **02-02**: create streaming chat API route ([0630fbe](https://github.com/lamat1111/Quily-Chatbot/commit/0630fbe1d16daf65c77f6a11e8d0b37bf286ca1f))
- **03-01**: configure Tailwind CSS 4.x and install chat UI dependencies ([d9981b0](https://github.com/lamat1111/Quily-Chatbot/commit/d9981b0256120fa1ea17e95d286b3a5ef2ecab7a))
- **03-01**: add shared hooks and OpenRouter utilities ([5a82fd6](https://github.com/lamat1111/Quily-Chatbot/commit/5a82fd65ab76b47b720263f35bdc3dc3cf5bf027))
- **03-01**: create Zustand conversation store with localStorage persistence ([aba22fd](https://github.com/lamat1111/Quily-Chatbot/commit/aba22fdcf19822b8fbcccf9ad0498ed2d959221f))
- **03-02**: add API key and model selector components ([6bf81f8](https://github.com/lamat1111/Quily-Chatbot/commit/6bf81f88ff29306dbe913ce6c4704daf6da43235))
- **03-03**: create MarkdownRenderer, SourcesCitation, and TypingIndicator components ([0582c18](https://github.com/lamat1111/Quily-Chatbot/commit/0582c180de3962f2e077f5c6ee1aba6c16dad2f2))
- **03-02**: add ConversationList and Sidebar container ([7de5f89](https://github.com/lamat1111/Quily-Chatbot/commit/7de5f8940e1b79bf2c4d5ee0bada5fb53ae67583))
- **03-03**: create MessageBubble and MessageList components ([e0799d0](https://github.com/lamat1111/Quily-Chatbot/commit/e0799d090dfa24cbd66002d3aa61d6094638a6bc))
- **03-03**: create ChatInput and ChatContainer components ([6e22388](https://github.com/lamat1111/Quily-Chatbot/commit/6e2238807411af206ede4681b220ef40180e33ea))
- **03-04**: integrate sidebar and chat into main page ([a70d5d9](https://github.com/lamat1111/Quily-Chatbot/commit/a70d5d9c80668687c1c4f4f13eb8b7308dce3174))
- **04-01**: install theme dependencies and dark mode variant ([0e098cc](https://github.com/lamat1111/Quily-Chatbot/commit/0e098cc8229ec249726663ca00fbdc69a1b8430b))
- **04-02**: create useCopyToClipboard hook ([b7123c6](https://github.com/lamat1111/Quily-Chatbot/commit/b7123c61a5310fee83f6beeb0c2394e24d8c415e))
- **04-02**: create CopyButton component ([a6a1509](https://github.com/lamat1111/Quily-Chatbot/commit/a6a15096d8689689cc44a7c855038349f3138f7e))
- **04-02**: create Skeleton loading components ([d605f3d](https://github.com/lamat1111/Quily-Chatbot/commit/d605f3de9d869f76e37c55524ddee1fe5ee46521))
- **04-01**: integrate ThemeProvider and make all components theme-aware ([37c22f7](https://github.com/lamat1111/Quily-Chatbot/commit/37c22f7cb2fb15d7a0808f7daf343c8a1a555960))
- **04-03**: add copy button to code blocks ([ef058db](https://github.com/lamat1111/Quily-Chatbot/commit/ef058db5a76851b8b8b67f75133d8a20ce9731da))
- **04-04**: create ApiKeyModal component with Radix Dialog ([9903a19](https://github.com/lamat1111/Quily-Chatbot/commit/9903a196dd7aa0a6dc2929815d3a2a328f3b8746))
- **04-04**: update Sidebar to use ApiKeyModal ([5537481](https://github.com/lamat1111/Quily-Chatbot/commit/55374811c2042ecf24eea7dd46561220c09dcba9))
- **04-03**: add copy button to assistant messages ([65c270d](https://github.com/lamat1111/Quily-Chatbot/commit/65c270d5f3ebea07e92680de5ae27c6025e71291))
- **04-05**: add global Escape shortcut to stop streaming ([cf0d3f1](https://github.com/lamat1111/Quily-Chatbot/commit/cf0d3f1c1f865cf7f98df07cebdfdcbb43ba39ad))
- **04-05**: add Ctrl/Cmd+Enter keyboard shortcut ([eea1b73](https://github.com/lamat1111/Quily-Chatbot/commit/eea1b7301bab41932a956662ff02f8cd3a5f9da4))
- **04-05**: improve loading skeleton with proper components ([3f8b760](https://github.com/lamat1111/Quily-Chatbot/commit/3f8b7604934c20f855bfd2c93c95316dd736ce37))
- mobile-first UI, settings modal, and branding ([30aa77c](https://github.com/lamat1111/Quily-Chatbot/commit/30aa77c2c43d974e24205bf7a3d74e955520881f))
- add GitHub docs sync and enhanced ingestion ([8af1a45](https://github.com/lamat1111/Quily-Chatbot/commit/8af1a4546116860e7905ab0ee2b8925177ca48c2))
- add Quily system prompt and commands ([edd1118](https://github.com/lamat1111/Quily-Chatbot/commit/edd11189e3b914ad42d94d9427d7eebd6e42fc70))
- add convenience npm scripts for CLI tools ([1196c69](https://github.com/lamat1111/Quily-Chatbot/commit/1196c69c64d9ae0505180c7c7664750ce5e58246))
- improve model selector with descriptions ([97ea079](https://github.com/lamat1111/Quily-Chatbot/commit/97ea07978bbe2ef1db26a800911f3f1aceb0fccd))
- improve API key UX and validation ([202b533](https://github.com/lamat1111/Quily-Chatbot/commit/202b5338753a012421320aad0fa0dff7aecbc9e5))
- improve RAG retrieval and add debug tools ([33e642d](https://github.com/lamat1111/Quily-Chatbot/commit/33e642d2df32d0eb0883c25608c0571515a700e3))
- improve RAG accuracy and model selection ([0f8783e](https://github.com/lamat1111/Quily-Chatbot/commit/0f8783eddcd5ebf1d3d00faa5dcd781be5c6e55b))
- add auto-growing textarea and custom scrollbars ([7e323a2](https://github.com/lamat1111/Quily-Chatbot/commit/7e323a2348310018af38af15757033994f4ddf4c))
- improve onboarding flow and API setup ([40932b5](https://github.com/lamat1111/Quily-Chatbot/commit/40932b5748f11beab2f404643e2bf7f7b4e9c714))
- add Icon component using Iconify ([7749d83](https://github.com/lamat1111/Quily-Chatbot/commit/7749d83b9bccd47794f0aae5c78697cce2e4bbf1))
- add About and Links pages ([a4431d8](https://github.com/lamat1111/Quily-Chatbot/commit/a4431d85d3e8e6c5a3e4ff82823b6426cd4350e3))
- add Chutes OAuth availability check ([7dab1fa](https://github.com/lamat1111/Quily-Chatbot/commit/7dab1fa03f0c8950f4dc46af46e5a14e6c1d2af5))
- add social sharing metadata and disclaimer ([2c18fca](https://github.com/lamat1111/Quily-Chatbot/commit/2c18fca41beda23d394f1b66a037cd68ad2e7c1c))
- add curated model lists with rich metadata ([7005fc2](https://github.com/lamat1111/Quily-Chatbot/commit/7005fc26194d7e56e9f3881eb73706e5e33d08b7))
- convert settings modal to page + add Chutes kill switch ([9d1416a](https://github.com/lamat1111/Quily-Chatbot/commit/9d1416aeee299500423219dffb0a2f761ba78cad))
- add dual embedding storage for Chutes provider ([4e9cf6f](https://github.com/lamat1111/Quily-Chatbot/commit/4e9cf6f9a6c2426ed9c76978aabbad5d7a271a54))
- simplify Chutes settings and fix embedding model ([b009edf](https://github.com/lamat1111/Quily-Chatbot/commit/b009edffa963187cca05a5a521ae01ebcde62c00))
- add dev API key bypass for Chutes testing ([e6dd889](https://github.com/lamat1111/Quily-Chatbot/commit/e6dd889492db4ccaaedf22ac3256f00dd8246978))
- consolidate to unified BGE-M3 embedding model ([ed2d147](https://github.com/lamat1111/Quily-Chatbot/commit/ed2d147f3a740f2fd2ffa8452a2c50c86d7016bb))
- set DeepSeek V3 as default model ([39db464](https://github.com/lamat1111/Quily-Chatbot/commit/39db464e99c25ce1cd867ff114febfbf609b4df6))
- add branding assets and Jost title font ([60a5937](https://github.com/lamat1111/Quily-Chatbot/commit/60a5937d2ddf05c461f36015a671d528de20eb84))
- graceful fallback for Chutes model discovery ([9c41c55](https://github.com/lamat1111/Quily-Chatbot/commit/9c41c5543f58e58362ad51706cb841568e1e6f48))
- add source_url support and sync-transcripts skill ([739d484](https://github.com/lamat1111/Quily-Chatbot/commit/739d484bc8f7c35e9a27a828779d09bb4bd2049a))
- improve provider setup UX and messaging ([7976fc7](https://github.com/lamat1111/Quily-Chatbot/commit/7976fc7b039dffc861922d6e8aa5582da0b875f0))
- add personality and jailbreak resistance to Quily ([2f9b849](https://github.com/lamat1111/Quily-Chatbot/commit/2f9b8499e03c2763c871b9d8fcaffe0be0ee27be))
- add 18 cleaned livestream transcripts with dedupe workflow ([a20fbb3](https://github.com/lamat1111/Quily-Chatbot/commit/a20fbb3a183a058443a55f558c0ac761e1eb7953))
- add insufficient credits detection for providers ([cb9d6f5](https://github.com/lamat1111/Quily-Chatbot/commit/cb9d6f51d70a1c6edadb78b4f46c18d2f9227975))
- show source type labels in citations ([c6e6fbb](https://github.com/lamat1111/Quily-Chatbot/commit/c6e6fbbe02d9e3106d67949bb4b898c772a76948))
- improve debug page with provider selector ([44d8b9f](https://github.com/lamat1111/Quily-Chatbot/commit/44d8b9faac9c1add857b433d5afdb02638039eec))
- add automated versioning and release system ([339be2f](https://github.com/lamat1111/Quily-Chatbot/commit/339be2fef6a483193571b889679fca7dfddcccc1))
- add external Chutes API key option ([750c021](https://github.com/lamat1111/Quily-Chatbot/commit/750c0212fb62ae2dcc14783b6022eae963b81651))
- improve API key settings UI and security ([48708c2](https://github.com/lamat1111/Quily-Chatbot/commit/48708c22435b36f891950503532b1f6c78a37a3b))
- add explicit auth method toggle for Chutes ([ca83bee](https://github.com/lamat1111/Quily-Chatbot/commit/ca83bee32a8d7564ffd60d179f25f991810cc1bb))

### Bug Fixes

- Windows path compatibility for glob pattern ([7171a2d](https://github.com/lamat1111/Quily-Chatbot/commit/7171a2df7a690229a15c68dfed4fd050812ed25d))
- **04-05**: add cursor-pointer to all interactive elements ([b8ba365](https://github.com/lamat1111/Quily-Chatbot/commit/b8ba3657216cbadca2d1a2e1af9f1b7f7e0376f4))
- **04-05**: use inline style for cursor-pointer on theme toggle and API settings ([521ba31](https://github.com/lamat1111/Quily-Chatbot/commit/521ba31ec1877830c276bfc1cce66fd5223a7c5c))
- **04-05**: add global cursor-pointer rule for all interactive elements ([2c93cda](https://github.com/lamat1111/Quily-Chatbot/commit/2c93cdadae5dd70b68189219c2af1eb273d2421a))
- **04-05**: add !important to global cursor rule and inline style to New Chat ([cc5a71b](https://github.com/lamat1111/Quily-Chatbot/commit/cc5a71bf727c03a30730d107685c2193771011cf))
- **04-05**: load stored messages when switching conversations ([ddd68da](https://github.com/lamat1111/Quily-Chatbot/commit/ddd68da1b42f9b7435749ce30eaf41daa914f5be))
- add text-start/end events for command streaming ([6b60e10](https://github.com/lamat1111/Quily-Chatbot/commit/6b60e10e8c53f3cac3a41bc3d839a55322447fe5))
- prevent empty message bubble during streaming ([796b3a8](https://github.com/lamat1111/Quily-Chatbot/commit/796b3a8cc22e9e058ce840369c13091f5e5d5685))
- improve source citations with proper URLs ([43eba07](https://github.com/lamat1111/Quily-Chatbot/commit/43eba0756439a2367b269abbb27847baf4985b84))
- correct source URL generation for citations ([e996898](https://github.com/lamat1111/Quily-Chatbot/commit/e996898f52611210f94e6fc0fef67309bc177574))
- improve UI icons and navigation ([184a400](https://github.com/lamat1111/Quily-Chatbot/commit/184a400db6b0f01836e6230de2ae9d98d654043d))
- Chutes streaming compatibility with AI SDK v6 ([06a5d57](https://github.com/lamat1111/Quily-Chatbot/commit/06a5d57c9fe9b60a0aff2e4734f02b9a495322ad))
- prevent sidebar flickering on navigation ([e7fcf3c](https://github.com/lamat1111/Quily-Chatbot/commit/e7fcf3cbb2306b6ba4034af4ba7a5868fce472a0))
- handle CRLF line endings in frontmatter ([ae2c54e](https://github.com/lamat1111/Quily-Chatbot/commit/ae2c54e3744fb5737a8ff8e70ac42a241ab2bb11))
- use correct embedding provider per user ([58ac4b8](https://github.com/lamat1111/Quily-Chatbot/commit/58ac4b8dfe11b64227e5c3db237ccaae846edfdd))
- add RLS and secure function search path ([3578a7f](https://github.com/lamat1111/Quily-Chatbot/commit/3578a7f1271f38cebf69e3c64a8cad91326a4259))
- use explicit extensions schema for vector ops ([a84d2ea](https://github.com/lamat1111/Quily-Chatbot/commit/a84d2ea08643e2a9acb46c54ff4b19523c977d15))

### Documentation

- initialize project ([1a05f24](https://github.com/lamat1111/Quily-Chatbot/commit/1a05f246413026007b5c9a75f561f213518febc7))
- complete domain research ([8a3eaf2](https://github.com/lamat1111/Quily-Chatbot/commit/8a3eaf238a917885bfa325c0660560eee8bfd868))
- define v1 requirements ([1b1d18f](https://github.com/lamat1111/Quily-Chatbot/commit/1b1d18f4737f798da0aef62ec4e820f03dd35582))
- create roadmap (4 phases) ([b65d731](https://github.com/lamat1111/Quily-Chatbot/commit/b65d7313d85fd4abe4683d7c4600791bfb9f3c35))
- **phase-1**: research data pipeline domain ([c6802fa](https://github.com/lamat1111/Quily-Chatbot/commit/c6802fa01a5034f43df1a3861758aa00acb5bbd2))
- **01**: create phase 1 data pipeline plans ([03d7b22](https://github.com/lamat1111/Quily-Chatbot/commit/03d7b226a461afe2431c384e2c34fbe942d1df6a))
- **01-01**: complete project foundation plan ([bd39b64](https://github.com/lamat1111/Quily-Chatbot/commit/bd39b645f6f8553337542c4a502713f99c8d1be0))
- **01-02**: complete document loading and chunking plan ([f4dcb64](https://github.com/lamat1111/Quily-Chatbot/commit/f4dcb64f9f0332b2d512085c4a830cdb8edbaf31))
- **01-03**: complete embedder and uploader plan ([89b4760](https://github.com/lamat1111/Quily-Chatbot/commit/89b4760545be676c70db5fc5a07e7f42c94fa310))
- **phase-2**: research RAG pipeline domain ([f266f42](https://github.com/lamat1111/Quily-Chatbot/commit/f266f424568c5983fd7643534dc12f3a7ecb6b9b))
- **02**: create phase plan ([05a06cc](https://github.com/lamat1111/Quily-Chatbot/commit/05a06cc826804345dd338d8d7ca3d658fbc039bb))
- **02-01**: complete RAG retrieval layer plan ([59a26aa](https://github.com/lamat1111/Quily-Chatbot/commit/59a26aa09071ed759b03955c3fcf2cc1e4a58065))
- **02-02**: complete prompt assembly & chat API plan ([b29b916](https://github.com/lamat1111/Quily-Chatbot/commit/b29b9168a05ee2cb220dc2de70978682cbe71160))
- **02**: complete RAG Pipeline phase ([a644130](https://github.com/lamat1111/Quily-Chatbot/commit/a644130f17893d1729d19f0a54ca4fe7f724d6db))
- **03**: capture phase context ([443e211](https://github.com/lamat1111/Quily-Chatbot/commit/443e211fbd4092991d23ea1b77477dddce9285da))
- **phase-3**: research chat interface domain ([06e3311](https://github.com/lamat1111/Quily-Chatbot/commit/06e33117fa9a1b3b228baa7bf1d625f1beffad27))
- **03**: create phase plan ([1f13c42](https://github.com/lamat1111/Quily-Chatbot/commit/1f13c42e7b9523452336b5fcada2ea4cbbda0827))
- **03-01**: complete foundation plan ([88b671b](https://github.com/lamat1111/Quily-Chatbot/commit/88b671bec25d920a36eb55b45afe95b06b42cc70))
- **03-02**: complete sidebar components plan ([043842e](https://github.com/lamat1111/Quily-Chatbot/commit/043842ec692454ffcbacbe6fe14042d2af471b29))
- **03-03**: complete chat components plan ([d344b91](https://github.com/lamat1111/Quily-Chatbot/commit/d344b91fcb8a0173871fb8d4a4b5724ee446144c))
- **04**: research phase domain ([947c8f6](https://github.com/lamat1111/Quily-Chatbot/commit/947c8f6075f638a81d2ec041ba453e380e37bca0))
- **04**: create phase 4 polish plans ([f0ce06f](https://github.com/lamat1111/Quily-Chatbot/commit/f0ce06fde1d9fd33f9eb0f013685970a96b364ea))
- **04-02**: complete clipboard and skeleton components plan ([782084b](https://github.com/lamat1111/Quily-Chatbot/commit/782084b679662ddc11246def52f150b040de4d29))
- **04-01**: complete theme toggle plan ([f96bd39](https://github.com/lamat1111/Quily-Chatbot/commit/f96bd397551954d84f8c59e82250417e8b0f5375))
- **04-04**: complete API key modal plan ([360dc93](https://github.com/lamat1111/Quily-Chatbot/commit/360dc93bb8b3076b9bbca809b899b7380fb80d1a))
- **04-03**: complete copy functionality plan ([3445958](https://github.com/lamat1111/Quily-Chatbot/commit/34459589ea4d7d1450ae6a4a1b5a9aacbf6b970c))
- add AGPL-3.0 license file ([049b188](https://github.com/lamat1111/Quily-Chatbot/commit/049b188415340aba65e3234abec7bc91f49e9460))
- add Quilibrium whitepaper extracts for RAG ([c1676e9](https://github.com/lamat1111/Quily-Chatbot/commit/c1676e96553e57ca865256a558aa37d658edc308))
- add frontend UI docs and update RAG workflow ([cabdbaf](https://github.com/lamat1111/Quily-Chatbot/commit/cabdbafc1f0ea0e1630adbfb3be33d6eeac1bd79))
- add task docs and cleaned livestream transcripts ([415e9d8](https://github.com/lamat1111/Quily-Chatbot/commit/415e9d851a26529ec7ed8995ed582868e787b47c))
- add versioning and release system documentation ([e29455e](https://github.com/lamat1111/Quily-Chatbot/commit/e29455e1d84c2da51fe914bffb0ae600e72c6b1f))

### Refactoring

- restructure docs folder for synced vs manual ([587b49c](https://github.com/lamat1111/Quily-Chatbot/commit/587b49c60b5d145bebe9332224ef5706c97f0e3c))
- replace inline SVGs with Icon component ([08fe38f](https://github.com/lamat1111/Quily-Chatbot/commit/08fe38fad3ed556af3179e8e523bb90208744d38))

### Styles

- apply brand colors and improve sidebar layout ([26e385d](https://github.com/lamat1111/Quily-Chatbot/commit/26e385d86554e9896c12523bdb2c9f86cb439ec9))
- apply brand colors throughout UI ([4a1b091](https://github.com/lamat1111/Quily-Chatbot/commit/4a1b091d23549fb89ae0b234f1352713c2508cb8))
- improve settings page UI and typography ([fbe245e](https://github.com/lamat1111/Quily-Chatbot/commit/fbe245ebb2fc623d231c3bfbcd7fe9bf25968511))
- improve about page version display ([eb64cf7](https://github.com/lamat1111/Quily-Chatbot/commit/eb64cf7beef6e97ebdd30fbb56b335861d577b65))

### Maintenance

- add project config ([6169d7d](https://github.com/lamat1111/Quily-Chatbot/commit/6169d7df9dfbffe772cfd3d5f741b5a53ed2912a))
- **02-02**: configure Next.js with path aliases ([cc92ffe](https://github.com/lamat1111/Quily-Chatbot/commit/cc92ffe4c3d634802b5db17589bb0c4676b492a7))
- trigger deployment ([6edf038](https://github.com/lamat1111/Quily-Chatbot/commit/6edf038cf00aa556980a5690dfa2d6dcbba5e83e))
- trigger deployment ([8327e62](https://github.com/lamat1111/Quily-Chatbot/commit/8327e62b8d853f086af80f2aa0d333bab75840e2))
- add project config and planning docs ([1b80caa](https://github.com/lamat1111/Quily-Chatbot/commit/1b80caa44ea665ee325143da423c571c7a756531))
- improve env docs and add model options ([509464e](https://github.com/lamat1111/Quily-Chatbot/commit/509464ebeaf01d9b7f093963ad32aa5a86c981d1))
- disable Vercel deployments for dev branch ([2d9a6a5](https://github.com/lamat1111/Quily-Chatbot/commit/2d9a6a546bc549aeaf88b40d33e412e6f1815549))
- update docs and remove dev scaffolding ([c58ba8f](https://github.com/lamat1111/Quily-Chatbot/commit/c58ba8f45ce43de4bb60014eb2ec13984e297326))
- remove GSD Dockerfile and docs ([0de327c](https://github.com/lamat1111/Quily-Chatbot/commit/0de327c5f04e278fc23071850b1da6f3d894bfab))
- add task spec and claude config files ([5ce496a](https://github.com/lamat1111/Quily-Chatbot/commit/5ce496ac4a65df9a759e7e7973f9382fc8fdcdb5))
- rename app title to Quily Chat ([4967970](https://github.com/lamat1111/Quily-Chatbot/commit/4967970df4192c21ff7964fb9c17e5210725d751))
- migrate from npm to yarn ([0a8d348](https://github.com/lamat1111/Quily-Chatbot/commit/0a8d348f6f19caddbf1a075b74124da913cbd932))

### Other

- Complete Phase 1: Data Pipeline verified and documented ([107483d](https://github.com/lamat1111/Quily-Chatbot/commit/107483da400b0c7ff1fd01d5215fbf52b15ff228))
- optimize streaming performance and UI ([8b2f758](https://github.com/lamat1111/Quily-Chatbot/commit/8b2f758fa8a116be1d9f445fc338814743534bfe))
- add chutes auth and discovery core ([b3e6c8f](https://github.com/lamat1111/Quily-Chatbot/commit/b3e6c8ff7b749cfc24bb29c032b33822b3043ebd))
- refactor provider and rag logic ([56f91ef](https://github.com/lamat1111/Quily-Chatbot/commit/56f91ef3e9e239712fc0d63a3a846251d42f5871))
- config and docs ([2d46de4](https://github.com/lamat1111/Quily-Chatbot/commit/2d46de46c4e3e2f6ea7b26b51f2a332d48cc1585))
- add AI chat renaming feature task ([e9366fa](https://github.com/lamat1111/Quily-Chatbot/commit/e9366fa06a37e244067993266b19cb12d7b5383f))
- Merge pull request #1 from lamat1111/sirouk-chutes ([8145812](https://github.com/lamat1111/Quily-Chatbot/commit/814581248446b092bfd0bb8cc6f687047f0e92c2))
- Merge pull request #3 from lamat1111/dev ([25aebc7](https://github.com/lamat1111/Quily-Chatbot/commit/25aebc706f8ba597e4cc4c5e4be60123083144b1))
- Merge branch 'dev' ([14c5a74](https://github.com/lamat1111/Quily-Chatbot/commit/14c5a7464333819e0d79601c4f14d0fcbd3d697f))
- Update README.md ([143c372](https://github.com/lamat1111/Quily-Chatbot/commit/143c3723c7a6ae98d3c99cefed5dea0554c5e716))
- Merge pull request #4 from lamat1111/lamat1111-patch-1 ([d9a64e6](https://github.com/lamat1111/Quily-Chatbot/commit/d9a64e60850cea5c035dab8084b9db0f1619d544))
- Update README.md ([0787a14](https://github.com/lamat1111/Quily-Chatbot/commit/0787a1466b559bc3863a7f880556fe472a3321f0))
- Merge origin/main into dev ([1813d93](https://github.com/lamat1111/Quily-Chatbot/commit/1813d93ab4eb79a6c7a13544f53c8dcb89fa27a5))
- Merge pull request #5 from lamat1111/dev ([314dae0](https://github.com/lamat1111/Quily-Chatbot/commit/314dae002362f711ac9e56283adb1210af8ce252))
