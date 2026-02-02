---
title: RDF to Hypergraph Query System
source: Quilibrium Whitepaper
pages: 22-27
section: "4.3-4.5 - RDF to Hypergraph, Query Planner, Query Evaluator"
date: 2025-01-28
---

# RDF to Hypergraph Query System

This document describes how Quilibrium maps RDF (Resource Description Framework) data to hypergraphs and implements oblivious query planning and evaluation using SPARQL.

## Hypergraph Construction

### What is a Hypergraph?

**Hypergraphs** are a generalization of graphs where edges (called **hyperedges**) can connect **more than two vertices**. In a regular graph, an edge connects exactly two nodes. In a hypergraph, a single hyperedge can connect three, four, or any number of nodes at once.

This enables expressing higher-degree relationships that any variety of database model can directly represent.

### Why Hypergraphs?

- Any database model can be directly expressed over a hypergraph
- Enables query patterns that can be efficiently made **oblivious**
- While not always faster than traditional structures, the generalization enables privacy-preserving computation

## RDF Basics

**RDF (Resource Description Framework)** represents data as triples: **(Subject, Predicate, Object)**

- **Subject**: The entity being described (a URI or blank node)
- **Predicate**: The property or relationship (a URI)
- **Object**: The value or related entity (a URI, blank node, or literal value)

Example: `(Alice, knows, Bob)` or `(Document123, hasAuthor, Alice)`

## Mapping RDF to Hypergraphs

Quilibrium converts RDF graphs into hypergraphs using this approach:

### Core Concepts

1. **RDF Graph**: A collection of vertices (subjects and objects) connected by edges (predicates)

2. **Hypergraph Conversion**: Each predicate becomes a hyperedge connecting all the subject-object pairs that share that predicate

3. **Overlapping Hyperedges**: Two hyperedges overlap when they share common subjects, objects, or predicates. This overlap is important for query optimization.

4. **Predicate-Based Index**: An index structure where predicates are organized by size (number of associated triples), with smaller predicates linked to larger ones. This enables efficient query path planning.

### How the Conversion Works

1. Collect all subjects, objects, and predicates as vertices
2. For each predicate, create a hyperedge containing all subject-object pairs using that predicate
3. Build an index that connects predicates based on their overlap relationships

## SPARQL Queries

**SPARQL** is the query language for RDF data. A SPARQL query contains:

- **Query form**: What type of result is requested (SELECT, CONSTRUCT, etc.)
- **Match pattern**: The triple patterns to match against the data
- **Constraints**: Filters and optional clauses

### Query Graph

When processing a SPARQL query, Quilibrium builds a **query graph** where:
- Variables from the query become vertices
- Predicates connecting those variables become edges

### Query Path

The **query path** determines the order in which predicates are evaluated:
1. Start from the smallest predicate (fewest matching triples)
2. Follow connections to related predicates
3. This minimizes the amount of data processed at each step

## Query Planner

The query planner prepares queries for oblivious execution.

**Roles**:
- **Sender**: The key holder for relevant resources
- **Receiver**: The cluster(s) responsible for the hypergraph

### Planning Steps

1. Parse the SPARQL query into a query graph
2. Identify which predicates need to be evaluated
3. Determine the optimal query path based on predicate sizes
4. Prepare the query for oblivious transfer execution

## Query Evaluator

The evaluator executes queries while preserving privacy.

**Key property**: The sender being blind to receiver decisions makes the query being processed **indistinguishable from gossip requests** for additional data blocks.

### Evaluation Steps

1. **Load Node**: Execute the first predicate in the query path, retrieving matching subject-object pairs

2. **Load Neighbor Nodes**: For each subsequent predicate, load data that connects to already-loaded results

3. **Process Query**: Combine all loaded data into the final query result

## Cost Model

Quilibrium measures query costs in terms of:

- **OTs (Oblivious Transfers) required**: Each predicate evaluation requires OT operations
- **Storage costs**: Storing vertices and edges in the hypergraph

The cost of creating a hypergraph is the sum of vertex and edge storage costs. The cost of processing a query is the sum of costs for each predicate in the query path.

## Data Operations

### Inserting Data

1. Check if the predicate already exists in the index
2. If not, create a new hyperedge for it
3. Add the subject-object pair to the appropriate hyperedge
4. Update overlapping hyperedges if variables are shared

### Deleting Data

1. Find the predicate and variable in the index
2. Remove the data from the hyperedge
3. If the hyperedge becomes empty, remove it entirely
4. Clean up any orphaned index entries

## Privacy Properties

The oblivious query system ensures:

1. **Evaluator blindness**: Nodes processing requests don't know whether their participation enabled a query to succeed

2. **Data opacity**: Processors don't know what data was queried or the contents thereof

3. **Requestor anonymity**: Cannot determine which requestor initiated the query

4. **Query indistinguishability**: Queries are indistinguishable from normal gossip traffic

## Example

Consider an RDF dataset about people and documents:

```
(Alice, wrote, Doc1)
(Alice, wrote, Doc2)
(Bob, wrote, Doc3)
(Alice, knows, Bob)
(Doc1, hasTitle, "Intro to Crypto")
```

**As a hypergraph**:
- Hyperedge for "wrote": connects {Alice, Doc1}, {Alice, Doc2}, {Bob, Doc3}
- Hyperedge for "knows": connects {Alice, Bob}
- Hyperedge for "hasTitle": connects {Doc1, "Intro to Crypto"}

**A SPARQL query** like "Find all documents written by people Alice knows":
```sparql
SELECT ?doc WHERE {
  Alice knows ?person .
  ?person wrote ?doc .
}
```

**Query path**:
1. Start with "knows" (smaller predicate)
2. Follow to "wrote" (shares the ?person variable)
3. Return matching documents

