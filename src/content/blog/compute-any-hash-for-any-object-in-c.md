---
title: Compute any hash for any object in C#
description: This article explains how to create an extension method in C# that can be used to calculate the hash of any object using various hashing algorithms such as MD5 or SHA-1. The extension methods use the DataContractSerializer to turn the object into a byte array which is then passed into the Cryptographic Service Provider to compute the hash. The article also covers the two types of hashing functions and their implementations.
pubDatetime: 2009-04-16
tags: [csharp]
---

## Approach

The .NET Framework already has many classes for cryptography in the `System.Security.Cryptography` namespace, so there is no need to worry about the hashing algorithms myself. The cryptography classes supplied by the .NET Framework expect to be given a byte array from which the hash can be computed. So, if I can create a hash from an array of bytes, and can convert any object into an array of bytes, then I will be able to calculate the hash for any object. Also, if I can select the CSP (Cryptographic Service Provider) to use for computing the hash, I can then “Compute any hash for any object”. Well, any hash algorithm supported by the .NET Framework at least.

## Serialization

Starting with .NET Framework v3.5 SP1, turning any object into an array of bytes is actually very simple. This is because the `DataContractSerializer` was updated to allow for the serialization of [POCO](http://en.wikipedia.org/wiki/Plain_Old_CLR_Object) (Plain Old CLR Objects), and not just those marked with the `Serializable` or `DataContract` attributes. This means that we can take any object and serialize it into a `MemoryStream`, and then feed the array of bytes from the stream into the appropriate CSP to compute the hash.

## Cryptographic Service Provider

As I mentioned before, there are many of these providers available in the .NET Framework, including providers for the common [MD5](http://en.wikipedia.org/wiki/MD5) and [SHA-1](http://en.wikipedia.org/wiki/SHA-1) hashing algorithms. The providers can be broken down as implementing one of two types of [hash functions](http://en.wikipedia.org/wiki/Cryptographic_hash_function): those that require a key and those that don’t. Those that require a key are used for creating a [HMAC](http://en.wikipedia.org/wiki/Keyed-hash_message_authentication_code) (Hash Message Authentication Code), which is a combination of a hashing function and a secret key.

There are two abstract base classes defined for these two types of hashing functions: the `HashAlgorithm` and `KeyedHashAlgorithm` classes. The main difference is that the `KeyedHashAlgorithm` class has a `Key` property that can be used to set the secret key.

![The HashAlgorithm and KeyedHashAlgorithm types.](/images/blog/Algorithm-types.png)

Classes that derive from `KeyedHashAlgorithm` often have a constructor that excepts the key as a byte array, but this is for convenience only, and the property can be set at any time. This will make life easier when it comes to implementing support for the two types of hash functions.

## Implementation

I decided to take advantage of the new [Extension Methods](http://msdn.microsoft.com/en-us/library/bb383977.aspx) language feature added to C\# 3.0 to make the hashing methods available on all objects. The extension method for a normal hash function (one without a key) is below. You can see that the generic type parameter has a constraint indicating that the type argument must derive from `HashAlgorithm` and have a public parameterless constructor.

```csharp
public static string GetHash<T>(this object instance) where T : HashAlgorithm, new()
{
    T cryptoServiceProvider = new T();
    return computeHash(instance, cryptoServiceProvider);
}
```

The extension method for a keyed hash function is similar but includes a byte array parameter for the key, and the type argument must instead derive from `KeyedHashAlgorithm` allowing the `Key` property to be set.

```csharp
public static string GetKeyedHash<T>(this object instance, byte[] key) where T : KeyedHashAlgorithm, new()
{
    T cryptoServiceProvider = new T {Key = key};
    return computeHash(instance, cryptoServiceProvider);
}
```

Both of the extension methods call a private method to perform the actual serialization and the computation of the hash. This method creates an instance of the `DataContractSerializer` passing the type the extension method is being applied to into the constructor. A `MemoryStream` instance is created to hold the serialized representation of the object. The byte array of the stream is passed into the `ComputeHash` method of the `HashAlgorithm` instance to compute the hash. Finally, the hash is retrieved from the `Hash` property and converted to a base 64 string.

```csharp
private static string computeHash<T>(object instance, T cryptoServiceProvider) where T : HashAlgorithm, new()
{
    DataContractSerializer serializer = new DataContractSerializer(instance.GetType());
    using (MemoryStream memoryStream = new MemoryStream())
    {
        serializer.WriteObject(memoryStream, instance);
        cryptoServiceProvider.ComputeHash(memoryStream.ToArray());
        return Convert.ToBase64String(cryptoServiceProvider.Hash);
    }
}
```

I also decided to add extension methods for the common MD5 and SHA-1 hash functions. These are simply helpers that call the `GetHash<T>` extension method providing the appropriate `HashAlgorithm` type for the type argument. The implementation of these helper methods are an example of how the generic extension methods are called.

```csharp
public static string GetMD5Hash(this object instance)
{
    return instance.GetHash<MD5CryptoServiceProvider>();
}

public static string GetSHA1Hash(this object instance)
{
    return instance.GetHash<SHA1CryptoServiceProvider>();
}
```

Below is a simple example of using the `GetKeyedHash<T>` extension method.

```csharp
byte[] key = new byte[] {1, 2, 3, 4};
DateTimeOffset now = DateTimeOffset.Now;
string hash = now.GetKeyedHash<HMACMD5>(key);
Console.WriteLine(hash);
```

For those like to copy and paste, here is the complete solution. I have also attached the C\# code file to the end of this post. You will need to add a reference to the `System.Runtime.Serialization` assembly before compiling.

```csharp
using System;
using System.IO;
using System.Runtime.Serialization;
using System.Security.Cryptography;

namespace AlexMG.Shared
{
    /// <summary>
    ///     Extension methods applied to the <see cref="object"/> type.
    /// </summary>
    public static class ObjectExtensions
    {
        /// <summary>
        ///     Gets a hash of the current instance.
        /// </summary>
        /// <typeparam name="T">
        ///     The type of the Cryptographic Service Provider to use.
        /// </typeparam>
        /// <param name="instance">
        ///     The instance being extended.
        /// </param>
        /// <returns>
        ///     A base 64 encoded string representation of the hash.
        /// </returns>
        public static string GetHash<T>(this object instance) where T : HashAlgorithm, new()
        {
            T cryptoServiceProvider = new T();
            return computeHash(instance, cryptoServiceProvider);
        }

        /// <summary>
        ///     Gets a key based hash of the current instance.
        /// </summary>
        /// <typeparam name="T">
        ///     The type of the Cryptographic Service Provider to use.
        /// </typeparam>
        /// <param name="instance">
        ///     The instance being extended.
        /// </param>
        /// <param name="key">
        ///     The key passed into the Cryptographic Service Provider algorithm.
        /// </param>
        /// <returns>
        ///     A base 64 encoded string representation of the hash.
        /// </returns>
        public static string GetKeyedHash<T>(this object instance, byte[] key) where T : KeyedHashAlgorithm, new()
        {
            T cryptoServiceProvider = new T { Key = key };
            return computeHash(instance, cryptoServiceProvider);
        }

        /// <summary>
        ///     Gets a MD5 hash of the current instance.
        /// </summary>
        /// <param name="instance">
        ///     The instance being extended.
        /// </param>
        /// <returns>
        ///     A base 64 encoded string representation of the hash.
        /// </returns>
        public static string GetMD5Hash(this object instance)
        {
            return instance.GetHash<MD5CryptoServiceProvider>();
        }

        /// <summary>
        ///     Gets a SHA1 hash of the current instance.
        /// </summary>
        /// <param name="instance">
        ///     The instance being extended.
        /// </param>
        /// <returns>
        ///     A base 64 encoded string representation of the hash.
        /// </returns>
        public static string GetSHA1Hash(this object instance)
        {
            return instance.GetHash<SHA1CryptoServiceProvider>();
        }

        private static string computeHash<T>(object instance, T cryptoServiceProvider) where T : HashAlgorithm, new()
        {
            DataContractSerializer serializer = new DataContractSerializer(instance.GetType());
            using (MemoryStream memoryStream = new MemoryStream())
            {
                serializer.WriteObject(memoryStream, instance);
                cryptoServiceProvider.ComputeHash(memoryStream.ToArray());
                return Convert.ToBase64String(cryptoServiceProvider.Hash);
            }
        }
    }
}
```

## Performance

The most expensive part of calculating the hash values is the serialization. This is not meant to be a replacement for the traditional testing of object equality and should be used carefully due to the serialization cost. I performed some basic testing of the `NetDataContractSerializer` and `DataContractJsonSerializer` as well. The `DataContractJsonSerializer` did not perform well when given large or complex object instances such a sizable `DataSet`. The `NetDataContractSerializer` performance was about the same as the `DataContractSerializer`.
