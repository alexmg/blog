---
title: Two simple tips for working with LINQ and IEnumerable<T>
description: "This article provides two tips for working with LINQ and IEnumerable<T>: use Any() instead of Count() to check for non-empty return values, and use Enumerable.Empty<T> and never return null."
pubDatetime: 2012-04-05
tags: [csharp, linq]
---

## Meet the test subject

Let’s create a simple class that returns the numbers from 1 to 100.

```csharp
    public class Loopy
    {
        public int Enumerations { get; private set; }

        public IEnumerable<int> GetSome()
        {
            foreach (int number in Enumerable.Range(1, 100))
            {
                Enumerations++;
                yield return number;
            }
        }
    }
```

We use `Enumerable.Range` to grab the numbers from 1 to 100 and loop through them with a simple `foreach` loop. Before returning the value to the method caller we increment a counter to note the number of enumerations requested. Because we are lazy and don’t like writing extra classes, we get the compiler to build the enumerator for returning values using the sweet `yield return` syntax.

## Use Any() instead of Count() to check for non empty return values

In the unit test below we confirm that checking `Count()` for a value greater than zero causes the entire list of numbers to be enumerated even though we only care if more than zero items are present. In this simple example we are not going to notice the extra cost, but in real production code that is not always the case. The bigger the number of items returned the worse the situation gets.

```csharp
    [Test]
    public void EnumerationsUsingCount()
    {
        Loopy loopy = new Loopy();

        bool gotSome = loopy.GetSome().Count() > 0;

        Assert.That(gotSome, Is.True);
        Assert.That(loopy.Enumerations, Is.EqualTo(100));
    }
```

The next unit test confirms that using the `Any()` method will cause the enumeration to stop after the first value has been returned. It doesn’t matter how many items there are to potentially enumerate, the enumeration will always stop after the first item is received.

```csharp
    [Test]
    public void EnumerationsUsingAny()
    {
        Loopy loopy = new Loopy();

        bool gotSome = loopy.GetSome().Any();

        Assert.That(gotSome, Is.True);
        Assert.That(loopy.Enumerations, Is.EqualTo(1));
    }
```

## Use Enumerable.Empty\<T\> and never return null

When exposing something as `IEnumerable<T>` returning a `null` value is simply rude. If the caller is attempting to enumerate the return value without checking for `null` first they will receive an exception and get angry. Having to check for `null` return values ruins the nice syntax you get from the LINQ extension methods such as `Count()` and `Any()`.

It means you have to do this:

```csharp
IEnumerable<int> numbers = loopy.GetSome();
bool gotSome = numbers != null && numbers.Any();
```

Instead of this:

```csharp
bool gotSome = loopy.GetSome().Any();
```

To return an empty enumerable of something, use the `Enumerable.Empty<T>` method. It will return an enumerator of the specified type that does not return any items when enumerated.

It’s time to add a couple more methods to our `Loopy` class. We will add one method that is bad and returns `null`, and another that is good and returns `Enumerable.Empty<int>`. Yes, everything is black and white to me here.

```csharp
public IEnumerable<int> GetEmptyBad()
{
    return null;
}

public IEnumerable<int> GetEmptyGood()
{
    return Enumerable.Empty<int>();
}
```

Now that we have a good and bad example let’s write the first unit test. This one shows that attempting to enumerate the `null` return value using the `Any()` method causes an exception to be thrown. You don’t need `null` to indicate that a list is empty when an empty list does that just fine.

```csharp
[Test]
public void EnumeratingNullIsBad()
{
    Loopy loopy = new Loopy();

    Assert.Throws<ArgumentNullException>(() => loopy.GetEmptyBad().Any());
}
```

Finally, here is our good method being happily enumerated without a care in the world.

```csharp
[Test]
public void EnumeratingEmptyIsGood()
{
    Loopy loopy = new Loopy();

    Assert.DoesNotThrow(() => loopy.GetEmptyGood().Any());
}
```

Two simple tips to remember. One is good for performance, and the other is good for your fellow developers.
