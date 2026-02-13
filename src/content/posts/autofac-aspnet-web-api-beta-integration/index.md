---
title: Autofac ASP.NET Web API (Beta) Integration
description: Autofac has released a beta version of the ASP.NET Web API integration package for NuGet, which supports both web hosting and self hosting scenarios. The integration allows for services to be registered per API controller invocation. A HTTP module style implementation is not required due to the IHttpControllerFactory interface allowing for an abstraction between the two hosting modes. The implementation details are discussed in the article.
date: 2012-03-08
tags: [autofac]
---

With the beta release of ASP.NET MVC 4 and the ASP.NET Web API being released a few weeks ago, I decided it was about time to have a look at what the integration story would like for Autofac. The package is available for download on NuGet.

[![Install-Package Autofac.WebApi](./Install-Package-Autofac.WebApi.png "Install-Package Autofac.WebApi")](https://nuget.org/packages/Autofac.WebApi/)

While building the preview of the Web API integration I had the following goals in mind:

- Ensure that it would work alongside the MVC integration without issues such as naming conflicts.
- Support both the web hosting and self hosting scenarios in a single assembly.
- Avoid taking dependencies on the `System.Web.Http.SelfHost` and `System.Web.Http.WebHost` assemblies (to help achieve the goal above).
- Minimize the amount of configuration required to get up and running.
- Provide a lifetime scope around each call to an API controller so that it and its dependencies are automatically disposed at the end of the call.

I had some concerns about how easy this would be given the two different modes of hosting that are supported. When self hosting the entry point is a WCF service, and when hosting in ASP.NET the entry point is a HTTP handler. My concern was that wrapping each call to the API controller in an Autofac lifetime scope would require two completely different mechanisms. Perhaps a HTTP module style implementation and WCF extension similar to those found in the existing MVC and WCF integrations. It turns out this was not the case and if you are keen on learning about the details I will discuss them after we have seen some example code (because everyone wants to see some code sooner rather than later).

## Example Code

If you are hosting within ASP.NET your `Application_Start` method would look something like this:

```csharp
protected void Application_Start()
{
    AreaRegistration.RegisterAllAreas();

    RegisterGlobalFilters(GlobalFilters.Filters);
    RegisterRoutes(RouteTable.Routes);

    BundleTable.Bundles.RegisterTemplateBundles();

    var configuration = GlobalConfiguration.Configuration;
    var builder = new ContainerBuilder();

    // Configure the container with the integration implementations.
    builder.ConfigureWebApi(configuration);

    // Register API controllers using assembly scanning.
    builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

    // Register API controller dependencies per request.
    builder.Register<ILogger>(c => new Logger()).InstancePerApiRequest();

    var container = builder.Build();

    // Set the dependency resolver implementation.
    var resolver = new AutofacWebApiDependencyResolver(container);
    configuration.ServiceResolver.SetResolver(resolver);
}
```

In the case of self hosting your bootstrapping code would look like this instead:

```csharp
var configuration = new HttpSelfHostConfiguration("http://localhost:8080");

configuration.Routes.MapHttpRoute(
    name: "DefaultApi",
    routeTemplate: "api/{controller}/{id}",
    defaults: new {id = RouteParameter.Optional}
    );

var builder = new ContainerBuilder();

// Configure the container with the integration implementations.
builder.ConfigureWebApi(configuration);

// Register API controllers using assembly scanning.
builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

// Register API controller dependencies per request.
builder.Register<ILogger>(c => new Logger()).InstancePerApiRequest();

var container = builder.Build();

// Set the dependency resolver implementation.
var resolver = new AutofacWebApiDependencyResolver(container);
configuration.ServiceResolver.SetResolver(resolver);

// Open the HTTP server and listen for requests.
using (var server = new HttpSelfHostServer(configuration))
{
    server.OpenAsync().Wait();

    Console.WriteLine("Hosting at http://localhost:8080/{controller}");
    Console.ReadLine();
}
```

First we are keeping a hold of the `HttpConfiguration` instance so that it can be provided to the `ConfigureWebApi` extension method on the `ContainerBuilder`. This is a `HttpConfiguration` instance when hosting in ASP.NET and a `HttpSelfHostConfiguration` instance when self hosting.

Next the `RegisterApiControllers` extension method on the `ContainerBuilder` is used to perform assembly scanning, looking for types that derive from `IHttpController` and have names with a suffix of “Controller”. This is very similar to how the MVC integration registers
controllers using assembly scanning.

The `InstancePerApiRequest` method applied to the `ILogger` registration will cause it to be resolved once per API controller invocation. After the call completes it will be disposed automatically along with the API controller instance.

To avoid naming conflicts with the MVC integration the `IDependencyResolver` implementation has been named `AutofacWebApiDependencyResolver`. You provide it with the constructed container instance and then set it as the service resolver through the `SetResolver` method on the `ServiceResolver` property of the `HttpConfiguration` instance.

You will notice that the steps required to configure the integration are the same for both hosting scenarios. The only real difference is that the type of the `HttpConfiguration` instance changes depending on the hosting mode.

To register a service for lifetime scoping with both MVC controllers and Web API controllers you can apply both the `InstancePerHttpRequest` and `InstancePerApiRequest` lifetime scopes to the registration:

```csharp
// Register MVC controller and API controller dependencies per request.
builder.Register(c => new Logger()).As<ILogger>()
    .InstancePerHttpRequest()
    .InstancePerApiRequest();
```

## Implementation Details

Because of the two different hosting mechanisms a new way to manage lifetime scopes needed to found. The approach in the MVC and WCFintegrations are completely different and I didn’t want both ways to be present in the Web API integration. The `IHttpControllerFactory` interface provided the required abstraction, though not in a perfect way.

```csharp
public interface IHttpControllerFactory
{
    // Methods
    IHttpController CreateController(HttpControllerContext controllerContext, string controllerName);
    void ReleaseController(IHttpController controller);
}
```

This service is resolved from the dependency resolver if present, and is called by the `HttpControllerDispatcher` regardless of the hosting mode. The `DefaultHttpControllerFactory` that ships out-of-the-box handles a number of duties such as building and caching the `HttpControllerDescriptor`, along with various bits of exception handling. Implementing all of that did not sound like fun so I made the `AutofacControllerFactory` derive from the default implementation.

```csharp
public class AutofacControllerFactory : DefaultHttpControllerFactory
{
    readonly ILifetimeScope _container;
    readonly ConcurrentDictionary<IHttpController, ILifetimeScope> _controllers = new ConcurrentDictionary<IHttpController, ILifetimeScope>();

    internal static readonly string ApiRequestTag = "AutofacWebRequest";

    public AutofacControllerFactory(HttpConfiguration configuration, ILifetimeScope container) : base(configuration)
    {
        if (container == null) throw new ArgumentNullException("container");
        _container = container;
    }

    public override IHttpController CreateController(HttpControllerContext controllerContext, string controllerName)
    {
        var lifetimeScope = _container.BeginLifetimeScope(ApiRequestTag);
        controllerContext.Request.Properties.Add(ApiRequestTag, lifetimeScope);

        try
        {
            var controller = base.CreateController(controllerContext, controllerName);
            if (controller != null)
                _controllers.TryAdd(controller, lifetimeScope);

            return controller;
        }
        catch (Exception)
        {
            lifetimeScope.Dispose();
            throw;
        }
    }

    public override void ReleaseController(IHttpController controller)
    {
        ILifetimeScope lifetimeScope;
        if (controller != null && _controllers.TryRemove(controller, out lifetimeScope))
            if (lifetimeScope != null)
                lifetimeScope.Dispose();
    }
}
```

The `AutofacControllerFactory` has the current `ILifetimeScope` injected which happens to be the root lifetime scope at the point when it is created. This will be used to create nested lifetime scopes for each controller request. When Web API asks for a controller using the
`CreateController` method a new lifetime scope is created based on a tag that is used during the container registration process. The same tag is used in the MVC 4 integration to allow services to be registered per MVC controller and per Web API controller. The new lifetime scope is then poked into a property on the `HttpRequestMessage` that is accessible from the provided `HttpControllerContext`. It may seem a little strange at first but the creation of the controller is being delegated to the base class, which in turn looks for an `IHttpControllerActivator` instance in the dependency resolver, and if located will use that to create the actual controller instance. As you have properly guessed already there is an Autofac implementation of the `IHttpControllerActivator` that will retrieve the lifetime scope from that property and use it to create the controller instance and its dependencies in the correct lifetime scope.

```csharp
public class AutofacControllerActivator : IHttpControllerActivator
{
    public IHttpController Create(HttpControllerContext controllerContext, Type controllerType)
    {
        var requestProperties = controllerContext.Request.Properties;

        if (!requestProperties.ContainsKey(AutofacControllerFactory.ApiRequestTag))
            throw GetInvalidOperationException();

        ILifetimeScope lifetimeScope = requestProperties[AutofacControllerFactory.ApiRequestTag] as ILifetimeScope;
        if (lifetimeScope == null)
            throw GetInvalidOperationException();

        return lifetimeScope.ResolveOptional(controllerType) as IHttpController;
    }

    internal static InvalidOperationException GetInvalidOperationException()
    {
        return new InvalidOperationException(
            string.Format(AutofacControllerActivatorResources.LifetimeScopeMissing,
                typeof(ILifetimeScope).FullName, typeof(HttpRequestMessage).FullName, typeof(AutofacControllerFactory).FullName));
    }
}
```

`AutofacControllerActivator` expects that if it is present in the dependency resolver, then the Autofac controller factory should be as well, and should have put the lifetime scope into the property on the `HttpRequestMessage`. It also expects that if the property is present that it should contain an `ILifetimeScope` that it can use to attempt to resolve the controller. If the controller is not found in the lifetime scope a `null` reference is returned and that will cause an exception to be thrown in the `DefaultHttpControllerFactory` when the `null` is assigned to the `Controller` property of the `HttpControllerContext`. Looking at the code in the current implementation of the `HttpControllerDispatcher` it seems that it actually expects a `null` being returned from the factory as a possibility even though it seems like this cannot happen.

```csharp
IHttpController httpController = this._controllerFactory.CreateController(controllerContext, str);
if (httpController == null)
{
    return TaskHelpers.FromResult<HttpResponseMessage>(request.CreateResponse(HttpStatusCode.NotFound));
}
```

Regardless, back in the `AutofacControllerFactory` any exceptions are caught to ensure that the lifetime scope can be disposed immediately before re-throwing the exception. The lifetime scope is placed into a `ConcurrentDictionary` using the controller instance as the key, so that it can be disposed when the `ReleaseController` method is called after the request is complete. Unfortunately, nothing else is passed to this method so the dictionary was required to tie the controller being released back to a lifetime scope. It would be great if more context was provided between these calls so that lifetime scope could be more easily managed.

The `IDependencyResolver` implementation is very basic and has been named `AutofacWebApiDependencyResolver` to avoid naming conflicts with the existing MVC implementation. In the Web API integration it works with the root container most of the time instead of looking for a current lifetime scope. Taking the approach of always looking for an ambient lifetime scope provided to be too difficult with the dual hosting model. I don’t think this will be a problem as outside of the lifetime scope for the API controller, it appears that most services are expected to be singleton or new instances on each call.

```csharp
public class AutofacWebApiDependencyResolver : IDependencyResolver
{
    readonly ILifetimeScope _container;

    public AutofacWebApiDependencyResolver(ILifetimeScope container)
    {
        if (container == null) throw new ArgumentNullException("container");
        _container = container;
    }

    public object GetService(Type serviceType)
    {
        return _container.ResolveOptional(serviceType);
    }

    public IEnumerable<object> GetServices(Type serviceType)
    {
        var enumerableServiceType = typeof(IEnumerable<>).MakeGenericType(serviceType);
        var instance = _container.Resolve(enumerableServiceType);
        return (IEnumerable<object>)instance;
    }
}
```

The registration extensions are also straight forward. `ConfigureWebApi` registers the `HttpConfiguration` instance making available to other services, and ensures that the Autofac controller factory and activator are registered too. Obviously, not much is going to happen if this method is not called before building your container.

```csharp
public static void ConfigureWebApi(this ContainerBuilder builder, HttpConfiguration configuration)
{
    builder.RegisterInstance(configuration);
    builder.Register<IHttpControllerActivator>(c => new AutofacControllerActivator())
        .SingleInstance();
    builder.Register<IHttpControllerFactory>(c => new AutofacControllerFactory(c.Resolve<HttpConfiguration>(), c.Resolve<ILifetimeScope>()))
        .SingleInstance();
}
```

Scanning for controllers is implemented similar to the MVC integration except we are looking for `IHttpController` derived types instead.

```csharp
public static IRegistrationBuilder<object, ScanningActivatorData, DynamicRegistrationStyle>
    RegisterApiControllers(this ContainerBuilder builder, params Assembly[] controllerAssemblies)
{
    return builder.RegisterAssemblyTypes(controllerAssemblies)
        .Where(t => typeof(IHttpController).IsAssignableFrom(t) && t.Name.EndsWith("Controller"));
}
```

Finally, and once again similar to the MVC `InstancePerHttpRequest` method, the `InstancePerApiRequest` method applies the predetermined tag to the registration so that it can be resolved within the API controller lifetime scope.

```csharp
public static IRegistrationBuilder<TLimit, TActivatorData, TStyle>
    InstancePerApiRequest<TLimit, TActivatorData, TStyle>(
        this IRegistrationBuilder<TLimit, TActivatorData, TStyle> registration)
{
    if (registration == null) throw new ArgumentNullException("registration");

    return registration.InstancePerMatchingLifetimeScope(AutofacControllerFactory.ApiRequestTag);
}
```

That pretty much covers it. Please download the package and report any bugs on the [issue
tracker](http://code.google.com/p/autofac/issues/list) or if you need help post your questions on [Stack Overflow](http://stackoverflow.com/questions/tagged/autofac) using the “autofac” tag. It will be interesting to see how much things change between this Beta and the final RTW. Happing API building!
