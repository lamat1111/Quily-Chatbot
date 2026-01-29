---
title: "Quilibrium News, 2.1 Updates, and Hypersync Developer Talks"
source: youtube
youtube_url: https://www.youtube.com/watch?v=U-nwLcKNUPA
author: Cassandra Heart
date: 2025-03-10
type: livestream_transcript
topics:
  - version 2.1
  - hypersync
  - hypergraph
  - Apple developer status
  - UK encryption regulations
  - crypto market analysis
  - tokenomics
  - Q Console
  - decentralization
---

## Apple and UK Encryption Regulations

One of the things we've been talking about a lot is Apple, specifically that Apple has been caught in the crossfires of the UK's rules regarding the Investigatory Powers Act. It's kind of like the UK's more extreme version of the Patriot Act in the United States. One of the things that the Investigatory Powers Act does is it can mandate that companies are forced to decrypt content on behalf of the requests of their secret courts.

Apple has apparently received one of these requests and it is forcing them to essentially strip the Advanced Data Protection from their devices in the UK. It is a complicated situation. They obviously did switch out to the non-encrypted version, they removed ADP.

Apple was forced into this awful position and we've seen some back and forth between the US government and the UK government. It appears that now Apple is at the point where they are actually suing the British government and pursuing this case through these secret courts to push back on this. This is good news, but nevertheless we are continuing to monitor this case because it actually affects a lot more than just Apple - it affects all the companies that do business in the UK.

Right now we do not do business in the UK. We in fact refuse on these specific grounds because it's just too dangerous of a situation for us to get involved with. But as time goes on there's going to be an international presence that Quilibrium Inc will have, and we're going to have to always take the proactive stance of ensuring that we do not get caught in the crossfire of a situation like this.

Of course the protocol is built such that it doesn't matter if we receive such an order - the protocol will continue to function without the ability for such a back door to be instilled. However, it is the nature of the beast that these types of pressures will come eventually and it's something that is part of our expected fight. This is why we are a member of the Global Encryption Coalition.

## Apple Developer Status

We are at the home stretch with Apple. They've had a few back and forth items I've had to resolve with them. We're going to be making an update to our website to incorporate some details that they need - in particular they want a terms of service and then a privacy policy.

These are reasonable expectations to make out of tech companies in general for your products. In our case since we're an open source project and also a privacy preserving project, the privacy policy is "we don't record data on you." Our terms of service is going to be relatively standard boilerplate, just what will make Apple happy. Our privacy policy is going to be a lot less standard than your typical privacy policy where they talk about the litany of data they collect on you. In our case it's going to be nothing - we collect nothing on you.

The net result of getting this Apple developer account is that we're going to be able to begin rolling out our Quorum mobile beta for iPhones and Android.

## New Marketing Team Member

We now have a marketer on the team. I believe you've seen some of their handiwork in recent posts that the Quilibrium Inc account has been making. They're getting a lot more engaged on Twitter and I think it's going to be interesting to see how that develops over time. Very excited to have them on board - they're very good at what they do and I think that they're already starting to make a pretty good impact.

## 2.1 Status Report

If you're in the testnet chats you've probably already seen all of this information, but we are at the point now where hypersync - which has been this long story that we've been trying to get through to get to the final two tests of the Milestone 5 part of testnet's 2.1 release - we've finally gotten to the point where three nodes have fully reached 100% of the total data synchronized across peers and built up in the local hypergraphs.

What's very interesting now is that when we run rebuilds, those rebuilds run very quickly. I've actually tested this locally and it's processed. The speed of the hypergraph has gotten to the point where it's approximately 725,000 events per second, which is just staggering.

We've needed this because we need to be able to relay all of the data that has happened on mainnet and ensure that it safely encodes and is interoperable with the updates that are coming as part of the rest of 2.1.

It's been a real pain. I know that it's been really frustrating if you haven't been part of the testnet to just see that this has taken so long. But the net benefit has been significant improvements in performance and reliability, and also the fact that this is going to have dividends in additional applications for people trying to build things where you need large amounts of data synchronized between multiple peers for the sake of your application.

