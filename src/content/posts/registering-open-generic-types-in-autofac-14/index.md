---
title: Registering open generic types in Autofac 1.4
description: This post explains how to extend Autofac 1.4 to register open generic types, with support for both interfaces and classes. It provides an example unit test and the code used to implement the extension method.
date: 2010-01-03
tags: [autofac]
---

**UPDATE (5 January 2010): This feature has now been added to the Autofac 1.4 codebase. I had intended to get this one directly into the codebase but Nick and I got our wires crossed, and I ended up posting it as an extension instead. Regardless, this post remains a valid example of extending Autofac 1.4. The `RegisterClosedTypesOf` method will appear on the `ContainerBuilder` in the next 1.4 maintenance release. Until then you can use the extension below to register your open generic types.**

This is a follow up to my [recent post](http://alexmg.com/post/2009/12/19/Registering-open-generic-interface-types-in-Autofac.aspx) about writing an extension for registering open generic interface types in [Autofac](http://code.google.com/p/autofac/) 2. The feature described in the first post, along with support for open generic classes, has since been added to the Autofac 2 codebase. You can grab the current 2.1 preview release on the [download page](http://code.google.com/p/autofac/downloads/list) and test it out.

I personally feel that the latest preview version of Autofac 2 is stable enough to start using, but I know that even when released not everyone will be able to adopt the new version as soon as they would like. For that reason I have decided to write a similar extension for Autofac 1.4 that supports both open generic interfaces and classes.

Before I move onto the code I would like to draw a distinction between this feature and the `RegisterGeneric` method found on instances of the the `ContainerBuilder` class in Autofac 1.4. The `RegisterGeneric` method allows you to register an open generic type and have a closed generic type created for you when requested. For example, registering `List<>` and then resolving `List<string>` will cause Autofac to create a new `List<string>` instance for you. The difference is that the `RegisterGeneric` feature does not locate existing types that close the open generic type being registered.

In the unit test below we are ensuring that a closing type is provided for an open generic interface. It is similar to that from the [original post](http://alexmg.com/post/2009/12/19/Registering-open-generic-interface-types-in-Autofac.aspx), except the extension method is called `RegisterClosedTypesOf` and extends `ContainerBuilder` instances instead of `RegistrationBuilder` instances. The extension method also has a parameter for the assembly that will be scanned to find the closing types. This is different from the Autofac 2 implementation were the assembly is provided to the `RegisterAssemblyTypes` method, and the containing types are filtered using a delegate provided to the `RegistrationBuilder`.

```csharp
[Test]
public void RegisterClosedTypesOf_OpenGenericInterfaceTypeProvided_ClosingGenericTypesRegistered()
{
    ContainerBuilder builder = new ContainerBuilder();
    Assembly assembly = typeof(ICommand<>).Assembly;
    builder.RegisterClosedTypesOf(typeof(ICommand<>), assembly);
    IContainer container = builder.Build();

    Assert.That(container.Resolve<ICommand<SaveCommandData>>(), Is.InstanceOf<SaveCommand>());
    Assert.That(container.Resolve<ICommand<DeleteCommandData>>(), Is.InstanceOf<DeleteCommand>());
}
```

In addition to the types I used for unit testing in the [previous post](http://alexmg.com/post/2009/12/19/Registering-open-generic-interface-types-in-Autofac.aspx), there are two new types used for the testing of open generic classes.

```csharp
/// <summary>
/// An abstract open generic base class.
/// </summary>
public abstract class Message<T>
{
}

/// <summary>
/// A class that closed the open generic type.
/// </summary>
public class StringMessage : Message<string>
{
}
```

The new message types are used in the next unit test to make sure that support for open generic classes is working.

```csharp
[Test]
public void RegisterClosedTypesOf_OpenGenericAbstractClassTypeProvided_ClosingGenericTypesRegistered()
{
    ContainerBuilder builder = new ContainerBuilder();
    Assembly assembly = typeof(Message<>).Assembly;
    builder.RegisterClosedTypesOf(typeof(Message<>), assembly);
    IContainer container = builder.Build();

    Assert.That(container.Resolve<Message<string>>(), Is.InstanceOf<StringMessage>());
}
```

Now that we know how the extension method is used we can move onto the implementation.

```csharp
/// <summary>
/// Extension methods for the <see cref="ContainerBuilder"/> class.
/// </summary>
public static class ContainerBuilderExtensions
{
    /// <summary>
    /// Scans the types in an assembly and registers those that support any base or interface that closes the
    /// provided open generic service type.
    /// </summary>
    /// <param name="builder">The container builder being extended.</param>
    /// <param name="openGenericServiceType">The open generic interface or base class type for which implementations will be found.</param>
    /// <param name="assembly">The assembly to scan for the matching types.</param>
    public static void RegisterClosedTypesOf(this ContainerBuilder builder, Type openGenericServiceType, Assembly assembly)
    {
        if (openGenericServiceType == null) throw new ArgumentNullException("openGenericServiceType");

        if (!(openGenericServiceType.IsGenericTypeDefinition || openGenericServiceType.ContainsGenericParameters))
        {
            throw new ArgumentException(
                string.Format("The type '{0}' is not an open generic class or interface type.",
                              openGenericServiceType.FullName));
        }

        foreach (Type candidateType in assembly.GetTypes())
        {
            Type closedServiceType;
            if (findAssignableTypeThatCloses(candidateType, openGenericServiceType, out closedServiceType))
            {
                builder.Register(candidateType).As(closedServiceType);
            }
        }
    }

    /// <summary>
    /// Looks for an interface on the candidate type that closes the provided open generic interface type.
    /// </summary>
    /// <param name="candidateType">The type that is being checked for the interface.</param>
    /// <param name="openGenericServiceType">The open generic service type to locate.</param>
    /// <param name="closedServiceType">The type of the closed service if found.</param>
    /// <returns>True if a closed implementation was found; otherwise false.</returns>
    private static bool findAssignableTypeThatCloses(Type candidateType, Type openGenericServiceType, out Type closedServiceType)
    {
        closedServiceType = null;

        if (candidateType.IsAbstract) return false;

        foreach (Type interfaceType in getTypesAssignableFrom(candidateType))
        {
            if (interfaceType.IsGenericType && interfaceType.GetGenericTypeDefinition() == openGenericServiceType)
            {
                closedServiceType = interfaceType;
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Returns the interface and base types that given a type is assignable from.
    /// </summary>
    /// <param name="candidateType">The type to find assignable types for.</param>
    /// <returns>A list of the assignable interface and base types.</returns>
    private static IEnumerable<Type> getTypesAssignableFrom(Type candidateType)
    {
        foreach (Type interfaceType in candidateType.GetInterfaces())
        {
            yield return interfaceType;
        }

        Type nextType = candidateType;
        while (nextType != typeof(object))
        {
            yield return nextType;
            nextType = nextType.BaseType;
        }
    }
}
```

After the usual sort of argument checking the types in the assembly are enumerated and tested to see if they close the open generic type. The `findAssignableTypeThatCloses` method does the work of locating a possible match and returns a value indicating if a match was found. When a match is found the `out` parameter is assigned the closing type that was located, and the registration is added to the `ContainerBuilder`. The `getTypesAssignableFrom` method helps out by returning all the interface and base types assignable from the type it is provided.

That is all that is needed to add support for open generic types in Autofac 1.4.

[ContainerBuilderExtensions.cs (3.71kb)](/content/files/2010/Jan/ContainerBuilderExtensions.cs)

[ContainerBuilderExtensionsTests.cs (3.93kb)](/content/files/2010/Jan/ContainerBuilderExtensionsTests.cs)
