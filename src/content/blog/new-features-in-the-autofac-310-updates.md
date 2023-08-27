---
title: New features in the Autofac 3.1.0 updates
description: Autofac 3.1.0 has been released and includes a number of updates, such as separate XML configuration packages, additional lifetime scopes for request based registrations, Web API HttpRequestMessage injection, and more useful assembly descriptions.
pubDatetime: 2013-07-12
tags: [autofac]
---

The following 3.1.0 packages have been pushed to NuGet:

- [Autofac](https://nuget.org/packages/Autofac)
- [Autofac.Configuration](https://nuget.org/packages/Autofac.Configuration)
- [Autofac.Web](https://nuget.org/packages/Autofac.Web)
- [Autofac.Mvc4](https://nuget.org/packages/Autofac.Mvc4)
- [Autofac.WebApi](https://nuget.org/packages/Autofac.WebApi)
- [Autofac.Extras.Attributed](https://nuget.org/packages/Autofac.Extras.Attributed)

There are a number of changes in the updates but there a couple that I would like to highlight.

## Separate XML configuration package

The `Autofac.Configuration` assembly was distributed as part of the Autofac package even though it was not used in most projects. This has now been split out into a separate NuGet package called [Autofac.Configuration](https://nuget.org/packages/Autofac.Configuration). If you require XML configuration please add this separate package to your project and you will be back up and running in no time. There really wasn’t a good time to make this change so we decided that 3.1.0 was as good a time as any. The starting version of the configuration package is 3.1.0 to match the Autofac version it was split out from.

## Additional lifetime scopes for request based registrations

When using the Web, MVC and Web API integrations special lifetime scopes are provided allowing services to have their lifetime tied to the duration of the current request. This is an extremely useful feature but there are times when you would also like to use that dependency in an additional lifetime scope such as a background task.

Currently, you have to register these services as `InstancePerLifetimeScope` in order to resolve them outside of the special request lifetime scopes. For example, in the code below attempting resolve the `ILogger` instance in the **DifferentLifetimeScope** results in an exception stating, _No scope with a Tag matching 'AutofacWebRequest' is visible from the scope in which the instance was requested_.

```csharp
builder.Register<ILogger>(c => new Logger()).InstancePerApiRequest();

using (var lifetimeScope = container.BeginLifetimeScope("DifferentLifetimeScope"))
{
    lifetimeScope.Resolve<ILogger>(); // Bang!
}
```

It is now possible to provide the names of one or more lifetime scope tags to the `InstancePerHttpRequest` and `InstancePerApiRequest` registration methods allowing the service to be resolved in those additional lifetime scopes.

```csharp
builder.Register<ILogger>(c => new Logger()).InstancePerApiRequest("DifferentLifetimeScope", "AnotherLifetimeScope");

using (var lifetimeScope = container.BeginLifetimeScope("DifferentLifetimeScope"))
{
    lifetimeScope.Resolve<ILogger>(); // Woot!
}
```

This allows you to keep tighter control over the lifetime scopes a service is relevant to without using `InstancePerLifetimeScope` and opening the service up to resolution in all lifetime scopes including the root.

## Web API HttpRequestMessage Injection

When working with Web API you will often find yourself wanting access to the current `HttpRequestMessage` as a dependency. This is now possible starting with version 3.1.0 of the integration.

Imagine that you have a model adapter class that requires access to the `HttpRequestMessage`.

```csharp
public class ModelAdapter
{
    public HttpRequestMessage Request { get; set; }

    public ModelAdapter(HttpRequestMessage request)
    {
        Request = request;
    }
}
```

This service will be injected into your controller instance.

```csharp
public class MyController : ApiController
{
    private readonly ModelAdapter _adapter;

    public MyController(ModelAdapter adapter)
    {
        _adapter = adapter;
    }
}
```

To make this work start by calling `RegisterHttpRequestMessage` on your `ContainerBuilder` instance to enable to the feature. A custom `DelegatingHandler` is added to the `MessageHandlers` collection allowing the magic to happen.

```csharp
// Call RegisterHttpRequestMessage to add the feature.
builder.RegisterHttpRequestMessage(GlobalConfiguration.Configuration);
```

Now the dependency is available for resolution within your Web API request lifetime scope.

```csharp
// The HttpRequestMessage is now available for resolution.
builder.Register(c => new ModelAdapter(c.Resolve<HttpRequestMessage>())).InstancePerApiRequest();
```

## More useful assembly descriptions

Starting with Autofac 3.0 the team began following the [Semantic Versioning](http://semver.org/) guidelines. This works well with NuGet packages but not so well with assemblies that are strong named. To prevent redirects being added to your configuration file when updated minor or patch versions are deployed, the assembly version remains at the major version (currently 3.0.0.0) while the file version and package versions are incremented.

The file properties in Windows Explorer show the file version of this latest update is 3.1.0.0 matching the NuGet package version.

![image](/images/blog/image_41.png "image")

That obviously doesn’t help you when working inside Visual Studio. When looking in the **Properties** window for the reference you see that the **Version** property remains at 3.0.0.0 even when you have just upgraded the package to later version. To make it easier to determine the semantic version of the package you are using the `AssemblyDescription` attribute is set during the build process allowing you to quickly find this information in the **Description** property.

![image](/images/blog/image_42.png "image")