This will obviously be used for Quorum. Our current sync algorithm is not very great, and so we'll be adopting hypersync proper into Quorum in order to speed that up as well.

Once this has been verified that the actual finalized state is where it's supposed to be, we'll be moving on to the QCL testing and then removing the testnet beacon from the network. If those two things are wrapped up, then 2.1 will be ready for mainnet.

## Historical Parallels: Lessons for Crypto

### It's Never As Good or As Bad As It Seems

I know a lot of people have seen some interesting events over the past few weeks, and more events happening today that have been pretty hard to stomach, especially if this is your first season in crypto.

I think it's important to understand - I've said this many times and you'll hear this from pretty much every single person who has ever been an employee at a Y Combinator style company, or Coinbase specifically because Brian loves to talk about this a lot - but it's a really true phrase: "It's never as good as it seems, but it's also never as bad as it seems."

Even when things seem really rough and everybody is saying "this is the end, it's so over" - the reality is that there's always going to be extreme emotions tied into speculative bubbles. And that is what we are in - we are in a speculative bubble and we've been in one for quite some time.

I want to level set with people about their expectations when they think about this industry in a broader narrative, and more specifically what we're thinking about in terms of the nature of what Quilibrium Inc is going to be playing in the part of writing the stories of that future.

### Lesson 1: The Personal Computer Revolution - Expanding What You Can Do

In the 1970s there was this idea of the homebrew computer. People were first starting to learn about computers in a more personalized context, because before you had the ENIAC and these big vacuum tube filled machines. Then the advent of the transistor started to shrink technology down so these computers were not actually taking up the full size of a room. Eventually things were getting down to the mini computer.

Around the 1970s technology had gotten to the point where people were actually starting to experiment personally - they were starting to build out their own home computers. There were lots of schematics passed around through these homebrew clubs and there were also starting to be some consumer oriented hobbyist computer devices. But at the end of the day these were all very nerdy devices - you had to have a breadboard that you hand wrapped and wired yourself, and you had these very huge books that were guides on how to actually set this all up.

People just didn't actually really care. If you were a normal person that was not a nerd, you could see these things and be like "that's really neat but that's never going to sit on my desk." People were saying "this is the future" but most just didn't see it.

But think about what came out of that. During the 1970s there was one particular Homebrew Club - the Homebrew Computer Club - and there was a trio of individuals there that ultimately became the founders of Apple Inc. They introduced a personal computer at the Homebrew Computer Club called the Apple I. It was pretty janky - the prototype was a very clunky wooden thing. Nevertheless it changed the narrative a bit because instead of people having to manually build these things themselves, it was something people could buy - a consumer oriented device that really started to challenge the narrative of what a personal computer was.

By around the 1980s the personal computer had started to take off and people were actually using it for things that was more than just geeking out - people were starting to use these for financialized applications.

But there were some companies that couldn't get past that. That was their bread and butter - they sold to accountants, they sold to business leaders, and that was it. They thought that that was the depth of computing. You didn't really have teachers or creative artists quite getting into the realm of using a personal computer.

Through conversations that Steve Jobs and others at Apple had with individuals in those industries, he realized that the personal computer was not personal enough - that there were things that needed to be done that moved beyond finance. At the time that was basically received by the industry as a joke. People did not think that was necessary, that there wouldn't be money in it, that people wouldn't have a computer on every single desk in their home.

But he thought differently, and by consequence Apple quickly seized the entire market for education, seized the entire market for creative types, and ultimately blossomed into the Apple ecosystem that we know and love today.

I think about this lesson a lot because it's one of those moments in history where people are looking back at things like the early days of crypto where we're just beginning to eke out this idea of decentralized finance - challenging the notion of fiat rails, challenging the notion of interchange of value.

What I'm seeing is that exact same pattern play out again. We are seeing the world of crypto focusing just on finance. When you start to see things like people focusing on creators - they'll talk about the creator economy - but what you'll notice when you listen to what they're saying is that they are talking about putting creators into a financialized topic. Putting art on chain, putting music on chain and selling these things as NFTs. They are strictly focused on the financial. They're not focused on the things that artists personally care about.

