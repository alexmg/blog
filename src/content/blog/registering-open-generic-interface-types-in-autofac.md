---
title: Registering open generic interface types in Autofac
description: This post covers how to register open generic interface types in Autofac V2, using the new RegisterAssemblyTypes method and an extension method. Nicholas Blumhardt (the creator of Autofac) suggested that this would be easy to implement, and it was done with a few unit tests and implementation code.
pubDatetime: 2009-12-19
tags: [autofac]
---

**UPDATE (22 December 2009): I have submitted a patch to Nick and this feature has now been added to the Autofac V2 [codebase](http://code.google.com/p/autofac/source/checkout). While including the patch Nick added support for open generic classes and renamed the extension method to `AsClosedTypesOf`. This post will be left in its current form and remains a valid example of extending Autofac.**

There has been some discussion lately around connecting an open generic type to its implementation types in a number of different dependency injection containers including [StructureMap](http://structuremap.sourceforge.net/Default.htm) and [Unity](http://www.codeplex.com/unity/):

- [Advanced StructureMap: connecting implementations to open generic types](http://www.lostechies.com/blogs/jimmy_bogard/archive/2009/12/17/advanced-structuremap-connecting-implementations-to-open-generic-types.aspx)
- [Advanced Unity: Connecting Implementations to Open Generic Types](http://elegantcode.com/2009/12/18/advanced-unity-connecting-implementations-to-open-generic-types/)

It looks like this is not the first time this scenario has been discussed:

- [Open Generic Types in StructureMap](http://codebetter.com/blogs/jeremy.miller/archive/2009/01/13/open-generic-types-in-structuremap.aspx)
- [Unity auto registration](http://marcinbudny.blogspot.com/2009/11/unity-auto-registration.html)

I also recently noticed a [posting](http://groups.google.com/group/autofac/browse_thread/thread/b95adb67ac14cd4f/ea190e3916b5059c?show_docid=ea190e3916b5059c&pli=1) on the [Autofac Google Group](http://groups.google.com/group/autofac) asking if it was possible for [Autofac](http://code.google.com/p/autofac/) to automatically register an open generic interface type against its implementations. [Nicholas Blumhardt](http://nblumhardt.com/) (the creator of Autofac and all round nice guy) suggested that this would be easy to implement using the new `RegisterAssemblyTypes` method found on the `ContainerBuilder` in the [upcoming V2 release](http://code.google.com/p/autofac/wiki/NewInV2).

Since I have been meaning to take a closer look at the preview of Autofac V2, I decided that having a look into solving this would be a good way for me to dip my toes into the water. I decided to limit the scope to supporting only automatic registrations for open generic **interface** types. There is no doubt you could use the extensibility provided by the `RegisterAssemblyTypes` method to take things much further and add features like those supported in the [Unity Auto Registration](http://autoregistration.codeplex.com/) library.

Time to introduce some types that will be used in the unit tests. First is the open generic interface type.

```csharp
/// <summary>
/// An open generic interface type.
/// </summary>
public interface ICommand<T>
{
    void Execute(T data);
}
```

Next we have a couple of simple types that will be used as the generic type parameters.

```csharp
/// <summary>
/// A type to use as a generic parameter.
/// </summary>
public class SaveCommandData
{
}

/// <summary>
/// A type to use as a generic parameter.
/// </summary>
public class DeleteCommandData
{
}
```

To keep things interesting I decided to include an abstract base class that implements the `ICommand` interface.

```csharp
/// <summary>
/// An abstract base class that implements the open generic
/// interface type.
/// </summary>
public abstract class CommandBase<T> : ICommand<T>
{
    public abstract void Execute(T data);
}
```

There will be two command implementations. The first will directly implement the `ICommand` interface.

```csharp
/// <summary>
/// A command class that directly implements the open
/// generic interface type.
/// </summary>
public class SaveCommand : ICommand<SaveCommandData>
{
    public void Execute(SaveCommandData data)
    {
    }
}
```

The second will implement the `ICommand` interface by inheriting from the `CommandBase<T>` abstract class.

```csharp
/// <summary>
/// A command class that implements the open generic interface
/// type by inheriting from the abstract base class.
/// </summary>
public class DeleteCommand : CommandBase<DeleteCommandData>
{
    public override void Execute(DeleteCommandData data)
    {
    }
}
```

I will use the first unit test to define the name and signature of the extension method that be will added to the `RegistrationBuilder`. The extension method will be named `WhereTypeClosesOpenGenericInterface` and will be available on the `RegistrationBuilder` returned from the `RegisterAssemblyTypes` method. It will take a single parameter for the `Type` that represents the open generic interface type that automatic registrations will be created for.

This first unit test will actually ensure that passing a `null` value as the method parameter will result in an `ArgumentNullException `being thrown.

```csharp
[Test]
public void WhereTypeClosesOpenGenericInterface_NullTypeProvided_ThrowsException()
{
    ContainerBuilder builder = new ContainerBuilder();
    Assert.Throws<ArgumentNullException>(() => builder.RegisterAssemblyTypes(typeof(ICommand<>).Assembly).
        WhereTypeClosesOpenGenericInterface(null));
}
```

The next unit test will ensure that passing a non-generic type into the method will result in an `ArgumentException `being thrown.

```csharp
[Test]
public void WhereTypeClosesOpenGenericInterface_NonGenericTypeProvided_ThrowsException()
{
    ContainerBuilder builder = new ContainerBuilder();
    Assert.Throws<ArgumentException>(() => builder.RegisterAssemblyTypes(typeof(ICommand<>).Assembly).
        WhereTypeClosesOpenGenericInterface(typeof(SaveCommandData)));
}
```

Another simple unit test will ensure that passing in a closed generic type will also result in an `ArgumentException `being thrown.

```csharp
[Test]
public void WhereTypeClosesOpenGenericInterface_ClosedGenericTypeProvided_ThrowsException()
{
    ContainerBuilder builder = new ContainerBuilder();
    Assert.Throws<ArgumentException>(() => builder.RegisterAssemblyTypes(typeof(ICommand<>).Assembly).
        WhereTypeClosesOpenGenericInterface(typeof(ICommand<SaveCommandData>)));
}
```

The last of the boring unit tests ensures that passing in an open generic type that is not an interface will again result in an `ArgumentException` being thrown.

```csharp
[Test]
public void WhereTypeClosesOpenGenericInterface_NonInterfaceOpenGenericTypeProvided_ThrowsException()
{
    ContainerBuilder builder = new ContainerBuilder();
    Assert.Throws<ArgumentException>(() => builder.RegisterAssemblyTypes(typeof(ICommand<>).Assembly).
        WhereTypeClosesOpenGenericInterface(typeof(List<>)));
}
```

Now onto the interesting unit test that will ensure our registrations are wired up correctly. We use our new `WhereTypeClosesOpenGenericInterface` extension method and pass it the `ICommand<>` open generic interface type. Obviously when we resolve a closed generic interface type we except the returned instance to be the type that implements it. In the case of the `SaveCommand` the implementation of the interface is direct, and with the `DeleteCommand` the implementation of the interface is through its inheritance of `CommandBase<T>`.

```csharp
[Test]
public void WhereTypeClosesOpenGenericInterface_OpenGenericInterfaceTypeProvided_ClosingGenericTypesRegistered()
{
    ContainerBuilder builder = new ContainerBuilder();
    builder.RegisterAssemblyTypes(typeof(ICommand<>).Assembly)
        .WhereTypeClosesOpenGenericInterface(typeof(ICommand<>));
    IContainer container = builder.Build();

    Assert.That(container.Resolve<ICommand<SaveCommandData>>(), Is.TypeOf<SaveCommand>());
    Assert.That(container.Resolve<ICommand<DeleteCommandData>>(), Is.TypeOf<DeleteCommand>());
}
```

Finally we arrive at the implementation code. I looked at the StructureMap implementation before writing this to keep an eye out for details that I might have otherwise forgotten. Doing so seemed like a good idea considering their code has already been put through its paces. Take a quick look over the code and I will explain what is going on below.

```csharp
/// <summary>
/// Extension methods for the <see cref="RegistrationBuilder{TLimit,TActivatorData,TRegistrationStyle}"/> class.
/// </summary>
public static class RegistrationBuilderExtensions
{
    /// <summary>
    /// Specifies that a type from a scanned assembly is registered if it implements an interface
    /// that closes the provided open generic interface type.
    /// </summary>
    /// <typeparam name="TLimit">Registration limit type.</typeparam>
    /// <typeparam name="TRegistrationStyle">Registration style.</typeparam>
    /// <typeparam name="TScanningActivatorData">Activator data type.</typeparam>
    /// <param name="registration">Registration to set service mapping on.</param>
    /// <param name="openGenericInterfaceType">The open generic interface type for which implementations will be found.</param>
    /// <returns>Registration builder allowing the registration to be configured.</returns>
    public static RegistrationBuilder<TLimit, TScanningActivatorData, TRegistrationStyle>
        WhereTypeClosesOpenGenericInterface<TLimit, TScanningActivatorData, TRegistrationStyle>(
            this RegistrationBuilder<TLimit, TScanningActivatorData, TRegistrationStyle> registration, Type openGenericInterfaceType)
        where TScanningActivatorData : ScanningActivatorData
    {
        if (openGenericInterfaceType == null)
        {
            throw new ArgumentNullException("openGenericInterfaceType");
        }

        if (!(openGenericInterfaceType.IsGenericTypeDefinition || openGenericInterfaceType.ContainsGenericParameters) || !openGenericInterfaceType.IsInterface)
        {
            throw new ArgumentException("The type '" + openGenericInterfaceType.FullName + "' is not an open generic interface type.");
        }

        return registration.Where(candidateType => findInterfaceThatCloses(candidateType, openGenericInterfaceType) != null)
            .As(candidateType => findInterfaceThatCloses(candidateType, openGenericInterfaceType));
    }

    /// <summary>
    /// Looks for an interface on the candidate type that closes the provided open generic interface type.
    /// </summary>
    /// <param name="candidateType">The type that is being checked for the interface.</param>
    /// <param name="openGenericInterfaceType">The open generic interface type to locate.</param>
    /// <returns>The type of the interface if found; otherwise, <c>null</c>.</returns>
    private static Type findInterfaceThatCloses(Type candidateType, Type openGenericInterfaceType)
    {
        if (candidateType.IsAbstract) return null;

        foreach (Type interfaceType in candidateType.GetInterfaces())
        {
            if (interfaceType.IsGenericType && interfaceType.GetGenericTypeDefinition() == openGenericInterfaceType)
            {
                return interfaceType;
            }
        }

        return (candidateType.BaseType == typeof(object))
            ? null
            : findInterfaceThatCloses(candidateType.BaseType, openGenericInterfaceType);
    }
}
```

First the parameter for the open generic interface type is checked to ensure that it is not `null` and that it is indeed an open generic interface type. Next we use the `RegistrationBuilder` instance that is being extended to determine what types we want registered and what their service mappings will be. The important methods on the `RegistrationBuilder` that enable this are the `Where` and `As` methods. The `Where` method takes a predicate that is used to filter the list of scanned types down to only those you are interested in registering. The `As` method is used to provide the service mappings for the types that got included for registration after the filter was applied.

The `Func<Type,bool>` predicate provided to the `Where` method on the `RegistrationBuilder` instance utilizes a private method named `findInterfaceThatCloses`. When the `findInterfaceThatCloses` method is called it will look for an interface on the type provided as the first parameter, that matches the type provided as the second parameter. In our case we are passing in the candidate type that was provided by the assembly scanning process, and the open generic interface type we are interested in matching. When no matching interface is found `null` is returned. When used in the delegate parameter provided to the `Where` method for filtering we check for the return from `findInterfaceThatCloses` being not `null`, and use the actual type returned from the method for the delegate parameter provided to the `As` method for mapping the services. We know that when the `As` method is called it will only be provided with types that were included by the filter, so we need not worry about receiving a type that does not implement the interface at this point.

The implementation of the `findInterfaceThatCloses` method ensures that only types which are not abstract are checked for matching interfaces. It then iterates through the available interfaces and checks if any match the open generic interface type provided. If no matching interface is found we recursively check if the type’s base class implements the interface until we reach a type that inherits directly from `object`.

As you can see Nick has done a great job making Autofac extensible, allowing additional requirements for your container to be met with very little effort on your part. I think the next version of Autofac is shaping up nicely and I look forward to posting more about it in the future.
