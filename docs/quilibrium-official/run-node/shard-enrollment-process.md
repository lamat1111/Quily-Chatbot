# Shard Enrollment Process

A node by default utilizes automatic shard enrollments based on which mode the user selects.

## Enrollment Modes
### Automatic Enrollment Modes

| **Mode**               | **Description**                                                                                           | 
|-------------------------|-----------------------------------------------------------------------------------------------------------|
| **Data Greedy Mode**    | Nodes prioritize covering as many shards as possible, provided they have the capacity.                 |
| **Reward Greedy Mode**  | Nodes join the shards that prioritize rewards over broad shard coverage. |

### Manual Enrollment
Node operators may choose to manually enroll in a shard based on their own intuition, observations, or strategic advantage.

This is a risk vs reward strategy, for instance the automatic enrollments for the reward greedy focuses on PoMW take rate and average fees in the current frame/epoch.

However, there will be instances where an up-and-coming application is not performing as well it will later after adoption.  A node operator may choose to enroll earlier and accept lower rewards, for now, in anticipation that it will later accumulate more fees/rewards and securing a higher ring with due to less node operator competition, essentially taking advantage of that shard's current obscurity.

#### Finding App Shard Locations
App shard locations are public knowledge and will found on the [Quilibrium Dashboard](https://dashboard.quilibrium.com).

## Phases

### Shard Enrollment Announcement
When a new shard is announced to the network or an existing shard requires additional coverage, stock nodes utilizing automatic enrollment modes respond based on their configured strategies.

### Commitment Collection Phase

During this phase, the network collects proposed shard join commitments from interested nodes. These commitments are cryptographic in nature, ensuring security and integrity, but they are not binding promises to join. Nodes submit their intent along with proofs of seniority, which help determine their potential position or ring within the shard's reward structure. This collection occurs over a predefined number of frames to allow sufficient participation.

### Announcement and Opt-In Phase

After the collection period, the network announces the sorted set of commitments, reflecting the potential hierarchy or rings based on seniority and other factors. At this point, nodes can:
- Opt in to officially join the shard if the conditions (such as reward ring placement) are favorable.
- Back out if the final arrangement is not worth their resources or if they anticipate lower rewards.

Nodes must respond during this phase, confirming their decision. If joining the new shard requires reallocating resources, such as deallocating a worker from an existing shard, the node will perform this adjustment at this time.

### Enrollment Confirmation Phase

Once the confirmation period concludes, nodes that have opted in are officially enrolled as provers for the shard. At this stage, they are expected to begin proving tasks as per the shard's requirements. Failure to perform these duties will result in penalties and loss of rewards.