Yes, to an artist there is a business side, but they are not strictly in the business of art - they are in the passion of art. It's these types of things that I feel like our industry is completely glossing over, and it's something that's going to blindside them when there is actually something much more capable and much more adept at handling what these individuals actually want to do to pursue their passions vigorously.

This is the axis of what you can do and what happens when the world starts to change that idea.

### Lesson 2: The 1983 Video Game Crash - Quality Enforcement

In the 1980s the video game industry was largely dominated by Atari, Magnavox and a few others. It was this idea of home video game systems where you'd release a new one every couple years, pushing out a bunch of video games that were usually brand deals - the most infamous one of course was the ET video game released during the ET movie.

Those types of games that were coming out were mass-produced, very quickly built, not very great. Over time there was this cycle of people pushing out new consoles, pushing out a bunch of rehashes of the same games with the same rules with the same ideas.

At a certain point it was reaching market saturation where people did not actually want to buy a new console. They didn't want to buy these games because these games sucked.

By about 1983, which was roughly the peak of the video game industry, they were sitting at about $3.2 billion in total revenue that year (about $10.2 billion in current dollars). In roughly two years they completely cratered down to annual revenue of about $100 million.

Why? Ultimately it comes down to people being flooded with a bunch of stuff that they didn't want. It's that simple.

There's this parallel that you can start to see with crypto. Right now with the various hype waves that have happened - the original ICO hype, the NFT hype, even DeFi summer had its own unique hype because it propped up a bunch of algorithmic stables that ended up wrecking people's lives - and then of course the current meta of the meme coins which is starting to reach market saturation where people are realizing "this is garbage, I am just gambling, why am I doing this."

We're starting to see this financial rejection in play. Obviously there are broader market consequences happening right now and people will have all sorts of theories about how it's the tariffs doing this, or some other longer economic story like a recession that's been impending. But in reality we are actually seeing that same kind of crash that happened in the 1980s.

What went wrong and what got fixed? What led to the video game era that we know today? Because most people have played video games and we don't really think about the infamous Atari landfill - that's such a transient moment of history. We just remember the Atari landfill but gaming's not gone.

So what happened? Analysts were dooming Atari, dooming Magnavox because they were in bad financial state. They were saying this is the end of the home gaming industry. They blamed home computers and the poor quality of games as the reason why the game industry was over.

What's interesting is that by 1985 there was a relatively unknown game company, unless you frequented arcades, that made mostly playing cards and arcade games. They were based out of Japan and they re-envisioned how to approach the gaming industry.

What they thought was: "We need to think about how American consumers currently see this industry - they see it as them getting screwed, getting ripped off, not getting a good entertainment experience."

So they set up a quality bar where you had to, as a game publisher, meet this quality bar before they would license your game to run on their console. What was happening with Atari is anybody was just publishing games and there was no quality bar at all.

Ultimately Nintendo released the Famicom in Japan as the Nintendo Entertainment System in the US. They stylized it like a VCR so people would associate it with common elements of home entertainment systems - things they already had strong quality experiences wrapped around - but instead with video games. They had the Nintendo Seal of Quality, which was their quality check and gate that prevented crappy games from being distributed and destroying the industry.

History was made with that. The NES is a cornerstone of video game history. It was a watershed moment for the industry - it changed how things were done.

I want to talk about this in the lens of what's happening in crypto. We are seeing that same quality failure - not just meme coins but the mimetic tendency for people to jump on hype trains of completely unchecked assumptions. This financial degeneracy has no quality gate, resulting in people making very poor financial decisions. It's burning people and making people feel like crypto is a scam and that there's nothing good in it.

That comes entirely from the fact that we have a lack of quality enforcement.

### Lesson 3: The Dot-Com Bubble - Long-Term Planning

In the 1990s there was a cadre of early internet companies. A lot of people saw the early days of the internet as this unique idea that let people exchange information in ways that were much more personal than having to call somebody. It was connecting people in unique and interesting ways and introducing multimedia in ways that were much more interactive.

Early companies started to jump on top of this. Of course at the time we didn't have significant bandwidth - you couldn't do live chats over video, you couldn't have streams like Twitch. These things were not yet viable because the technology was lacking. But nevertheless the dreamers and the idealists created these very large companies.

