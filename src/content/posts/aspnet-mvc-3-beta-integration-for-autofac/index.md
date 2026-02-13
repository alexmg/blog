---
title: ASP.NET MVC 3 Beta integration for Autofac
description: The Autofac MVC integration has been updated to provide integration with the ASP.NET MVC 3 Beta, making it easier for users by removing the need to add a reference to the Autofac.Integration.Web.dll assembly, implement the IContainerProviderAccessor interface on the HttpApplication, and register the ContainerDisposalModule in the web.config file. The core piece of the integration is the AutofacDependencyResolver which is an implementation of the IDependencyResolver interface that Brad Wilson outlines in his blog post series on ASP.NET MVC 3 Service Location. A HTTP module called RequestLifetimeModule is registered programmatically via the DynamicModuleUtility class to inform Autofac when the HTTP request has ended.
date: 2010-11-04
tags: [autofac, mvc]
---

I have just checked into [trunk](http://code.google.com/p/autofac/source/checkout) a first pass at the [ASP.NET MVC 3 Beta](http://weblogs.asp.net/scottgu/archive/2010/10/06/announcing-nupack-asp-net-mvc-3-beta-and-webmatrix-beta-2.aspx) integration for [Autofac](http://code.google.com/p/autofac/). In hope of simplifying the requirements for those getting started with the integration I wanted to prevent the need to:

- Add a reference the `Autofac.Integration.Web.dll` assembly
- Implement the `IContainerProviderAccessor` interface on the `HttpApplication`
- Register the `ContainerDisposalModule` in the web.config file

The code below is an example of all you would need to put into the application start event to get up and running.

```csharp
ContainerBuilder builder = new ContainerBuilder();
builder.RegisterControllers(Assembly.GetExecutingAssembly());
builder.Register(c => new Logger()).As<ILogger>().InstancePerHttpRequest();

IContainer container = builder.Build();
DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
```

The core piece of the integration is the `AutofacDependencyResolver`. This is an implementation of the `IDependencyResolver` interface that [Brad Wilson](http://bradwilson.typepad.com/blog/) outlines in his blog post series on [ASP.NET MVC 3 Service Location](http://bradwilson.typepad.com/blog/2010/07/service-location-pt1-introduction.html). The interface requires you to implement two simple methods: `GetService` and `GetServices`. When no service is found `GetService` should return null, and `GetServices` should return an empty `IEnumerable<object>`. The implementation of these methods ends up being straight forward (ignoring for now the code related to managing the `CurrentLifetimeScope`).

```csharp
public object GetService(Type serviceType)
{
    return CurrentLifetimeScope.IsRegistered(serviceType) ? CurrentLifetimeScope.Resolve(serviceType) : null;
}

public IEnumerable<object> GetServices(Type serviceType)
{
    Type enumerableServiceType = typeof(IEnumerable<>).MakeGenericType(serviceType);
    object instance = CurrentLifetimeScope.Resolve(enumerableServiceType);
    return ((IEnumerable)instance).Cast<object>();
}
```

When MVC needs to create a controller it will ask the `DependencyResolver` for an instance. The `AutofacDependencyResolver` returns the controllers that are registered in the container it was provided. These are usually registered using the `RegisterControllers` method on the `ContainerBuilder` as shown in the first code sample. There is no longer a need to create a class that derives from the `DefaultControllerFactory` for the sole purpose of returning controller instances. This means the `AutofacControllerFactory` is no longer required and has been removed.

The Autofac MVC integration has always supported the concept of a HTTP request lifetime scope. This means that the lifetime of a service can be scoped to the current HTTP request. The `ILogger` service registration in the sample code above uses the `InstancePerHttpRequest` method to indicate that the same instance of the logger service should be used for all dependency resolutions that occur during the current HTTP request. To make sure that the nested lifetime scope that Autofac creates for each request is disposed, it needs to be notified when the request has ended.

The only reliable way to do this is to create a HTTP module that subscribes to the `EndRequest` event of the `HttpApplication`. To register a HTTP module you need to add an entry to the web configuration file, which is something that I was hoping to avoid. [Rick Strahl](http://www.west-wind.com/Weblog/default.aspx) outlines one way of achieving programmatic registration of a module in his [Dynamically hooking up HttpModules](http://www.west-wind.com/weblog/posts/44979.aspx) post, but for the integration this would require the user to manually add the code to their `HttpApplication` instance (by default called MvcApplication).

It turns out that there is in fact another way to programmatically register a module. The `Microsoft.Web.Infrastructure.dll` assembly that ships with the ASP.NET Web Pages installer ([AspNetWebPages.msi](http://download.microsoft.com/download/8/8/D/88D72201-4230-4E19-BFDA-5868B350AA09/AspNetWebPages.msi)) contains a rather helpful class called `DynamicModuleUtility`. It has a single method called `RegisterModule` that accepts a `Type` for the module to register. You can only call this helper from a method that is marked as pre application start code as defined by the `PreApplicationStartMethodAttribute` applied to an assembly. The same trick is used in `System.Web.Pages.dll` to register the new `WebPageHttpModule`. [Phil Haack](http://haacked.com/) has a [blog post](http://haacked.com/archive/2010/05/16/three-hidden-extensibility-gems-in-asp-net-4.aspx) that talks about the `PreApplicationStartMethodAttribute` and some other interesting new ASP.NET 4 features in greater detail if you are keen to know more. You need to install ASP.NET Web Pages before installing ASP.NET MVC 3 so we know the assembly with this helpful little gem will be available.

In the Autofac integration we first needed to add the assembly attribute.

```csharp
[assembly: PreApplicationStartMethod(typeof(PreApplicationStartCode), "Start")]
```

This points to a static class that contains a single static method called `Start`. Inside this method we call the `DynamicModuleUtility` to register the `RequestLifetimeModule` that will informs us when the HTTP request has ended. There is no need to ever call this class directly but unfortunately, it and the method must be public. That is why we have the `EditorBrowsable` attribute being applied in order to hide the class from the editor. Not really that much work to save a user from having to dive into the web configuration file.

```csharp
[EditorBrowsable(EditorBrowsableState.Never)]
public static class PreApplicationStartCode
{
    private static bool _startWasCalled;

    public static void Start()
    {
        if (_startWasCalled) return;

        _startWasCalled = true;
        DynamicModuleUtility.RegisterModule(typeof(RequestLifetimeModule));
    }
}
```

There is a new interface in the MVC 3 integration called `ILifetimeScopeProvider`. The HTTP module `RequestLifetimeModule` shown above actually implements this interface and is the default implementation used by the `AutofacDependencyResolver`. You can see from the `AutofacDependencyResolver` code shown at the start of the post that the resolutions are happening from the `CurrentLifetimeScope` property.

```csharp
internal ILifetimeScope CurrentLifetimeScope
{
    get
    {
        if (_lifetimeScopeProvider == null)
            _lifetimeScopeProvider = GetRequestLifetimeModule();
        return _lifetimeScopeProvider.GetLifetimeScope(_container, _configurationAction);
    }
}
```

You can add your own `ILifetimeScopeProvider` implementation to the container that is passed to the `AutofacDependencyResolver` if you want to replace the HTTP request based lifetime behaviour. The `AutofacDependencyResolver` will attempt to retrieve it from the container during its constructor. Because the `RequestLifetimeModule` is the default `ILifetimeScopeProvider` and an instance was already created by ASP.NET when the module was initialised, we can go and grab that from the `HttpModuleCollection` of the current `HttpApplication`.

```csharp
static ILifetimeScopeProvider GetRequestLifetimeModule()
{
    HttpModuleCollection httpModules = HttpContext.Current.ApplicationInstance.Modules;
    for (int index = 0; index < httpModules.Count; index++)
    {
        if (httpModules[index] is RequestLifetimeModule)
            return (RequestLifetimeModule)httpModules[index];
    }
    throw new InvalidOperationException(string.Format(
        AutofacDependencyResolverResources.HttpModuleNotLoaded, typeof(RequestLifetimeModule)));
}
```

None of the model binding code has been moved into the new integration yet. I am hoping that this can be refactored to use the new `IModelBinderProvider` interface. This is only a first pass based on a new approach so it is likely that some of this will change. I have certainly found the exercise interesting enough that I thought it was worth sharing the start of the journey.
