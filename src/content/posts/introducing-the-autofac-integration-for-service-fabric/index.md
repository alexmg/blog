---
title: Introducing the Autofac integration for Service Fabric
description: The Autofac.ServiceFabric integration provides lifetime scoping support for Service Fabric services. It uses DynamicProxy interception and custom factory registration classes to track the lifetime of the services within a nested Autofac lifetime scope. This allows for disposal tracking and instance sharing for the service.
date: 2017-04-12
tags: [autofac, service-fabric]
---

## Introduction

The dependency injection support in Service Fabric allows you to provide instances for reliable actors, stateful services, and stateless services. Instead of providing a [conforming container](http://blog.ploeh.dk/2014/05/19/conforming-container/) abstraction the Service Fabric team opted to use a [factory based](http://blog.ploeh.dk/2014/05/19/di-friendly-framework/) mechanism instead. Factory methods for creating service instances are registered with the runtime via the `ActorRuntime.RegisterActorAsync` and `ServiceRuntime.RegisterServiceAsync` methods.

Having these creation hooks keeps things simple and flexible, but unfortunately when it comes to releasing your services, things get a little bit awkward. The kind of clean up operations that you would normally do in a `Dispose` call are instead performed by overriding methods from the service base classes; for actors the `OnDeactivateAsync` method, and for stateful and stateless services the `OnCloseAsync` or `OnAbort` method. It would be much cleaner if there was a corresponding release hook for the creation hook. In other words, allow the thing that was responsible for creating a service instance to be responsible for disposing it when it is no longer needed. I'm sure these virtual clean up methods existed prior to the introduction of the factory hooks so the team's hands were somewhat tied in that regard.

Perhaps the most useful feature a DI container provides is the [lifetime management](https://nblumhardt.com/2011/01/an-autofac-lifetime-primer/) of your components. Having the container track the references to your disposable components and release them at the appropriate time allows you keep the coupling between your components to a minimum. This management of component lifetime is achieved in Autofac through the concept of [lifetime scopes](http://docs.autofac.org/en/latest/lifetime/index.html). What we want to achieve in the Service Fabric integration is for the service to be created within a lifetime scope so that disposal tracking and instance sharing is available to it and the objects in its dependency graph. To make this work with the virtual methods on the service instance that the Service Fabric runtime calls for clean up required a bit of magic on the part of the integration. From the outside though, everything looks nice and simple, so let's first look at how the integration is configured and cover the implementation details afterwards.

## Getting Started

The first step is to install the `Autofac.ServiceFabric` package into your service project and create a `ContainerBuilder` to register your services in the regular manner.

```csharp
// Start with the trusty old container builder.
var builder = new ContainerBuilder();

// Register any regular dependencies.
builder.Register(c => new Logger()).As<ILogger>();
```

Next call the `RegisterServiceFabricSupport` extension method on the `ContainerBuilder` to register some internal Autofac types that will automatically provide the appropriate factory functions to the Service Fabric runtime, and help solve the problem of not having a release hook for a lifetime scope to be disposed.

```csharp
// Register the Autofac magic for Service Fabric support.
builder.RegisterServiceFabricSupport();
```

To register a reliable actor service you call the `RegisterActor` method and provide the concrete type of the actor class. There is no need to call the `ActorRuntime.RegisterActorAsync` method as this will be done for you when the container is built.

```csharp
// Register the actor service.
builder.RegisterActor<DemoActor>();
```

Registering stateful and stateless services is very similar except the `RegisterStatefulService` and `RegisterStatelessService` methods require the service type name. This is the same service type name you would have previously provided directly to the `ServiceRuntime.RegisterServiceAsync` method. Again, there is no need to for you to call this method directly yourself.

```csharp
// Register the stateful service.
builder.RegisterStatefulService<DemoStatefulService>("DemoStatefulServiceType");

// Register the stateless service.
builder.RegisterStatelessService<DemoStatelessService>("DemoStatelessServiceType");
```

The type provided to these methods is the concrete implementation type, no different to what you would have already been providing to the `ActorRuntime.RegisterActorAsync` and `ServiceRuntime.RegisterServiceAsync` methods. As the integration will make use of these same methods it too requires the concrete implementation type when registering Service Fabric services.

Having registered all your services, build the container, and continue into the regular entry point program code. A complete `static void Main` for an actor service might look something like this.

```csharp
private static void Main()
{
    try
    {
        var builder = new ContainerBuilder();

        builder.RegisterModule(new MyModule());
        builder.RegisterServiceFabricSupport();
        builder.RegisterActor<DemoActor>();

        using (builder.Build())
        {
            Thread.Sleep(Timeout.Infinite);
        }
    }
    catch (Exception e)
    {
        ActorEventSource.Current.ActorHostInitializationFailed(e.ToString());
        throw;
    }
}
```

If you would like to perform some clean up independent of the virtual deactivation method being called on your service instance, you may implement `IDisposable` and perform it in the `Dispose` method. Because the service instance is being resolved from an Autofac lifetime scope, disposal tracking is available to the instance and all of the dependencies in its object graph.

Finally, we need to make sure that the service types can be dynamically proxied. This means that the service types cannot be marked as `sealed` and must be visible to the `DynamicProxyGenAssembly2` assembly created by the [Castle DynamicProxy](https://github.com/castleproject/Core/blob/master/docs/dynamicproxy.md) library (part of the integration magic). The code generated services produced by the default Visual Studio templates will mark service classes `internal`, and for stateful and stateless services `sealed` as well. If you would like to keep the access modifier on your service as `internal` instead of `public`, you can add the `InternalsVisibleToAttribute` to your assembly instead, but the `sealed` modifier must still be removed.

```csharp
[assembly: InternalsVisibleTo(InternalsVisible.ToDynamicProxyGenAssembly2)]
```

Read on if you are interested in the details on how this all fits together, or if you want to see a more complete demo application, clone the [Examples repository](https://github.com/autofac/Examples) and open the `src\ServiceFabricDemo\AutofacServiceFabricDemo.sln` solution. This is a Visual Studio 2017 solution built with version 2.4.164 of the [Service Fabric SDK](https://docs.microsoft.com/en-us/azure/service-fabric/service-fabric-get-started) (and will likely be upgraded to 2.5.216 soon).

## Implementation Details

Because there are no explicit release hooks available in the Service Fabric runtime the virtual methods being called on the implementation class are the only indication that a service instance is being deactivated. To know when then those virtual methods are called we could have the implementation code call out to something, but given that is a rather brute-force and invasive approach, the entire service is dynamically proxied and the virtual method calls are intercepted instead. The integration takes a dependency on the [Autofac.Extras.DynamicProxy](https://github.com/autofac/Autofac.Extras.DynamicProxy) package, which provides these dynamic proxying and interception capabilities to the Autofac container, by building upon the awesome [Castle DynamicProxy](https://github.com/castleproject/Core/blob/master/docs/dynamicproxy.md) library mentioned earlier.

Now that we know that dynamic proxying is at the heart of the integration, let's start from the beginning and see exactly what is going on. The following code will focus primarily on reliable actor services but the concept is the same for stateful and stateless services. You can always look at the [Autofac.ServiceFabric repository](https://github.com/autofac/Autofac.ServiceFabric) to get the complete picture if you're interested.

When you call the `RegisterServiceFabricSupport` method an internal module is registered with the container. This registers some DynamicProxy interceptors and some factory registration abstractions. We will cover these in more detail shortly as the core of the integration logic is contained within these types.

```csharp
internal sealed class ServiceFabricModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.RegisterType<ActorInterceptor>()
            .InstancePerLifetimeScope();

        builder.RegisterType<ServiceInterceptor>()
            .InstancePerLifetimeScope();

        builder.RegisterType<ActorFactoryRegistration>()
            .As<IActorFactoryRegistration>()
            .SingleInstance();

        builder.RegisterType<StatelessServiceFactoryRegistration>()
            .As<IStatelessServiceFactoryRegistration>()
            .SingleInstance();

        builder.RegisterType<StatefulServiceFactoryRegistration>()
            .As<IStatefulServiceFactoryRegistration>()
            .SingleInstance();
    }
}
```

The `RegisterActor`, `RegisterStatefulService`, and `RegisterStatelessService` registration extension methods are the single point for configuring the different kinds of Service Fabric services. These are generic methods and have type constraints to ensure that a type with the appropriate base class is provided for registration. Regardless of which registration method is called, the service type will be checked to ensure it is non-sealed and can be dynamically proxied. If this condition is not met, a useful exception message is thrown detailing what is required, and how to optionally add the `InternalsVisibleToAttribute`.

```csharp
public static void RegisterActor<TActor>(this ContainerBuilder builder) where TActor : ActorBase
{
    if (builder == null)
        throw new ArgumentNullException(nameof(builder));

    var actorType = typeof(TActor);

    if (!actorType.CanBeProxied())
        throw new ArgumentException(actorType.GetInvalidProxyTypeErrorMessage());

    builder.RegisterServiceWithInterception<TActor, ActorInterceptor>();

    builder.RegisterBuildCallback(c => c.Resolve<IActorFactoryRegistration>().RegisterActorFactory<TActor>(c));
}
```

If the type passes validation it will be registered with the container via the `RegisterServiceWithInterception` internal extension method.

```csharp
internal static void RegisterServiceWithInterception<TService, TInterceptor>(this ContainerBuilder builder)
    where TService : class
    where TInterceptor : IInterceptor
{
    builder.RegisterType(typeof(TService))
        .InstancePerLifetimeScope()
        .EnableClassInterceptors()
        .InterceptedBy(typeof(TInterceptor));
}

```

The registration for the Service Fabric service is configured with `InstancePerLifetimeScope` which as you will see shortly is an important detail. In addition the registration has class interception enabled with the interceptor to use defined explicitly.

After the registration is made a callback is provided to the `ContainerBuilder` so that a factory method can be provided to the Service Fabric runtime once the container is built.

```csharp
builder.RegisterBuildCallback(c => c.Resolve<IActorFactoryRegistration>().RegisterActorFactory(actorType, c));
```

Because we need to start a new lifetime scope to resolve the Service Fabric services from we need access to the actual `IContainer` instance, or more specifically an instance of `ILifetimeScope`, an interface that `IContainer` happens to implement. This obviously isn't available while configuring the container as it has not yet been built. Support for callbacks on container build is a new feature added to Autofac 4.5 to support scenarios such as this. Without it a second registration call would be needed after the container was built and that just felt a little too weird.

To avoid a direct dependency on the Service Fabric runtime the callbacks use a level of indirection provided by factory registration classes. Their purpose is to allow the `ActorRuntime.RegisterActorAsync` and `ServiceRuntime.RegisterServiceAsync` calls to be mocked for testing as these methods require the Service Fabric runtime to be available.

```csharp
internal sealed class ActorFactoryRegistration : IActorFactoryRegistration
{
    public void RegisterActorFactory<TActor>(ILifetimeScope container) where TActor : ActorBase
    {
        ActorRuntime.RegisterActorAsync<TActor>((context, actorTypeInfo) =>
        {
            return new ActorService(context, actorTypeInfo, (actorService, actorId) =>
            {
                var lifetimeScope = container.BeginLifetimeScope();
                var actor = lifetimeScope.Resolve<TActor>(
                    TypedParameter.From(actorService),
                    TypedParameter.From(actorId));
                return actor;
            });
        }).GetAwaiter().GetResult();
    }
}

```

Notice in the call to `ActorRuntime.RegisterActorAsync` that a new lifetime scope is being created to resolve the service instance from via the `container.BeginLifetimeScope` method call. The `BeginLifetimeScope` method is only available on instances of `ILifetimeScope`, and as mentioned previously, that is the reason we need the callback to invoke `RegisterActorFactory` after the container has been constructed.

Another interesting point to note is that it seems that the nested lifetime scope appears to have been left dangling with nothing obvious holding a reference to it for later disposal. I mentioned earlier that it was important that the Service Fabric service was registered as `InstancePerLifetimeScope`, and this combined with the fact that the `ActorInterceptor` is also registered as `InstancePerLifetimeScope` in the `ServiceFabricModule`, is key to how the lifetime scope is tracked and later disposed.

If we look at the `ActorInterceptor` implementation we can see the constructor accepts a parameter of type `ILifetimeScope`.

```csharp
internal sealed class ActorInterceptor : IInterceptor
{
    private readonly ILifetimeScope _lifetimeScope;

    public ActorInterceptor(ILifetimeScope lifetimeScope)
    {
        _lifetimeScope = lifetimeScope;
    }

    public void Intercept(IInvocation invocation)
    {
        invocation.Proceed();

        if (invocation.Method.Name == "OnDeactivateAsync")
            _lifetimeScope.Dispose();
    }
}
```

This `ILifetimeScope` will be the same instance as the one created in the lambda expression provided to the `ActorRuntime.RegisterActorAsync` method in the `ActorFactoryRegistration` class. The interceptor can now hold onto this `ILifetimeScope` instance and monitor the methods being called on the service implementation class. If one of the deactivation trigger methods is called, such as `OnDeactivateAsync` in the case of actor services, the interceptor can dispose the lifetime scope after the call has been made. At this point the Service Fabric runtime has finished with the service instance, and when the lifetime scope is disposed any disposable instances tracked by it will in turn be disposed, including the actual service implementation itself if it implements `IDisposable`.

The end result is that we have an Autofac lifetime scope wrapped around the lifetime of the Service Fabric service, so we get all the disposal tracking and instance sharing capabilities that we have come to enjoy from the use of a container that supports lifetime scoping. It took a bit of creativity to make this happen, but from the perspective of the consumer of the integration, you call a few registration methods on the `ContainerBuilder` while bootstrapping your service, and the rest is taken care of for you.

## Current Status

At the time of writing the current [Autofac.ServiceFabric](https://www.nuget.org/packages/Autofac.ServiceFabric) package is at version `1.0.0-alpha3`. While it is a pre-release package it has already been successfully deployed into production on Azure. I have left the package at `alpha` to leave room for incorporating feedback from the wider community before considering the release stable and minimising further changes. I'm hoping that in the future Microsoft will provide the missing duality in their service factory implementation, and introduce a release mechanism to accompany the existing creation mechanism. If that happens I will be able to remove a considerable amount of complexity from the integration, and it will be as simple on the inside as it appears from the outside. Thanks to [John Kattenhorn](https://twitter.com/john_kattenhorn) for helping me test the early iterations of the integration and for providing valuable feedback. Please check out the integration and demo application and raise any suggestions or issues on the GitHub [repository](https://github.com/autofac/Autofac.ServiceFabric).