You had search engines like Google, AltaVista, Yahoo. You had e-commerce companies that differentiated into small silos like Pets.com very infamously. You had online delivery services. And then there were internet service providers like CompuServe, Prodigy, and America Online (AOL).

Around early 2000 in March, there were so many of these companies that had propped up IPOs, trying to dominate the market under whatever it was they were trying to do. Realistically they didn't have business plans that panned out under the current state of technology that existed at the time.

By consequence you had what was the dot-com bubble bursting.

There were a few companies that had just started shortly before then, often in those same domains that were producing failures. You had Yahoo and Google, Amazon and eBay. Besides AOL you had a cadre of small internet companies getting into niche services like high-speed broadband - at the time that wasn't niche, it was expensive - laying down the groundwork of things they knew were going to take a long time to achieve.

The market punished them significantly, but they made the right decisions to ensure they were in it for the long haul - making generational decisions they'd be able to capture or capitalize on in years to come when everybody else was making short-term decisions that were just not feasible for a business.

As a consequence, after the bubble burst and all the other companies died out, you had Amazon, eBay, PayPal from the eBay generation, a few different ISPs, and of course Google and Yahoo basically dominating the industry and becoming titans.

This is what I'm basically seeing again to draw a parallel in crypto today. Unlike the other two categories where it's the difference of what you can do or a quality enforcement bar, in this case it's planning for the long-term - planning for the long-term generations of what technology is going to enable.

## The Three Pillars Applied to Quilibrium

These are the three pillars that I think of historically as playing out in crypto all at the same time. There's a lot of overlap in how these stories played out and in the ideas that formed around them, but I think it's important to think about these because these parallels are how we are defining what we're doing as a company and what we're doing for the protocol in order to ensure its long-term success.

### Pillar 1: Expanding What You Can Do

In terms of what can we enable, we think less about finance. Finance is a part of it, but finance is just an application. We think more about what other people need, what other industries need. We think about what type of creative works can be enabled.

When you talk about the problems that technology solves, if you're designing something just for the sake of creating a solution in search of a problem - which is something that typically gets flung at the crypto crowd - it's because what people are solving needs to be something novel or else nobody's going to use it.

What crypto actually uniquely solves in applying those properties is something very valuable.

What creators are having problems with today - this is where we get into contentious topics. The way that AI art has damaged artists: these models are being trained on artists' content that's been posted in public websites, and these artists aren't being compensated for this training data. The art that gets produced by these machine learning models is so derivative of such a mass of different things that you can't uniquely link it to the original creators. By consequence they get no attribution, they get no reward, and they didn't get to have any say in whether that data is being used to train.

This is something I focus on in how we're trying to promote Quilibrium's use and adoption. One of the unique attributes of crypto in general is being able to have attributable ownership of data - the idea that you own your data and you control your data. More specifically with a privacy preserving protocol, you control who sees your data and who can have access to your data.

Compounding it a step further with the ability for decentralized compute to perform things like machine learning on top of that data - you as an individual artist are able to contribute that into the training models. The tagged data that associates it to you flows all the way through such that when inference is run on that model, it attributes the ownership of the original data that was used for the production of that particular image or written work or song, flowing back to the original creators.

When that inference is run and is paid for, the people involved as creators are getting a split.

This is one of the most important things to think about when we're talking about what we're trying to do. It's the ability to combine, to compose these broad concepts that are emerging in the industry, and do so in ways that are unique and novel and actually solve people's problems.

### Pillar 2: Quality Enforcement Through Social Consensus

Some people have seen the early days of Quilibrium where we were building a lot more in public. We still build in public - that is something I try very strongly to continue doing. But the way we build in public is much more about the active right now, whatever the pressing moment is that people are more broadly aware of.

One of the things I had shown early on was our Q Console, which is our answer to Amazon Web Services' AWS console. One of the things that if people paid close enough attention to what we are introducing - it's rather unique. We are introducing an encrypted end-to-end version of S3, we are adding a multi-party computation version of Key Management Service. We are leveraging all the unique qualities of Quilibrium's network to provide incredible value-adds to those services that we're going to be exposing through the console.

