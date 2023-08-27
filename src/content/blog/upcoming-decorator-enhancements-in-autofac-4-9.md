---
title: Upcoming decorator enhancements in Autofac 4.9
description: Autofac 4.9 introduces new overloads of the existing decorator registration methods that allow for implicit ordering and conditional decoration of services using registration order, as well as support for open-generic registrations and relationship types.
pubDatetime: 2018-08-26
tags: [autofac]
---

## A bit of history

The [existing](http://docs.autofac.org/en/latest/advanced/adapters-decorators.html#decorators) decorator implementation in Autofac requires decorator chains be declared in an explicit manner using named/keyed registrations. This was an intentional design decision to ensure that the correct decorators are applied in the correct order, even in the presence of dynamic registrations or those added in a late-bound manner. For better or for worse, it has become more common place in DI container implementations to imply meaning from the order that registrations are configured, and use that implication to change the behaviour of services resolved at runtime.

While Autofac historically preferred intent be declared explicitly, the concept of registration order was introduced to conform to the `Microsoft.Extensions.DependencyInjection.Abstractions` specification, and until now its use has been limited to meeting those specific requirements. Users have requested enhancements to the decorator implementation, including the ability to define decorator chains in an implicit manner using registration order, and to make decoration conditional based on runtime information such as the `Type` of the service being decoratored. I am pleased to announance that these features are now available and ready for testing in the `4.9.0-beta1` release.

## Regular decorator registrations

Implementation types are registered as normal and do not require any kind of key or other hint indicating that they will be decorated. In the example below the implementation `Implementor` is registered as the service `IDecoratedService`.

```csharp
builder.RegisterType<Implementor>().As<IDecoratedService>();
```

Decorators can then be applied using new overloads of the `RegisterDecorator` method. The registration method names have been kept the same in hope of making the new functionality more discoverable for existing users. It is easy to identify the new overloads, as in constrast to the original registration methods, none of the new overloads require parameters for the from/to keys.

The overload below accepts generic type arguments for the decorator and service types. The decorators will be applied in order of registration when `IDecoratedService` is resolved. This implicit ordering of the decorator chain based on registration order is true of all new overloads.

```csharp
builder.RegisterDecorator<DecoratorA, IDecoratedService>(); // Will be applied first.
builder.RegisterDecorator<DecoratorB, IDecoratedService>(); // Will be applied last.
```

For more dynamic registration scenarios where the type information of the services and decorators is not available up-front there is an overload that allows `Type` instances to be provided.

```csharp
builder.RegisterDecorator(typeof(DecoratorA), typeof(IDecoratedService)); // Will be applied first.
builder.RegisterDecorator(typeof(DecoratorB), typeof(IDecoratedService)); // Will be applied last.
```

Lambda based registrations can also be used in addition to the reflection based registrations shown above. In the example below, `context` is `IComponentContext`, `parameters` is `IEnumerable<Parameter>`, and `instance` is `IDecoratedService`.

```csharp
builder.RegisterDecorator<IDecoratedService>((context, parameters, instance) => new DecoratorA(instance)); // Will be applied first.
builder.RegisterDecorator<IDecoratedService>((context, parameters, instance) => new DecoratorB(instance)); // Will be applied last.
```

The actual type of `instance` would be `Implementor` in the first lambda registration because it is the first decorator to be applied. With the first decorator having already been applied, `instance` will be of type `DecoratorA` in the second lambda registration.

Parameters passed into a resolve operation are accessible to all services in the decorator chain (the implementation service and all decorator services).

## Open-generic decorator registrations

The implementation types are registered as normal open-generic registrations and also do not need to be keyed registrations.

```csharp
builder.RegisterGeneric(typeof(Implementor<>)).As(typeof(IDecoratedService<>));
```

Open-generic decorators can then be applied using the `RegisterGenericDecorator` method. As with the `RegisterDecorator` method, new overloads have been added to the existing registration method, and can be identified by the absence of parameters for the from/to key. With the decorator and service types being open-generics there is no overload that allows for generic type arguments to be provided as they can only contain closed-generic types.

```csharp
builder.RegisterGenericDecorator(typeof(DecoratorA<>), typeof(IDecoratedService<>));
builder.RegisterGenericDecorator(typeof(DecoratorB<>), typeof(IDecoratedService<>));
```

## Conditional decoration

It is now possible to conditionally register decorators. In the example below, `DecoratorA` is not applied because its condition requires there to already be an existing decorator.

```csharp
builder.RegisterType<Implementor, IDecoratedService>();
builder.RegisterDecorator<DecoratorA, IDecoratedService>(context => context.AppliedDecorators.Any());
builder.RegisterDecorator<DecoratorB, IDecoratedService>();
```

Here the `context` is an instance of `IDecoratorContext` and is updated as each decorator is applied. Key information such as the implementation type of the service being decorated and the type of the service being resolved is available on the context. In addition, the implementation types and instances of previously applied decorators is accessible. The `CurrentInstance` property is a convient way to get the instance being decorated regardless of whether it is the original implementation or another decorator.

```csharp
public interface IDecoratorContext
{
    /// <summary>
    /// Gets the implementation type of the service that is being decorated.
    /// </summary>
    Type ImplementationType { get; }

    /// <summary>
    /// Gets the service type of the service that is being decorated.
    /// </summary>
    Type ServiceType { get; }

    /// <summary>
    /// Gets the implementation types of the decorators that have been applied.
    /// </summary>
    IReadOnlyList<Type> AppliedDecoratorTypes { get; }

    /// <summary>
    /// Gets the decorator instances that have been applied.
    /// </summary>
    IReadOnlyList<object> AppliedDecorators { get; }

    /// <summary>
    /// Gets the current instance in the decorator chain. This will be initialized
    /// to the service being decorated and will then become the decorated instance
    /// as each decorator is applied.
    /// </summary>
    object CurrentInstance { get; }
}
```

Conditions can be configured on open-generic registration in exactly the same manner.

```csharp
builder.RegisterGeneric(typeof(Implementor<>)).As(typeof(IDecoratedService<>));
builder.RegisterGenericDecorator(typeof(DecoratorA<>), typeof(IDecoratedService<>), context => context.AppliedDecorators.Any());
builder.RegisterGenericDecorator(typeof(DecoratorB<>), typeof(IDecoratedService<>));
```

Instead of defining the conditions at the point of registration you can inject the `IDecoratorContext` into any of the decorators and use it to make decisions within the decorator implementation.

```csharp
builder.RegisterDecorator<DecoratorWithContext, IDecoratedService>();
```

This keeps the condition logic and decorator implementation located together but does introduce a dependency on Autofac via the `IDecoratorContext` interface. Whether the colocation of the two concerns is worth taking the dependency is a decision I will leave for the user as the objective can be achieved using either approach.

```csharp
public class DecoratorWithContext : IDecoratedService
{
    public DecoratorWithContext(IDecoratedService decorated, IDecoratorContext context)
    {
        Decorated = decorated;
        Context = context;
    }

    public IDecoratedService Decorated { get; }

    public IDecoratorContext Context { get; }

    public void DoStuff()
    {
        Decorated.DoStuff();

        if (Context.ImplementationType.GetCustomAttribute<MySpecialAttribute>() != null)
        {
            // Do something only when the implementation has a specific attribute.
        }
    }
}
```

It is possible to both define a condition along with the registration and inject the `IDecoratorContext` into the decorator. When the condition defined in the registration is met, the decorator instance will be created, and the `IDecoratorContext` will be injected into it.

```csharp
builder.RegisterDecorator<DecoratorWithContext, IDecoratedService>(context => context.AppliedDecorators.Any());
```

## Support for relationship types

Mulitple decorated services can be registered and resolved using `IEnumerable<T>`. Decoration will be performed on all resolved service instances and any decorator conditions will be applied to each service individually.

```csharp
// Two implementation types are registered along with a decorator.
builder.RegisterType<ImplementorA>().As<IDecoratedService>();
builder.RegisterType<ImplementorB>().As<IDecoratedService>();
builder.RegisterDecorator<Decorator, IDecoratedService>();
var container = builder.Build();

// Contains two instance of Decorator, one decorating ImplementorA and the other ImplementorB.
var services = container.Resolve<IEnumerable<IDecoratedService>>();
```

When a service is resolved using a factory any registered decorators will be applied.

```csharp
builder.RegisterType<Implementor>().As<IDecoratedService>();
builder.RegisterDecorator<Decorator, IDecoratedService>();
var container = builder.Build();

var factory = container.Resolve<Func<IDecoratedService>>();
var instance = factory(); // Factory returns Decorator decorating Implementor.
```

The same applies for services resolved using `Lazy<T>` and accessed via the `Value` property.

```csharp
builder.RegisterType<Implementor>().As<IDecoratedService>();
builder.RegisterDecorator<Decorator, IDecoratedService>();
var container = builder.Build();

var lazy = container.Resolve<Lazy<IDecoratedService>>();
var instance = lazy.Value; // Lazy returns Decorator decorating Implementor.
```

## Decorator lifetimes

It is not possible to explicitly define the lifetime of a decorator as they inherit the lifetime of the service that they decorate. In fact, the decorator registration methods all return `void` to prevent invalid configuration from being applied.

```csharp
// The implementation is registered as InstancePerDependency.
builder.RegisterType<Implementor>().As<IDecoratedService>().InstancePerDependency();
builder.RegisterDecorator<Decorator, IDecoratedService>();
var container = builder.Build();

// The first and second services are different decorated Implementor instances.
var first = container.Resolve<IDecoratedService>();
var second = container.Resolve<IDecoratedService>();
var same = ReferenceEquals(first, second); // False, the references are not the same.
```

A decorator is disposed at the same time as the decorated service based on its configured lifetime. In the same way you do not need to explicity dispose dependencies with regular services because the container will do it for you, there is no need for a decorator to explictly dispose the instance it is decorating. You can think of the dependency as being no different to that injected into any other service. In the example below, both the implementation service and decorator implement `IDisposable`, and the implementation is registered as `InstancePerLifetimeScope`. Both instances will have their `Dispose` method called when the lifetime scope they are created within is disposed.

```csharp
// DisposableImplementor and DisposableDecorator both implement IDisposable.
var builder = new ContainerBuilder();
builder.RegisterType<DisposableImplementor>()
    .As<IDecoratedService>()
    .InstancePerLifetimeScope();
builder.RegisterDecorator<DisposableDecorator, IDecoratedService>();
var container = builder.Build();

DisposableDecorator decorator;
DisposableImplementor decorated;
using (var scope = container.BeginLifetimeScope())
{
    var instance = scope.Resolve<IDecoratedService>();
    decorator = (DisposableDecorator)instance;
    decorated = (DisposableImplementor)instance.Decorated;
}
// The Dispose method will have been called on both decorator and decorated.
```

## Next steps

The current plan is to leave the existing decorator implementation in place for those that prefer their decorator chains to be configured in an explicit manner and to give other users time to migrate to the new syntax. If you are interested in these decorator enhancements please grab the `4.9.0-beta1` package and try it out as we would really value your feedback. There is an existing GitHub [issue](https://github.com/autofac/Autofac/issues/880) for these enhancements that would be a good place to provide feedback and new issues are certainly welcome for any bugs you might find. The [unit tests](https://github.com/autofac/Autofac/tree/develop/test/Autofac.Test/Features/Decorators) provide plently of additional examples of the currently expected behaviour.
