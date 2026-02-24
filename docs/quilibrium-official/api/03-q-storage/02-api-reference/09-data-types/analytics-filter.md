# AnalyticsFilter

Container for the filter used to describe a set of objects for analyses. A filter must have exactly one prefix, one tag, or one conjunction (And).

## Properties

| Property | Type | Description | Required |
|----------|------|-------------|-----------|
| Prefix | String | Object key prefix identifying one or more objects to which the configuration applies | No |
| Tag | [Tag](#tag) | A container of a key value name pair | No |
| And | [AndOperator](#and-operator) | A container for a logical AND operation on filter predicates | No |

## Description

The AnalyticsFilter type defines criteria for selecting objects to include in analytics. You can specify one of the following:
- A prefix to select objects whose keys begin with the specified characters
- A tag to select objects that have the specified tag
- An AND operation to combine a prefix and one or more tags

:::note
Only one of Prefix, Tag, or And can be specified in a single filter.
:::

## Related Types

### Tag

The Tag type contains the following properties:

| Property | Type | Description | Required |
|----------|------|-------------|-----------|
| Key | String | Name of the tag | Yes |
| Value | String | Value of the tag | Yes |

### And Operator

The AndOperator type contains the following properties:

| Property | Type | Description | Required |
|----------|------|-------------|-----------|
| Prefix | String | Object key prefix to be included in the AND condition | No |
| Tags | Array of [Tag](#tag) | One or more tags to be included in the AND condition | No |

## Examples

### Filter by Prefix

```xml
<Filter>
  <Prefix>documents/</Prefix>
</Filter>
```

### Filter by Tag

```xml
<Filter>
  <Tag>
    <Key>type</Key>
    <Value>document</Value>
  </Tag>
</Filter>
```

### Filter by Prefix AND Tag

```xml
<Filter>
  <And>
    <Prefix>documents/</Prefix>
    <Tag>
      <Key>type</Key>
      <Value>document</Value>
    </Tag>
  </And>
</Filter>
``` 