But one thing people haven't quite picked up on - and it's probably because I haven't talked about it to a significant enough degree - if you were observant enough you would have noticed there is a social component.

That social component is really important because decentralization is freedom. Decentralization enables people to do things permissionlessly. As a consequence of that permissionless nature, we have seen this industry under repeated assault through crappy scams, crappy NFT projects, crappy ICOs, crappy meme coins. As a consequence the industry has been harmed in ways that almost feel irreparable.

Now again, we are creating a decentralized protocol, so we can't just fulfill the Nintendo seal of quality. We can't just control what is being launched on this network - it is a permissionless protocol.

This has to be fed back into the design of things like Q Console. How do you add a quality bar to a protocol that enables people to create whatever they want? The answer is through exposure.

The nature of what we're doing with Q Console is a decentralized application that you can manage your services in the same way that you manage things on AWS. But we are exposing elements that people can use and adopt.

For example, let's say I made a frontend for managing a decentralized exchange and I wanted to share that frontend so that people could make remixes of it, could plug it in as a small component. If I'm building a website that has a token of its own and I want people to be able to use that token, but this token's relatively new and people don't have it, I could take that DEX component, plug it into my own application, expose that as a simple component so people can make the swap into the token that they need in order to continue their action.

That type of composability is something that AWS as a console does not expose - they don't have this idea of people sharing things.

But what's unique is that because there's an easy path for people to share their applications or application components in a way that developers can adopt other people's works, there's a quality bar issue.

By consequence, the nature of how we are generating that social component of the Q Console is going to essentially be through user adoption, user voting, and user engagement around these ideas. Essentially we are using that as a way to decentralize that Nintendo seal of quality component to help ensure that the quality bar of the things that people are using is consistently raised higher and higher.

That social consensus is something that hasn't really been captured very well for anything yet other than actual social media. I think that's a unique dynamic that people haven't really come to terms with yet because there hasn't really been anything else that's done that yet. I think that's going to be one of those surprising moments that people will look back on and say "this is what was unique, this is what actually made a difference in changing the way that this industry functioned for the long haul."

### Pillar 3: Long-Term Tokenomics and Generational Planning

The way that we're thinking about things in terms of overcoming the bubble that's potentially actively bursting right now is the way in which we actually design the tokenomics of the protocol.

One of the things that people have seen as history's played out with Bitcoin, Ethereum and others, is that in order to have sustainable tokenomics there has to be something that thinks more in terms of the longer generation by generation approach.

The way that we incorporate generations into the actual consensus algorithm's reward output itself is literally by measuring the computational speed of the network.

There's been a few other projects that have leveraged some sort of supply-demand dynamic. We're not quite doing that in the same way. We do have a dynamic fee market for transactions - if there's a hot interval causing a lot of friction for getting traffic to flow through successfully, obviously the fees would rise to address the congestion. But that's not particularly unique or novel.

