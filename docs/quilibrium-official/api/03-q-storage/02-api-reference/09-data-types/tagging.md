---
sidebar_label: Tagging
title: Tagging
---

# Tagging

Container for the tag set.

## Contents

### TagSet

Contains the tag set.

**Type**: Array of Tag  
**Required**: Yes

## Example

```xml
<Tagging xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <TagSet>
      <Tag>
         <Key>Project</Key>
         <Value>Project One</Value>
      </Tag>
      <Tag>
         <Key>User</Key>
         <Value>jsmith</Value>
      </Tag>
   </TagSet>
</Tagging>
``` 