---
title: Velocity DataCache Extension Methods
description: This post provides code samples to demonstrate extension methods for working with the Velocity DataCache. This includes a method called IsLocalCache, a Get method that uses generics and a Func delegate to create objects if they are not found in the cache, and a CreateKey method to create keys for cache entries.
pubDatetime: 2009-06-11
tags: [velocity]
---

If you are using the [local cache](http://msdn.microsoft.com/en-us/library/dd187451.aspx) configuration in [Velocity](http://msdn.microsoft.com/en-us/library/dd172103.aspx) you need to be careful how you use objects returned from the cache. The instance returned is a reference to the object stored inside the local cache, and is not a new instance that has been deserialized from the cache host. This means that if you make a change to the object, the change will be seen by any other caller retrieving the same object from the cache.

The current API does not provide a means to determine if the cache you are using has been configured with local caching. When the local caching option is used the type of the `DataCache` instance returned from the `DataCacheFactory` is actually an internal type called `Microsoft.Data.Caching.LocalCache`. The first extension method called `IsLocalCache` uses this knowledge to determine if you are working with a local cache.

```csharp
/// <summary>
///        Determines whether the cache is configured as a local cache.
/// </summary>
/// <param name="dataCache">
///        The data cache being extended.
/// </param>
/// <returns>
///     <c>true</c> if configured as a local cache; otherwise, <c>false</c>.
/// </returns>
public static bool IsLocalCache(this DataCache dataCache)
{
    return (dataCache.GetType().FullName == "Microsoft.Data.Caching.LocalCache");
}
```

The next extension method is another `Get` method implementation that uses generics to avoid casting in the calling code. This method also accepts a `Func<T>` delegate that is used to create the object and add it to the cache if the entry for the specified key is not found. To make sure that the object returned from the local cache is not accidently modified the object is cloned before being returned. You can see in the code below that the cloning is performed in the `clone` method which I will explain in more detail next.

```csharp
/// <summary>
///        Gets the cached object for the specified key.
/// </summary>
/// <typeparam name="T">
///        The type of the cached object.
/// </typeparam>
/// <param name="dataCache">
///        The data cache being extended.
/// </param>
/// <param name="key">
///        The key for the cached object.
/// </param>
/// <param name="creator">
///        A <see cref="Func{TResult}"/> delegate used to create the object if not found in the cache.
/// </param>
/// <returns></returns>
public static T Get<T>(this DataCache dataCache, string key, Func<T> creator)
{
    object value = dataCache.Get(key);
    if (value == null)
    {
        value = creator();
        dataCache.Put(key, value);
    }
    return dataCache.IsLocalCache() ? clone((T)value) : (T)value;
}
```

In the private `clone` method, I have used the `DataContractSerializer` class to perform the cloning as it works on types that are not explicitly marked as being `Serializable` or `DataContract`. The support for serializing [POCO](http://en.wikipedia.org/wiki/Plain_Old_CLR_Object) objects was added in .NET Framework 3.5 SP1. You can find out more about it [here](http://www.pluralsight.com/community/blogs/aaron/archive/2008/05/13/50934.aspx) on Aaron Skonnard’s blog. You can see in the implementation below that the serialization cost can be avoided if the type being cloned is a value type or a string. The string class is not cloned because it is immutable and cannot be modified, and value types are of course always passed by value anyway.

```csharp
private static T clone<T>(T instance)
{
    Type instanceType = typeof(T);
    if (instanceType.IsValueType || instanceType == typeof(string))
    {
        return instance;
    }

    DataContractSerializer serializer = new DataContractSerializer(instanceType);
    using (MemoryStream memoryStream = new MemoryStream())
    {
        serializer.WriteObject(memoryStream, instance);
        memoryStream.Position = 0;
        return (T)serializer.ReadObject(memoryStream);
    }
}
```

The final extension method is called `CreateKey`, and is a simple helper method that can be used to create keys for cache entries. It accepts a `params` array of object values that are concatenated with a pipe character as a separator between them. The `ToString` method is called on each object to obtain the string value used in the key.

```csharp
/// <summary>
///        Creates a key to use for caching objects.
/// </summary>
/// <param name="dataCache">
///        The data cache being extended.
/// </param>
/// <param name="values">
///        The values to build the key from.
/// </param>
/// <returns>
///        A key to use for caching objects.
/// </returns>
public static string CreateKey(this DataCache dataCache, params object[] values)
{
    StringBuilder combinedValues = new StringBuilder();
    foreach (object value in values)
    {
        if (combinedValues.Length > 0)
        {
            combinedValues.Append("|");
        }
        combinedValues.Append(value);
    }
    return combinedValues.ToString();
}
```

Here are some code samples of how to call the extension methods based on some unit tests I created while writing the extensions. I have attached the code file for the extensions to the end of the post. The actual unit tests are not attached as those require Velocity to be installed and configured appropriately.

```csharp
// Get the default cache using the factory.
DataCacheFactory factory = new DataCacheFactory();
DataCache cache = factory.GetDefaultCache();

// Test if the cache is configured as a local cache.
Assert.That(cache.IsLocalCache(), Is.True);

// Test that objects returned from the local cache are cloned.
Customer customer1 = cache.Get("customer", () => new Customer {FirstName = "John", LastName = "Smith"});
customer1.FirstName = "Frank";

Customer customer2 = cache.Get("customer", () => new Customer {FirstName = "John", LastName = "Smith"});

Assert.That(customer1.FirstName, Is.EqualTo("Frank"));
Assert.That(customer2.FirstName, Is.EqualTo("John"));

// Test that value types are supported.
int integer = cache.Get("integer", () => 123);
Assert.That(integer, Is.EqualTo(123));

// Test that cache keys are created correctly.
Assert.That(cache.CreateKey("customer", 123), Is.EqualTo("customer|123"));
```

[DataCacheExtensions.cs (2.68kb)](/content/files/2009/Jun/DataCacheExtensions.cs)
