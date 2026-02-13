---
title: FilterAttribute Property Injection in Autofac MVC 3 Integration
description: The mechanism for performing property injection on FilterAttributes via ExtensibleActionInvoker had to be removed due to a bug. The new approach leverages the improved dependency injection support added to MVC 3 and requires calling the RegisterFilterProvider method before building the container and providing it to the AutofacDependencyResolver. A custom FilterAttributeFilterProvider and extension method was added to make this work.
date: 2011-03-24
tags: [autofac, mvc]
---

The current mechanism for performing property injection on `FilterAttribute` instances via the `ExtensibleActionInvoker` had to be removed recently due to a rather nasty [bug](http://code.google.com/p/autofac/issues/detail?id=311#makechanges). These are the notes that [Nick](http://nblumhardt.com/) provided outlining the problem he discovered (possibly with the help of the exciting new [Whitebox](http://code.google.com/p/whitebox/) profiler).

> Because the filters passed from the base action invoker also include the controller, property injection happens on the controller itself several times as the filters are processed.
>
> The filter attributes also included in the collection may also be singletons cached by MVC, and so it is quite likely that dependencies may be overwritten with those from a concurrently executing request.
>
> In all this behaviour is probably too risky to reliably support.
>
> Removed property injection routine. (Breaking change.)

I have replaced the old mechanism using an approach that leverages the improved dependency injection support added to MVC 3 (this will be in the next release). To make use of property injection for your filter attributes all you will need to do is call the `RegisterFilterProvider` method on the `ContainerBuilder` before building your container and providing it to the `AutofacDependencyResolver`.

```csharp
ContainerBuilder builder = new ContainerBuilder();

builder.RegisterControllers(Assembly.GetExecutingAssembly());
builder.Register(c => new Logger()).As<ILogger>().InstancePerHttpRequest();
builder.RegisterFilterProvider();

IContainer container = builder.Build();
DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
```

Then you can add properties to your filter attributes and any matching dependencies that are registered in the container will be injected into the properties. For example, the action filter below will have the `ILogger` instance that was registered above injected. Note that the attribute itself does not need to be registered in the container.

```csharp
public class CustomActionFilter : ActionFilterAttribute
{
    public ILogger Logger { get; set; }

    public override void OnActionExecuting(ActionExecutingContext filterContext)
    {
        Logger.Log("OnActionExecuting");
    }
}
```

The same simple approach applies to the other filter attribute types such as authorization attributes.

```csharp
public class CustomAuthorizeAttribute : AuthorizeAttribute
{
    public ILogger Logger { get; set; }

    protected override bool AuthorizeCore(HttpContextBase httpContext)
    {
        Logger.Log("AuthorizeCore");
        return true;
    }
}
```

After applying the attributes to your actions as required your work is done.

```csharp
[CustomActionFilter]
[CustomAuthorizeAttribute]
public ActionResult Index()
{
    //...
}
```

To make this work I added a custom `FilterAttributeFilterProvider` implementation. The custom filter provider delegates the job of collecting the filters to the base class. Once the filters have been retrieved by the base class, the `ILifetimeScope` for the current HTTP request is retrieved and used to perform property injection on the filters. The `false` passed to the base `FilterAttributeProvider` constructor sets the `cacheAttributeInstances` parameter to ensure that attribute instances are not cached. Allowing the attribute instances to be cached would result in race conditions and other unexpected behaviour.

```csharp
/// <summary>
/// Defines a filter provider for filter attributes that performs property injection.
/// </summary>
public class AutofacFilterAttributeFilterProvider : FilterAttributeFilterProvider
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AutofacFilterAttributeFilterProvider"/> class.
    /// </summary>
    /// <remarks>
    /// The <c>false</c> constructor parameter passed to base here ensures that attribute instances are not cached.
    /// </remarks>
    public AutofacFilterAttributeFilterProvider() : base(false)
    {
    }

    /// <summary>
    /// Aggregates the filters from all of the filter providers into one collection.
    /// </summary>
    /// <param name="controllerContext">The controller context.</param>
    /// <param name="actionDescriptor">The action descriptor.</param>
    /// <returns>
    /// The collection filters from all of the filter providers with properties injected.
    /// </returns>
    public override IEnumerable<Filter> GetFilters(ControllerContext controllerContext, ActionDescriptor actionDescriptor)
    {
        var filters = base.GetFilters(controllerContext, actionDescriptor).ToArray();
        var lifetimeScope = AutofacDependencyResolver.Current.RequestLifetimeScope;

        if (lifetimeScope != null)
            foreach (var filter in filters)
                lifetimeScope.InjectProperties(filter.Instance);

        return filters;
    }
}
```

The `RegisterFilterProvider` method has been added to the `ContainerBuilder` using an extension method. This method will register the `AutofacFilterAttributeFilterProvider` using the `IFilterProvider` interface that MVC uses when asking the dependency resolver for filter providers. Following the instructions outlined in Brad Wilson’s [post](http://bradwilson.typepad.com/blog/2010/07/service-location-pt4-filters.html) on the subject of dependency injection and filters, I made sure that the default `FilterAttributeFilterProvider` instance is removed from the static collection of providers.

```csharp
/// <summary>
/// Registers the <see cref="AutofacFilterAttributeFilterProvider"/>.
/// </summary>
/// <param name="builder">The container builder.</param>
public static void RegisterFilterProvider(this ContainerBuilder builder)
{
    if (builder == null) throw new ArgumentNullException("builder");

    foreach (var provider in FilterProviders.Providers.OfType<FilterAttributeFilterProvider>().ToArray())
        FilterProviders.Providers.Remove(provider);

    builder.RegisterType<AutofacFilterAttributeFilterProvider>()
        .As<IFilterProvider>()
        .SingleInstance();
}
```

If you were using the old mechanism you will have breaking changes to contend with, but as you can see it should be easy to get back on track again.
