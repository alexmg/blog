---
title: Using Autofac with Self Hosted WCF Services in a Windows Service
description: This article offers an approach to wiring up Autofac with WCF Self Hosting in a Windows Service. It describes creating an Autofac module, an IServiceHostInitializer interface and base implementation, and a ServiceBootstrapper to register and open the service hosts.
pubDatetime: 2014-01-21
tags: [autofac, web-services]
---

I was recently asked how to best create `ServiceHost` instances wired up with Autofac when using WCF Self Hosting in a Windows Service. In particular, how to do this in a dynamic way when the WCF services are defined in a separate assembly, without moving the service host configuration into the Windows Service entry point assembly.

Because the `AddDependencyInjectionBehavior` extension method that Autofac adds to `ServiceHost` requires an `ILifetimeScope` it's easy to assume that you have to create the service hosts in the same place you configure your container. When I first [posted](http://alexmg.com/making-self-hosting-with-autofac-wcf-integration-easier/) about the `AddDependencyInjectionBehavior` the simple console application example I provided performed both tasks in the same place.

If you have defined your WCF services in a separate assembly you need a mechanism to allow the service hosts to be discovered, registered with the container, and opened when the Windows Service is started, and then closed when it is stopped. In this post I will outline an approach to solving this issue that has worked well for me.

Start by creating an Autofac module in your web services assembly that is used to register your WCF service instances.

```
public class WebServicesModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.Register(c => new EchoService(c.Resolve<ILogger>()))
            .As<IEchoService>()
            .InstancePerDependency();
    }
}
```

Define an `IServiceHostInitializer` interface that contains a single `Initialize` method. I have made the method return a `ServiceHost` instance but you can make this method `void` if you have no need to return the actual instance. This should be added to an assembly shared by the Windows Service and web services assemblies.

```
public interface IServiceHostInitializer : IDisposable
{
    ServiceHost Initialize();
}
```

Create a base implementation of the `IServiceHostInitializer` that has generic type parameters for the WCF service implementation and contract types. It's constructor takes an `ILifetimeScope` that will later be used when calling `AddDependencyInjectionBehavior` on the newly created `ServiceHost`.

The `Initialize` method implementation starts by calling the virtual `CreateServiceHost` method. That can be overridden in derived classes to programatically customise the configuration of the `ServiceHost` if required. In the `Dispose` method the `ServiceHost` is closed cleanly depending on its current state.

```
public abstract class ServiceHostInitializerBase<TImplementation, TContract> : IServiceHostInitializer
{
    readonly ILifetimeScope _lifetimeScope;
    ServiceHost _serviceHost;

    protected ServiceHostInitializerBase(ILifetimeScope lifetimeScope)
    {
        _lifetimeScope = lifetimeScope;
    }

    public ServiceHost Initialize()
    {
        _serviceHost = CreateServiceHost();
        _serviceHost.AddDependencyInjectionBehavior<TContract>(_lifetimeScope);
        _serviceHost.Open();
        return _serviceHost;
    }

    protected virtual ServiceHost CreateServiceHost()
    {
        return new ServiceHost(typeof(TImplementation));
    }

    public void Dispose()
    {
        if (_serviceHost == null) return;

        if (_serviceHost.State != CommunicationState.Faulted)
            _serviceHost.Close();
        else
            _serviceHost.Abort();
    }
}
```

Now in your web service assembly, create a concrete implementation of `ServiceHostInitializerBase` with the WCF service implementation and contract types provided in the generic type parameters. If you want to customise the `ServiceHost` override the `CreateServiceHost` method.

```
public class ServiceHostInitializer : ServiceHostInitializerBase<EchoService, IEchoService>
{
    public ServiceHostInitializer(ILifetimeScope lifetimeScope) : base(lifetimeScope)
    {
    }
}
```

The final piece of the puzzle is to create a bootstrapper for your service.

```
public class ServiceBootstrapper : IDisposable
{
    readonly IContainer _container;

    public ServiceBootstrapper()
    {
        var builder = new ContainerBuilder();

        var assemblies = AppDomain.CurrentDomain.GetAssemblies();

        builder.RegisterAssemblyModules(assemblies);

        builder.RegisterAssemblyTypes(assemblies)
            .Where(type => type.IsAssignableTo<IServiceHostInitializer>())
            .As<IServiceHostInitializer>()
            .SingleInstance();

        _container = builder.Build();
    }

    public void Start()
    {
        foreach (var serviceHostInitializer in _container.Resolve<IEnumerable<IServiceHostInitializer>>())
            serviceHostInitializer.Initialize();
    }

    public void Dispose()
    {
        if (_container != null)
            _container.Dispose();
    }
}
```

The usage of the bootstrapper in your Windows Service will look something like this.

```
public class Service : ServiceBase
{
	ServiceBootstrapper _bootstrapper;

	protected override void OnStart(string[] args)
	{
		_bootstrapper = new ServiceBootstrapper();
		_bootstrapper.Start();
	}

	protected override void OnStop()
	{
		_bootstrapper.Dispose();
	}
}
```

In the constructor of the bootstrapper the `RegisterAssemblyModules` method on the `ContainerBuilder` is used to register the modules in your assemblies. You will need to ensure that you have loaded your web service assembly into the `AppDomain` first if no direct references from the Windows Service assembly are present.

```
var builder = new ContainerBuilder();
var assemblies = AppDomain.CurrentDomain.GetAssemblies();
builder.RegisterAssemblyModules(assemblies);
```

The assembly scanning support in Autofac registers all `IServiceHostInitializer` types with the container. The container is then stored in a field so that it can be diposed along with the bootstrapper.

```
builder.RegisterAssemblyTypes(assemblies)
    .Where(type => type.IsAssignableTo<IServiceHostInitializer>())
    .As<IServiceHostInitializer>()
    .SingleInstance();

_container = builder.Build();
```

In the `Start` method, which is called when the Windows Service starts, all `IServiceHostInitializer` instances are resolved via `IEnumerable<IServiceHostInitializer>` using the collection support in Autofac. The initializer instances are then looped and have their `Initialize` method called to create and open the `ServiceHost` instances. The base implementation of the initializer makes sure the WCF services are registered with the Autofac container.

```
public void Start()
{
    foreach (var serviceHostInitializer in _container.Resolve<IEnumerable<IServiceHostInitializer>>())
        serviceHostInitializer.Initialize();
}
```

When the Windows Service is stopped `Dispose` is called on the bootstrapper. This will in turn dispose the container and all the `IServiceHostInitializer` instances along with it. The `Dispose` implementation in the `ServiceHostInitializerBase` ensures that the `ServiceHost` instance is closed cleanly.

There are no doubt other approaches that you could take but this has been working well for me. Let me know in the comments if you would like to see some of these helpers added to the Autofac WCF Integration.
