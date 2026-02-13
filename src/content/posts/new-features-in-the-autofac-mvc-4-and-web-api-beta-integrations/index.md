---
title: New features in the Autofac MVC 4 and Web API (Beta) Integrations
description: This post outlines the new features in the latest pre-release NuGet packages for the Autofac integrations with MVC 4 and Web API. These features include registering filters without attributes, registering per-controller type services, and supporting InstancePerApiControllerType lifetimes.
date: 2012-08-31
tags: [autofac]
---

This post outlines the new features in the latest pre-release NuGet packages for the Autofac integrations with [MVC 4](https://nuget.org/packages/Autofac.Mvc4) and [Web API](https://nuget.org/packages/Autofac.WebApi). You can find more information about the initial support for dependency injection with Web API controller instances in my previous [post](http://alexmg.com/post/2012/06/08/Autofac-262859-and-ASPNET-MVC-4-RC-Integrations-Released.aspx).

## A quick note on versioning

The integration packages that I recently pushed out are compiled against the RTM version of MVC 4 and Web API. They also reference the latest Autofac package  and all three versions are now the same (2.6.3.862). I also took advantage of the pre-release NuGet support to mark the two integration packages as **beta**. The idea is that after getting some feedback and releasing some additional pre-release packages the final release versions will all continue to be aligned.

## Filters without attributes in MVC 4

This feature started because someone on Twitter was asking why constructor injection was not supported for filter attributes. Because attributes are created via the reflection API you don’t actually get to call the constructor yourself. That leaves you with no other option
except for property injection when working with attributes. The question did get me thinking about an alternative approach for working with filters though. What I came up with was a mechanism that allows you to create classes that implement the filter interfaces (`IActionFilter`, `IAuthorizationFilter`, `IExceptionFilter` and `IResultFilter`) and wire them up to the desired controller or action method using the registration syntax on the container builder.

To get a feel for what this looks like imagine that you want to inject your logging service into an action filter to instrument an action method invocation.

You create an interface for your logging service.

```csharp
public interface ILogger
{
    void Write(string message);
}
```

In this example the implementation will just write to the `Debug` class.

```csharp
public class Logger : ILogger
{
    public void Write(string message)
    {
        Debug.WriteLine(message);
    }
}
```

Next you create an `IActionFilter` class that will have the logger injected into its constructor. This one simply logs the name of the action being invoked.

```csharp
public class LoggingActionFilter : IActionFilter
{
    readonly ILogger _logger;

    public LoggingActionFilter(ILogger logger)
    {
        _logger = logger;
    }

    public void OnActionExecuting(ActionExecutingContext filterContext)
    {
        _logger.Write(filterContext.ActionDescriptor.ActionName);
    }

    public void OnActionExecuted(ActionExecutedContext filterContext)
    {
        _logger.Write(filterContext.ActionDescriptor.ActionName);
    }
}
```

For the action filter to execute you need to register the Autofac filter provider implementation, the logger service, and the action filter.

```csharp
var builder = new ContainerBuilder();

builder.RegisterFilterProvider();

builder.Register(c => new Logger())
    .As<ILogger>()
    .InstancePerHttpRequest();

builder.Register(c => new LoggingActionFilter(c.Resolve<ILogger>()))
    .AsActionFilterFor<HomeController>(c => c.Index())
    .InstancePerHttpRequest();

builder.RegisterControllers(Assembly.GetExecutingAssembly());

var container = builder.Build();
DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
```

You need to register the filter provider because it is does the work of wiring up the filter based on the registration. To indicate what the action filter should be applied to the `AsActionFilterFor` method on the builder is used. It requires a generic type parameter for the type of the controller, and an optional lambda expression that indicates a specific method on the controller the filter should be applied to. If you don’t provide the lambda expression the filter will be applied to all action methods on the controller in the same way that placing an attribute based filter at the controller level would. In the example above we are applying the filter to the `Index` action method on the `HomeController`.

It is also possible to provide a base controller type in the generic type parameter to have the filter applied to all derived controllers. In addition, you can also make your lambda expression for the action method target a method on a base controller type and have it applied to that method on all derived controllers. Finally, you can also provide the sort order for the filter the same way you would with an attribute.

```csharp
builder.Register(c => new LoggingActionFilter(c.Resolve<ILogger>()))
    .AsActionFilterFor<HomeController>(c => c.Index(), order: 1)
    .InstancePerHttpRequest();
```

When applying the filter to an action method that requires a parameter use the `default` keyword with the data type of the parameter as a placeholder in your lambda expression. For example, if you have an action method called `GetStuff` that requires an `int` parameter your registration would look like this.

```csharp
builder.Register(c => new LoggingActionFilter(c.Resolve<ILogger>()))
    .AsActionFilterFor<MyController>(c => c.GetStuff(default(int)))
    .InstancePerHttpRequest();
```

You are able to choose the appropriate lifetime scope for your filter including `InstancePerHttpRequest`. Working with the other types of filters is exactly the same except you use the extension method on the container builder that matches the type of filter you are registering (`AsAuthorizationFilterFor`, `AsExceptionFilterFor` and `AsResultFilterFor`).

## Filters without attributes in Web API

The same support for filters without attributes has been added to the Web API integration except you need to use filter interfaces provided by the Autofac integration (`IAutofacActionFilter`, `IAutofacAuthorizationFilter` and `IAutofacExceptionFilter`). You are no doubt wondering why I introduced special interfaces but this should become more apparent if you take a look at the signature of the `IActionFilter` interface in Web API.

```csharp
public interface IActionFilter : IFilter
{
    Task<HttpResponseMessage> ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation);
}
```

Now compare that to the Autofac interface that you need to implement instead.

```csharp
public interface IAutofacActionFilter
{
    void OnActionExecuting(HttpActionContext actionContext);

    void OnActionExecuted(HttpActionExecutedContext actionExecutedContext);
}
```

The problem is that the `OnActionExecuting` and `OnActionExecuted` methods are actually defined on the the `ActionFilterAttribute` and not on the `IActionFilter` interface. Extensive use of the `System.Threading.Tasks` namespace in Web API means that chaining the return task along with the appropriate error handling in the attribute actually requires a significant amount of code (the `ActionFilterAttribute` contains nearly 100 lines of [code](http://aspnetwebstack.codeplex.com/SourceControl/changeset/view/f276aa28c436#src%2fSystem.Web.Http%2fFilters%2fActionFilterAttribute.cs) for that). This is definitely not something that you want to be handling yourself so I introduced the new interfaces to allow you to concentrate on implementing the code for your filter and not all that plumbing. Internally I create custom instances of the actual Web API attributes that resolve the filter implementations from the container and execute them at the appropriate time.

Another reason for creating the internal attribute wrappers is to support the `InstancePerApiRequest` lifetime scope for filters. Unlike the filter provider in MVC the one in Web API does not allow you to specify that the filter instances should not be cached. This means that all filter attributes in Web API are effectively singleton instances that exist for the entire lifetime of the application. I raised my concern about this with the development team but the desire to ensure maximum performance by default won the argument. My personal opinion is that the lifetime for all services requested from the container should be determined by the developer configuring the container. The decision if a service should be singleton or transient in nature should be decided based upon the kind of work the service will perform. This caching of services makes it difficult to implement a Unit of Work pattern per-request because many of the services involved will not have their lifetimes and disposal managed by the container.

Regardless, in the end I got everything that I wanted working so let’s look at what the action filter example would look like for a Web API controller. Notice that the filter implements `IAutofacActionFilter` instead of `IActionFilter` from `System.Web.Http.Filters`.

```csharp
public class LoggingActionFilter : IAutofacActionFilter
{
    readonly ILogger _logger;

    public LoggingActionFilter(ILogger logger)
    {
        _logger = logger;
    }

    public void OnActionExecuting(HttpActionContext actionContext)
    {
        _logger.Write(actionContext.ActionDescriptor.ActionName);
    }

    public void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
    {
        _logger.Write(actionExecutedContext.ActionContext.ActionDescriptor.ActionName);
    }
}
```

The registration code looks very similar to the MVC code shown earlier.

```csharp
var builder = new ContainerBuilder();

builder.RegisterWebApiFilterProvider(GlobalConfiguration.Configuration);

builder.Register(c => new Logger())
    .As<ILogger>()
    .InstancePerApiRequest();

builder.Register(c => new LoggingActionFilter(c.Resolve<ILogger>()))
    .AsActionFilterFor<ValuesController>(c => c.Get(default(int)))
    .InstancePerApiRequest();

builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

var container = builder.Build();
GlobalConfiguration.Configuration.DependencyResolver = new AutofacWebApiDependencyResolver(container);
```

Just like with the MVC registrations we need to register the custom filter provider for Web API but this time we use the `RegisterWebApiFilterProvider` method. The methods on the container builder for assigning the filters to controllers and action methods follow the same naming convention as MVC with the exception that the `AsResultFilterFor` method does not exist because there is no result filter in Web API. The other difference is that there is no order parameter on the methods for Web API because the order property does not exist on the filter attributes. You use the generic type parameter for the controller and a lambda expression for the action method in the same way.

## Per-controller type services in Web API

Web API has an interesting feature that allows you to configure the set of Web API specific services (those such as `IActionValueBinder`) that should be used per-controller type by adding an attribute that implements the `IControllerConfiguration` interface to your controller. Through the `Services` property on the `HttpControllerSettings` parameter passed to the `Initialize` method of that interface you can override the global set of services. This attribute based approach seems to encourage you to directly instantiate service instances and then override the ones registered globally. I thought it would be nice to allow these per-controller type services to be configured through the container instead of being buried away in an attribute without DI support.

There is no escaping adding an attribute to the controller that the configuration should be applied to because that is the extension point defined by Web API. The Autofac integration includes an `AutofacControllerConfigurationAttribute` that you can apply to your Web API controllers to indicate that they require per-controller type configuration. The point to remember here is that the actual configuration of what services should be applied will be done when you build your container and there is no need to implement any of that in an actual attribute. In this case the attribute can be considered as purely a marker that indicates that the container will define the configuration information and provide the service instances.

```csharp
[AutofacControllerConfiguration]
public class ValuesController : ApiController
{
    // Implementation...
}
```

The supported services can be divided into single-style or multiple-style services. For example, you can only have one `IHttpActionInvoker` but you can have multiple `ModelBinderProvider` services.

You can use dependency injection for the following single-style
services:

- `IHttpActionInvoker`
- `IHttpActionSelector`
- `IActionValueBinder`
- `IBodyModelValidator`
- `IContentNegotiator`
- `IHttpControllerActivator`
- `ModelMetadataProvider`

The following multiple style services are supported:

- `ModelBinderProvider`
- `ModelValidatorProvider`
- `ValueProviderFactory`
- `MediaTypeFormatter`

In the list of the multiple-style services above the `MediaTypeFormatter` is actually the odd one out. Technically, it isn’t actually a service and is added to the `MediaTypeFormatterCollection` on the `HttpControllerSettings` instance and not the `ControllerServices` container. I figured that there was no reason to exclude `MediaTypeFormatter` instances from dependency injection support and made sure that they could be resolved from the container per-controller type too.

Here is an example of registering a custom `IHttpActionSelector` implementation as `InstancePerApiControllerType` for the `ValuesController`. When applied to a controller type all derived controllers will also receive the same configuration; the `AutofacControllerConfigurationAttribute` is inherited by derived controller types and the same behaviour applies to the registrations in the container. When you register a single-style services it will always replace the default service configured at the global level.

```csharp
builder.Register(c => new CustomActionSelector())
    .As<IHttpActionSelector>()
    .InstancePerApiControllerType(typeof(ValuesController));
```

Multiple-style services are by default appended to the existing set of services configured at the global level. When registering multiple services with the container you can choose to clear the existing set of services so that only the ones you have registered as `InstancePerApiControllerType` will be used. This is done by setting the `clearExistingServices` parameter to `true` on the `InstancePerApiControllerType` method. Existing services of that type will be removed if any of the registrations for the multiple-style service indicate that they want that to happen.

```csharp
builder.Register(c => new CustomModelBinderProvider())
    .As<ModelBinderProvider>()
    .InstancePerApiControllerType(typeof(ValuesController), clearExistingServices: true);
```

I’m not entirely happy with this particular feature because it is not possible to take dependencies on services that are registered as `InstancePerApiRequest`. The problem once again is that Web API is caching these services and is not requesting them from the container each time a controller of that type is created. I don’t think it would be possible for Web API to do that without introducing the notion of a key (for the controller type) into the DI support and that would mean that all containers would need to support keyed services.

## Feedback welcome

I am very keen to receive feedback on these new features as I have not had the chance to use them in a production setting and put them through their paces. Hopefully you like the idea of filters that support constructor injection and don’t require attributes. I would be very interested to hear how useful you think the `InstancePerApiControllerType` feature is despite the issue with it not being able to take dependencies on services registered as `InstancePerApiRequest`.
