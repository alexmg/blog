---
title: Autofac 2.6.2.859 and ASP.NET MVC 4 RC Integrations Released
description: Autofac 2.6.2.859 was released and includes updates to the core library, ASP.NET MVC 4 RC integration, and ASP.NET Web API RC integration. The core library updates include a new module scanning feature and performance improvements. The ASP.NET MVC and Web API integrations are just recompilations but will have additional features included for the official release.
date: 2012-06-07
tags: [autofac]
---

I have released updated NuGet packages and downloads for Autofac. The core library only has a couple of updates: a new module scanning feature and some performance improvements for the .NET 4 build. The ASP.NET MVC 4 and ASP.NET Web API integrations have also been updated to the RC version.

- [Autofac Core Library](https://nuget.org/packages/Autofac)
- [Autofac ASP.NET MVC4 (RC) Integration](https://nuget.org/packages/Autofac.Mvc4)
- [Autofac ASP.NET Web API (RC) Integration](https://nuget.org/packages/Autofac.WebApi)

## Module Scanning

Module scanning is performed with the new `RegisterAssemblyModules` registration method that does exactly what its name suggests. It scans through the provided assemblies for modules, creates instances of the modules, and then registers them with the current builder.

The two simple module classes below live in the same assembly and each register a single component: `AComponent` and `BComponent`.

```csharp
public class AModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.Register(c => new AComponent()).As<AComponent>();
    }
}

public class BModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.Register(c => new BComponent()).As<BComponent>();
    }
}
```

The first overload of `RegisterAssemblyModules` will register all classes implementing `IModule` found in the provided list of assemblies. You can see in the unit test below that both `AComponent` and `BComponent` are registered because `AModule` and `BModule` are both `IModule` implementations.

```csharp
[Test]
public void RegisterAssemblyModules()
{
    var assembly = typeof(AComponent).Assembly;
    var builder = new ContainerBuilder();
    builder.RegisterAssemblyModules(assembly);
    var container = builder.Build();

    Assert.That(container.IsRegistered<AComponent>(), Is.True);
    Assert.That(container.IsRegistered<BComponent>(), Is.True);
}
```

The second overload allows you to specify a base type that the modules must derive from. This second unit test shows that only `AComponent` is registered because the scanning is restricted to modules of type `AModule`.

```csharp
[Test]
public void RegisterAssemblyModulesOfType()
{
    var assembly = typeof(AComponent).Assembly;
    var builder = new ContainerBuilder();
    builder.RegisterAssemblyModules<AModule>(assembly);
    var container = builder.Build();

    Assert.That(container.IsRegistered<AComponent>(), Is.True);
    Assert.That(container.IsRegistered<BComponent>(), Is.False);
}
```

## Performance Improvements

Nothing was drastically changed in the performance improvements but a number of small tweaks ended up resulting in a considerable improvement:

- Removed duplicate argument `null` checking in internal types when the check has already been performed by the caller.
- Removed the empty handlers from events and used old fashion `null` checking in order to prevent event argument instances from being created when no real subscriber requires them.
- `CircularDependencyDetector` now uses `Any()` instead of `Count()` when checking the activation stack which is much quicker for deeper graphs.
- `ConstructorParameterBinding` uses a delegate compiled from a `LambdaExpression` to invoke constructors. The compiled delegate is also cached per `ConstructorInfo`.

When running the [IocBattle](http://www.iocbattle.com/) and [IocPerformance](http://www.palmmedia.de/Blog/2011/8/30/ioc-container-benchmark-performance-comparison) benchmarks I noted about a 30% improvement in the reflection-based resolution of transient instances. I am happy with these results given the breadth of the feature set that Autofac supports and how simple the changes were.

## ASP.NET MVC 4 RC Integration

This is basically just a recompilation as there is no new DI support that I am aware of at the moment. The same goodness that was available in the MVC 3 integration continues to be available in the MVC 4 integration.

## ASP.NET Web API RC Integration

The DI support in Web API was improved after the Beta release and the `IHttpControllerFactory` and `IHttpControllerActivator` implementations from the Beta integration are no longer necessary. To achieve the per-controller lifetime scoping Web API introduced an `IDependencyScope` interface to compliment `IDependencyResolver`. A new `BeginScope` method was added to the `IDependencyResolver` allowing a nested dependency scope to be created. This has significantly simplified the integration and removes all the trickery I needed to perform with the Beta version.

```csharp
public class AutofacWebApiDependencyResolver : IDependencyResolver
{
    readonly ILifetimeScope _container;
    readonly IDependencyScope _rootDependencyScope;

    internal static readonly string ApiRequestTag = "AutofacWebRequest";

    public AutofacWebApiDependencyResolver(ILifetimeScope container)
    {
        if (container == null) throw new ArgumentNullException("container");

        _container = container;
        _rootDependencyScope = new AutofacWebApiDependencyScope(container);
    }

    public ILifetimeScope Container
    {
        get { return _container; }
    }

    public object GetService(Type serviceType)
    {
        return _rootDependencyScope.GetService(serviceType);
    }

    public IEnumerable<object> GetServices(Type serviceType)
    {
        return _rootDependencyScope.GetServices(serviceType);
    }

    public IDependencyScope BeginScope()
    {
        ILifetimeScope lifetimeScope = _container.BeginLifetimeScope(ApiRequestTag);
        return new AutofacWebApiDependencyScope(lifetimeScope);
    }

    public void Dispose()
    {
        _rootDependencyScope.Dispose();
    }
}
```

The dependency resolver creates a dependency scope in its constructor that wraps the root Autofac lifetime scope. Direct calls to `GetService` and `GetServices` on the dependency resolver are wired to the root dependency scope. For controller invocation Web API will use
`BeginScope` to get a dependency scope instance that it can use to resolve the controller from. This provides the opportunity for a new Autofac lifetime scope to be created and wrapped in the dependency scope. At the end of the request the dependency scope will be disposed and along with it the nested Autofac lifetime scope.

```csharp
public class AutofacWebApiDependencyScope : IDependencyScope
{
    readonly ILifetimeScope _lifetimeScope;

    public AutofacWebApiDependencyScope(ILifetimeScope lifetimeScope)
    {
        _lifetimeScope = lifetimeScope;
    }

    public object GetService(Type serviceType)
    {
        return _lifetimeScope.ResolveOptional(serviceType);
    }

    public IEnumerable<object> GetServices(Type serviceType)
    {
        if (!_lifetimeScope.IsRegistered(serviceType))
            return Enumerable.Empty<object>();

        var enumerableServiceType = typeof(IEnumerable<>).MakeGenericType(serviceType);
        var instance = _lifetimeScope.Resolve(enumerableServiceType);
        return (IEnumerable<object>)instance;
    }

    public void Dispose()
    {
        if (_lifetimeScope != null)
            _lifetimeScope.Dispose();
    }
}
```

You no longer have to call the `ConfigureWebApi` method on the `ContainerBuilder` that was shown in my [previous post](<http://alexmg.com/post/2012/03/08/Autofac-ASPNET-Web-API-(Beta)-Integration.aspx>) about the Beta integration. That was required to make sure the custom
`IHttpControllerFactory` and `IHttpControllerActivator` were added to the container so that Web API would use them. This method has now been deleted and will need to be removed from any existing code.

To save you having to look at the previous post again, hosting in ASP.NET now looks like this:

```csharp
var builder = new ContainerBuilder();

// Register API controllers using assembly scanning.
builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

// Register API controller dependencies per request.
builder.Register(c => new Logger()).As<ILogger>().InstancePerApiRequest();

var container = builder.Build();

// Set the dependency resolver implementation.
var resolver = new AutofacWebApiDependencyResolver(container);
GlobalConfiguration.Configuration.DependencyResolver = resolver;
```

Self-hosting remains just as simple except you are working with a new instance of `HttpSelfHostConfiguration` instead of the `GlobalConfiguration` static:

```csharp
var configuration = new HttpSelfHostConfiguration("http://localhost:8080");

configuration.Routes.MapHttpRoute(
    name: "DefaultApi",
    routeTemplate: "api/{controller}/{id}",
    defaults: new { id = RouteParameter.Optional }
    );

var builder = new ContainerBuilder();

// Register API controllers using assembly scanning.
builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

// Register API controller dependencies per request.
builder.Register<ILogger>(c => new Logger()).InstancePerApiRequest();

var container = builder.Build();

// Set the dependency resolver implementation.
var resolver = new AutofacWebApiDependencyResolver(container);
configuration.DependencyResolver = resolver;

// Open the HTTP server and listen for requests.
using (var server = new HttpSelfHostServer(configuration))
{
    server.OpenAsync().Wait();

    Console.WriteLine("Hosting at http://localhost:8080/{controller}");
    Console.ReadLine();
}
```

There are not a lot of other visible changes in the integration at this point, but you can expect some cool new features for the official release. These will include per-controller type registrations and model binding support similar to the MVC integration. Support for per-controller type configuration was added after the RC and the model binding interfaces changed significantly soon after but appear to have been locked down now.
