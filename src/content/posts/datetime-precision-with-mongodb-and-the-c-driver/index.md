---
title: DateTime precision with MongoDB and the C# Driver
description: When dealing with MongoDB, the C# driver provides options to store DateTime values with full precision, and querying for them requires comparing Ticks property of the reference DateTime to the Ticks property of the stored DateTime element.
date: 2011-09-30
tags: [mongodb]
---

When dealing with a database you need to be aware of any differences between how a data type is represented in your programming language and how it is stored in the database. These differences may not be noticeable at first but often surface later, when a query is not returning the expected results, or a round-tripped value is no longer exactly equal to the original value stored. The `DateTime` data type in .NET has a fairly high precision of 100-nanoseconds per tick and is a candidate for such issues.

> Time values are measured in 100-nanosecond units called ticks, and a particular date is the number of ticks since 12:00 midnight, January 1, 0001 A.D. (C.E.) in the [GregorianCalendar](http://msdn.microsoft.com/en-us/library/system.globalization.gregoriancalendar.aspx) calendar (excluding ticks that would be added by leap seconds).

Even with SQL Server there was a considerable difference in precision prior to the introduction of the `DATETIME2` data type, given that `DATETIME` values are stored with a precision of 3.33 milliseconds. When the required level of precision cannot find its way into the database to be round-tripped without loss a workaround needs to be created.

[MongoDB](http://www.mongodb.org/) stores data in a [BSON](http://bsonspec.org/) format, which is a binary representation of the popular [JSON](http://json.org/) format. The specification indicates that a UTC datetime value is stored as a 64-bit signed integer representing the number of milliseconds since the Unix epoch. Once again we have a mismatch in precision to the `DateTime` data type in .NET and need to find a workaround for this difference.

The officially supported [C\# driver for MongoDB](http://www.mongodb.org/display/DOCS/CSharp+Language+Center) provides us with some options when it comes to serializing `DateTime` values into the their BSON representation. Fortunately, one of these options is able to assist with the handling of precision without resorting to storing values in a different .NET data type. Lets have a look at how `DateTime` values are stored by working with a very simple object that has a single `DateTime` property called `Timestamp`. We will let MongoDB assign an Id value for the document.

```csharp
public class Record
{
    public Guid Id { get; set; }

    public DateTime Timestamp { get; set; }
}
```

We will also need to write some code to insert a record so that we can have a look at the stored value. The code below creates a _records_ collection in the *test*database of the local server. It then inserts a new `Record` document into the collection after ensuring that the collection is empty to begin with.

```csharp
MongoServer server = MongoServer.Create("mongodb://localhost");
MongoDatabase database = server.GetDatabase("test");

MongoCollection<BsonDocument> records = database.GetCollection("records");
records.Drop(); // Remove any existing documents.

Record record = new Record {Timestamp = DateTime.UtcNow};
records.Insert(record);

server.Disconnect();
```

The result is a document with a `Timestamp` property that is saved using a call to `ISODate`. This is simply a helper function and the provided datetime will be stored as an integer value as per the BSON specification.

```json
{ "_id" : ObjectId("4e848461d0ba9f8047c27dc7"), "Timestamp" : ISODate("2011-09-29T14:44:49.172Z") }
```

To gain further control of the serialization the `BsonDateTimeOptionsAttribute` can be applied to a `DateTime` property. The attribute has three properties: `DateOnly`, `Kind` and `Representation`. Setting the `DateOnly` property to `true` causes the time of day component to be stored as zero, and setting the `Kind` property allows us to store the `DateTimeKind`. These first two options are not going to help us with our precision issues but are obviously useful for other scenarios. It is setting the third option of `Representation` to `BsonType.Document` that will allow us to keep our tick level precision.

```csharp
public class Record
{
    public Guid Id { get; set; }

    [BsonDateTimeOptions(Representation = BsonType.Document)]
    public DateTime Timestamp { get; set; }
}
```

After applying the attribute to our `Timestamp` property we can see that the value is now persisted in a format that includes the value from the `Ticks` property of the `DateTime`. This special handling of the `BsonType.Document` representation is being handled by the `DateTimeSerializer` class in the driver.

```json
{ "_id" : ObjectId("4e848714d0ba9f8047c27dc8"), "Timestamp" : { "DateTime" : ISODate("2011-09-29T14:56:20.481Z"), "Ticks" : NumberLong("634529049804813857") } }
```

Instead of applying the attribute to each `DateTime` property it is possible to specify the default serialization behaviour by setting the `DateTimeSerializationOptions.Default` property.

```csharp
DateTimeSerializationOptions.Defaults = new DateTimeSerializationOptions(DateTimeKind.Utc, BsonType.Document);
```

Now that we have the `DateTime` value stored with the desired precision we need to be aware of this document format when it comes time to query the values. In order to perform comparisons in a query we will compare the `Ticks` property of the reference `DateTime` to the `Ticks` property of the stored `DateTime` element.

```csharp
DateTime utcNow = DateTime.UtcNow;
Record insertedRecord = new Record {Timestamp = utcNow};
records.Insert(insertedRecord);

QueryComplete query = Query.EQ("Timestamp.Ticks", utcNow.Ticks);
Record queriedRecord = records.FindOneAs<Record>(query);
Console.WriteLine(insertedRecord.Timestamp.Ticks == queriedRecord.Timestamp.Ticks);
```

The same technique can be used with the other comparison operators such as GT, GTE, LT and LTE. You can always encapsulate these details into a simple helper class like the sample below for the comparisons you require.

```csharp
public static class DateTimeQuery
{
    public static QueryComplete EQ(string name, DateTime value)
    {
        return new QueryComplete(new BsonDocument(GetTicksName(name), value.Ticks));
    }

    public static QueryConditionList GT(string name, DateTime value)
    {
        return new QueryConditionList(GetTicksName(name)).GT(value.Ticks);
    }

    public static QueryConditionList GTE(string name, DateTime value)
    {
        return new QueryConditionList(GetTicksName(name)).GTE(value.Ticks);
    }

    public static QueryConditionList LT(string name, DateTime value)
    {
        return new QueryConditionList(GetTicksName(name)).LT(value.Ticks);
    }

    public static QueryConditionList LTE(string name, DateTime value)
    {
        return new QueryConditionList(GetTicksName(name)).LTE(value.Ticks);
    }

    static string GetTicksName(string name)
    {
        return name.EndsWith(".Ticks") ? name : name + ".Ticks";
    }
}
```

This lets you query directly on the property name and provide the `DateTime` value. No worrying about ticks.

```csharp
QueryComplete query = DateTimeQuery.EQ("Timestamp", utcNow);
Record queriedRecord = records.FindOneAs<Record>(query);
```

The end result seems reasonable. Persisted `DateTime` values keep full precision and are deserialized into a `DateTime` value. Querying for the data becomes a little more difficult but some helpers can reduce the friction. These results were confirmed using MongoDB 2.0.0 and the MongoDB C\# Driver 1.2.0.4274.