What is particularly unique or novel is instead of having something that is essentially a 10 or 20 or 50 year horizon where the token issuance flattens out (if it's a proof of work scheme) or an economic policy of an overtight trading percentage over time that eventually goes to 0% issuance - instead of doing that, we've taken this notion of hybridizing this proof of work system.

You do have tapering issuance because there are natural stages in which the market reaches saturation, and you can see that happening in practically every industry over the course of about 10 years, over and over again.

Instead of simply succumbing to those patterns and designing a short-term thing that will rapidly hype up and not matter that it tapers off because you're just in it for the short term, we're thinking about it for the long term.

Every single one of those 10-year cycles we want to actually capture the new generation of technology that has emerged, incentivize its adoption and use, and also give people a new opportunity as newcomers to participate meaningfully in the protocol in ways that are very hard to do when you get into later stages.

For example on Bitcoin, you do not have people running new miners today who have not been in the mining space to any significant degree. You'll have a few hobbyists that try this, you'll have a few people who will buy one of those mining rigs and try it, but you don't actually have large masses of people suddenly deciding "I'm going to become a Bitcoin miner" because realistically the competition bar is way too high.

Mining pools have basically consolidated into a handful of maybe three to six individual organizations and they control the majority of the hash rate of the network. That's very harmful to the economic security of the network.

Very similarly with Ethereum there is the same problem with the nature of how much capital has converged on people who are willing to put forth the effort to do validation. By consequence you have Lido and Coinbase essentially being over 50% of all staked ETH.

You can make arguments that these are good stewards of the protocol, that they have no interest in engaging in malicious ways. But that's not important. What's important is that if the protocol is intended to be decentralized, then your goal is to get as many people to actively participate in the decentralization of that protocol and not converge onto a handful of a small set of individuals.

This is something we're even seeing right now in our own 2.0 release where the nature of how the mining algorithm currently works is producing a lot of convergence - it's getting into a smaller number of individual nodes that are participating. That is not ideal, that is not healthy.

That is why we are pushing so hard and so fast to get to 2.1 where the proof of meaningful work algorithm works in a completely different way - things are more sharded out, it is much harder for miner centralization to be a pressure of the network.

That comes back full circle to the nature of how we are planning for the long term of the network.

When you look at how history repeats, there is this nature of people to just not consider how those things happened and apply them to how things are currently happening. They'll argue "this is too new, this is too unique, this won't happen again in the same way." And yet we just find ourselves making the same mistakes and making the same decisions and same outcomes ultimately emerge.

That's what's playing out today. This is how we think about the nature of how this company is meant to operate, how this protocol is intended to be built, and how we intend to solve some of the most severe harms that have happened to this industry.

## Developer Deep Dive: Hypergraphs vs Blockchains

### What is a Hypergraph?

Previously I've talked about what a hypergraph is. Short story if you haven't been around for that before: if you know what a graph is, it's pretty simple - it's either directed or undirected, it's vertices connected to each other by a series of edges.

Some graphs allow you to have multiple edges connecting to the same vertices, sometimes they don't allow that - they only allow one edge. Sometimes they're directed so there's an arrow that points one of two ways. Sometimes there's rules about the graphs where you can't have cycles in the graphs if it is a directed graph.

All of these things are really cool and have led to a lot of unique technology. Graph algorithms are used for things like input lookups - when you are typing into the search box on Google and it's giving you autocomplete suggestions, that's actually a graph search algorithm producing those results for you.

So graphs are really useful. But graphs don't capture all the elements of the world, all the things that we need to do to reason about or associate data with one another. There's simply not enough dimensionality.

What hypergraphs do is essentially add that extra degree of dimensionality. It's breaking one of the rules - instead of an edge just being two vertices connected to one another, it is an edge that can connect multiple vertices together.

Depending on the nature of how you draw a hypergraph or represent it, there's two pretty common ways - you either draw a blob around the vertices, or you draw this weird funky line that intertwines the connections into one singular connection between multiple vertices.

Whatever the case, a hyperedge is basically an edge that connects more vertices together. Just like regular graphs they can have the same rules where there's arrows, or you can have the same idea that there's no cycles between these.

There's also another degree of dimensionality that exists where hyperedges can also encapsulate in some systems hyperedges themselves. So an infinite recursion of hyperedges can unlock a lot of interesting data models.

### Why Quilibrium Uses Hypergraphs

What's really important for us in Quilibrium and why we are building around this hypergraph model is the fact that hypergraphs can actually encapsulate practically every data structure that we would possibly be interested in.

If you've been in computer science in college you've probably heard the argument that a hash map is basically the same thing as a graph because you can represent this key value association that can point to other elements and that essentially is the same thing mathematically as the construction of a graph.

But when you get into what hyperedges can represent in terms of relationships, it unlocks a lot more than just a simple set mechanic, a simple key value set. You can do all sorts of associations to the point where you can actually extend out the entire relational data model.

When you're talking about RDBMSes like MySQL or Postgres, or wide column databases like Apache Cassandra or Keyspaces on Amazon or ScyllaDB - these are all things that can be represented in the hypergraph model.

When you talk about the nature of how you structure data and you enforce the validations of that data - the schema that represents that data - the schema itself can be represented on a hypergraph. That's the reason why we use a hypergraph.

Hypergraphs can encode those relational bindings and enforce them structurally without having to actually implement those specific rules unique to each specific situation. If you instead encode it to the hypergraph, the hypergraph will naturally enforce it through the use of its rules.

### Blockchain Structure and Limitations

What does that actually mean? When you're building an application that is using blockchain, a blockchain is simply put a collection of blocks that contains a root element in its header that points to a series of state transitions. These state transitions are encoded as a collection of usually transactions, and they are collectively hierarchically placed into a tree - a tree structure called a Merkle tree.

The purpose of a Merkle tree is to essentially encapsulate - depending on how you do it, whether you do zero leaves or if you just simply traverse all the way up - if you are constructing a Merkle tree from these events, you then essentially take the hash of these leaves together into the next rolling item of the tree, the next branch.

In other words: hash of transaction 1, hash of transaction 2, and then hash of those two hashes, and then the same thing at the next level all the way up to the root. Then that root is encoded and stored in the header of the block. All the transactions are included in that same block and then the network publishes that block of transactions.

The reason you would do this is because you want something that sequences data in a linear fashion. You want every single event to have a strict global ordering, and that can be very useful for things that conflict with one another.

Where that gets problematic is when you're trying to encode a lot of data and a lot of events. You'll see a lot of these networks come up with really interesting ways to try to address the speed bottleneck.

Sometimes you'll have approaches that use sharding in order to have each individual shard of the network - whether it's a collection of addresses that have balances or a collection of unique properties that dictate what shard a transaction would fall under. They'll just have an individual queue for each individual shard and then collectively they will be responsible for maintaining their shard state. Then there is a larger consensus wrapped around the collection of shards.

This is kind of essentially what NEAR Protocol does with their Nightshade consensus. It's also what we use for Snapchain at Farcaster. That works when you are limited to a small series of state changes that are going to be recognized across all of the shards, and it will work very well for high throughput situations when you know that you have a minimal amount of conflicts and those conflicts will almost always be strictly bounded to whatever your shard logic is.

In the case of Snapchain it is based on accounts. In the case of NEAR Protocol I believe it's also based on accounts.

At the end of the day the purpose of these shards is a way to essentially delegate how much of the work is being handled by each individual node that is being used for consensus. And in the typical blockchain fashion you still end up with a header that has a block hash and then you have a reference to the previous block hash in that header. Usually there's some other hash that is basically an unforgeable value for the entirety of that block.

In the case of Bitcoin that hash is actually used to determine which is the winning block - the proof of work output. But at the end of the day there's just some sort of basis that uniquely characterizes that block.

That level of performance means that you are limited in the nature of what kind of applications you can build. Even if you do something like sharding, you still end up with a scenario where you have to limit the amount of throughput because there is an intrinsic bottleneck no matter how far you shard the network out. There's still an intrinsic bottleneck because you still have to have block producers and those block producers are still going to have some amount of data that they have to hold and collectively maintain consensus over for the network to not halt.

So that is the problem with blockchain.

### Quilibrium's Verkle Tree Approach

What we're doing differently with the hypergraph model is that the hypergraph model is not even something that operates as a Merkle tree. The underlying structure of the hypergraph isn't maintained as a Merkle tree. We actually use a different structure called a Verkle tree.

It's pretty similar in the sense of its purpose - it is a vector commitment scheme. But the difference is that we use the Verkle tree because it makes our proofs a lot smaller. Proofs actually matter for us because unlike sharded models, that particular model requires data to still be passed around.

If I was account 1 over there and I wanted to prove to account 2 that I exist and I made these posts, I would actually have to send a whole lot of data over in order to converge on an accurate Merkle tree proof.

Whereas a Verkle tree has this really cool property. Let's say that I have a singular point of data and I've got a billion records that fall under this particular Verkle tree. If I wanted to prove that to you, depending on the actual branch width of the tree - and in the case of Quilibrium our app trees are at 64 branch width - so essentially log(1 billion records) divided by log(64), that's about 4.5.

When you consider the fact that the root is shared across the network as part of our actual global consensus, we just care about that root point. That actually ends up meaning that in order for me to prove any piece of data on the network to you, I only have to send you four points - those four hops on the tree that essentially encode that piece of information.

### Why Use Trees for Hypergraph Data?

But this is a hypergraph, it's not a tree. So why is this tree here when we're talking about a hypergraph?

This comes back around to the other scalability concern. If I wanted to prove data to you or needed to relay this data to you, you have to go through a lot. You have to go through the process of obviously receiving whatever that transaction was, receiving the proof that that transaction was appropriately encoded into the global state, and then I also have to evaluate that its presence in the tree was accurate - that the sequence of events wasn't played out of order.

All of these different elements that relate to having to handle a lot of encoded state transitions versus something that is just implicitly true.

The nature of how we do things in the hypergraph in Quilibrium is that when you are making a change, that state transition has a proof associated with it. That associated proof is essentially determining the validity of that state change in the first place.

Because the amount of proof that you have to communicate over is strictly bound to those specific linear steps in the hierarchy of the tree, you actually have enough data that you can very quickly send two pieces of information over: the proof and then the lineage proof of the tree membership.

### Two-Phase Set Structure

Then from the tree in order to actually represent this hypergraph data, we essentially do a two-phase set. That is encoded as a tree.

A two-phase set is essentially adds and deletes. If you've never done CRDTs before (Conflict-free Replicated Data Types), you essentially end up with these two grow-only phases of sets that encode that data.

One is our vertices, one is our hyperedges. And then from that you end up with essentially four collections of trees: one is the additions tree, one is the deletions tree for vertices, and then the second set of those two trees is for hyperedges.

What you can do from that data is: because I have given you a proof of that state change and I've given you the lineage proof of those vertices, you also have enough information to check on the corresponding other tree to confirm that that data hasn't been deleted.

By consequence you have something that - based on the fact that you're only needing to keep track of the roots that are collectively being shared across the entire network - I only have to give you a very tiny amount of information for you to validate that the data is correct and that that data has not been removed due to a state change.

So that actually saves you as a user of the network a lot of time and a lot of effort, or as a node on the network a lot of processing, in order to feel assured that the data and the action that is being passed to you is accurate and something that you can actively act on right now.

### Sharding Capability

Finally, the other aspect of this is that because this is a tree structure for these pieces of data and because the individual commitment schemes have an intrinsic polynomial nature into the representation of this data, you can choose what sections of the tree it is that your node is going to be able to cover.

By consequence you can actually make your node process only a specific subset of the shards of data such that you can cover what is capable of your node to be able to handle. So in other words you can limit it - "I'm only going to cover half the network" - okay then you've only covered half the network, and it's easy to divide.

### Hypersync Performance

This difference of why we have this is important for being able to represent incredibly large amounts of data, perform incredibly large amounts of operations on that data very quickly, and most importantly be able to synchronize those changes on that data very quickly.

This is the reason why when I did the replay earlier, I was able to evaluate over a billion state changes in approximately 23 minutes, which is somewhere around 750,000 operations per second. And that's just for a single shard.

When you expand this out to the overall number of shards that exist on the network, that actually becomes really impressive in terms of how fast you can scale out the network and how widely you can scale out the network.

That's the reason why we're doing hypergraphs versus blockchain as our data structure of consensus.

### How Hypersync Works

Hypersync is essentially just a tree walk algorithm where both parties are walking down the tree simultaneously, picking out the things that don't match. Because again this is a polynomial commitment scheme, you will know at a given branch whether or not there is any further to go because it will either have the same proof or it won't, and that'll tell you to keep going.

That works relatively quickly now that we have worked out all the bugs if you have been following the testnet channel.

## Q&A

**How many people are developing 2.1?**

At the company we now have three individuals working at the company excluding myself. Outside of Quilibrium there have been 37 contributors to the protocol itself - some at varying degrees of capacity, some have contributed a lot more, some have contributed only a little bit. And that's just in terms of actual code.

There's also been a few contributors who have contributed reports that were either performance related or even vulnerability reports historically - reporting where it happened, why it happened, so it's more than just a "hey this is happening" report but rather "here's how this is actually happening and here's what you can do to fix it."

So there are people even outside the 37 developers that are directly on the git log as being contributors to the protocol.

---

*Last updated: 2025-03-10*
