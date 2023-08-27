---
title: Fluent interface for Filter Overrides in the Autofac MVC and Web API integrations
description: Autofac now supports overriding filters using the fluent registration API for MVC 5 and Web API 2. This feature is available starting at 3.1.0 of the Autofac.WebApi2 and Autofac.Mvc5 packages on NuGet, and allows for you to add global filters but exclude some from specific actions or controllers.
pubDatetime: 2013-12-28
tags: [autofac]
---

The ASP.NET and Web Tools for Visual Studio 2013 introduced filter overrides for MVC 5 and Web API 2. This rather useful feature is only briefly mentioned in the [release notes](http://www.asp.net/visual-studio/overview/2013/release-notes).

> You can now override which filters apply to a given action method or controller, by specifying an override filter. Override filters specify a set of filter types that should not run for a given scope (action or controller). This allows you to add global filters, but then exclude some from specific actions or controllers.

For more information and examples on the Filter Overrides feature, Filip W has a good [post](http://www.strathweb.com/2013/06/overriding-filters-in-asp-net-web-api-vnext/) covering the feature in Web API, and David Hayden has a similar [post](http://www.davidhayden.me/blog/filter-overrides-in-asp-net-mvc-5) for MVC.

Autofac now supports overriding filters using the fluent registration API. This feature is available starting at 3.1.0 of the [Autofac.WebApi2](https://www.nuget.org/packages/Autofac.WebApi2) and [Autofac.Mvc5](https://www.nuget.org/packages/Autofac.Mvc5) packages on NuGet.

## Web API 2 Example

To demonstrate this feature lets create two simple Web API action filters. The first filter will be applied at the controller level and will be applied to all actions by default.

```csharp
public class MyWebApiFilter : IAutofacActionFilter
{
    public void OnActionExecuting(HttpActionContext actionContext)
    {
        Debug.WriteLine("Executing my Web API filter!");
    }

    public void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
    {
        Debug.WriteLine("Executed my Web API filter!");
    }
}
```

The second filter is one that we want to use as an override. It should only execute for a particular action method on the controller.

```csharp
public class MyWebApiOverrideFilter : IAutofacActionFilter
{
    public void OnActionExecuting(HttpActionContext actionContext)
    {
        Debug.WriteLine("Executing my Web API override filter!");
    }

    public void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
    {
        Debug.WriteLine("Executed my Web API override filter!");
    }
}
```

Next we need to call `RegisterWebApiFilterProvider` and add a registration targeting the desired controller or action. In this case we will register the `MyWebApiFilter` filter for all actions on the canonical `ValuesController`.

```csharp
builder.RegisterWebApiFilterProvider(GlobalConfiguration.Configuration);

builder.Register(c => new MyWebApiFilter())
    .AsWebApiActionFilterFor<ValuesController>()
    .InstancePerApiRequest();
```

Now to the new functionality. To override the filter for a particular action we can use the `AsWebApiActionFilterOverrideFor` method along with a lambda expression expression describing the controller or action method. Here we are registering `MyWebApiOverrideFilter` as a filter override for the `Get(int id)` action method.

```csharp
builder.Register(c => new MyWebApiOverrideFilter())
    .AsWebApiActionFilterOverrideFor<ValuesController>(c => c.Get(default(int)))
    .InstancePerApiRequest();
```

Instead of overriding a filter with a different filter implementation, you may want a filter to not be applied for a certain controller or action. This can be achieved using the `OverrideWebApiActionFilterFor` method along with a lamba expression describing the controller or action method. You will find this method directly on the `ContainerBuilder` because it isn't associated with an actual registration.

```csharp
builder.OverrideWebApiActionFilterFor<ValuesController>(c => c.Get(default(int)));
```

By replacing the `AsWebApiActionFilterOverrideFor` call from our previous example with a call to `OverrideWebApiActionFilterFor`, we are now preventing the `MyWebApiFilter` from being executed for the `Get(int id)` action method.

The following filter overrides are available in the Web API integration.

- Action via `AsWebApiActionFilterOverrideFor` and `OverrideWebApiActionFilterFor`
- Authentication via `AsWebApiAuthenticationFilterOverrideFor` and `OverrideWebApiAuthenticationFilterFor`
- Authorization via `AsWebApiAuthorizationFilterOverrideFor` and `OverrideWebApiAuthorizationFilterFor`
- Exception via `AsWebApiExceptionFilterOverrideFor` and `OverrideWebApiExceptionFilterFor`

## MVC 5 Example

The process for MVC is essentially the same as for Web API. First we create a filter that we would like to execute for all actions on our controller.

```csharp
public class MyMvcFilter : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext filterContext)
    {
        Debug.WriteLine("Executing my MVC filter!");
    }

    public override void OnActionExecuted(ActionExecutedContext filterContext)
    {
        Debug.WriteLine("Executed my MVC filter!");
    }
}
```

Next we create a second filter to use as an override that will only execute for a particular action method on the controller.

```csharp
public class MyMvcFilterOverride : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext filterContext)
    {
        Debug.WriteLine("Executing my MVC override filter!");
    }

    public override void OnActionExecuted(ActionExecutedContext filterContext)
    {
        Debug.WriteLine("Executed my MVC override filter!");
    }
}
```

After ensuring that `RegisterFilterProvider` has been called we add a registration targeting the desired controller or action. In this case we will register the `MyMvcFilter` filter for all actions on the sample `HomeController`.

```csharp
builder.RegisterFilterProvider();
builder.Register(c => new MyMvcFilter())
    .AsActionFilterFor<HomeController>()
    .InstancePerHttpRequest();
```

To override the filter for a particular action we can use the `AsActionFilterOverrideFor` method along with a lambda expression expression describing the controller or action method. Here we are registering `MyMvcFilterOverride` as a filter override for the `About()` action method.

```csharp
builder.Register(c => new MyMvcFilterOverride())
    .AsActionFilterOverrideFor<HomeController>(c => c.About())
    .InstancePerHttpRequest();
```

It is also possible to prevent a filter from being applied to a certain controller or action as we did in the Web API example. This can be achieved in MVC using the `OverrideActionFilterFor` method along with a lamba expression describing the controller or action method. You will find this method directly on the `ContainerBuilder` because it isn't associated with an actual registration.

```csharp
builder.OverrideActionFilterFor<HomeController>(c => c.About());
```

By replacing the `AsActionFilterOverrideFor` call from our previous example with a call to `OverrideActionFilterFor`, we are now preventing the `MyMvcFilter` from being executed for the `About()` action method.

The same filter overrides are available in the MVC integration with the addition of result filters.

- Action via `AsActionFilterOverrideFor` and `OverrideActionFilterFor`
- Authentication via `AsAuthenticationFilterOverrideFor` and `OverrideAuthenticationFilterFor`
- Authorization via `AsAuthorizationFilterOverrideFor` and `OverrideAuthorizationFilterFor`
- Exception via `AsExceptionFilterOverrideFor` and `OverrideExceptionFilterFor`
- Result via `AsResultFilterOverrideFor` and `OverrideResultFilterFor`
