---
title: OWIN support for the Web API 2 and MVC 5 integrations in Autofac
description: Autofac has recently released pre-release packages for OWIN support for Web API and MVC 5 integrations. These packages enable dependency injection for OWIN middleware components, and extend the Autofac lifetime scope from the OWIN pipeline into the MVC and Web API integrations.
pubDatetime: 2014-02-17
tags: [autofac, mvc, web-api]
---

Currently, in the both the Web API and MVC frameworks, dependency injection support does not come into play until after the OWIN pipeline has started executing. This is simply a result of the OWIN support being added to both frameworks after their initial release. In fact, the OWIN support in MVC does not yet extend to the self hosting scenario and is limited to plugging in OWIN middleware.

I had two primary objectives when creating these new OWIN packages for Autofac:

- Extend the Autofac lifetime scope from the OWIN pipeline into the MVC and Web API integrations
- Make dependency injection avaialable to OWIN middleware components

Due to the somewhat fragmented nature of the DI support in the ASP.NET stack, achieving this goal required a bit of trickery and black magic. For that reason the packages are currently pre-release and marked as alpha. Hopefully you can pull them from NuGet and help test them out.

## Enabling DI for OWIN middleware

Lets start with a service interface for a logging dependency...

```csharp
public interface ILogger
{
    void Write(string message, params object[] args);
}
```

...along with its rather unimaginative implementation (just imagine something more interesting).

```csharp
public class Logger : ILogger
{
    public void Write(string message, params object[] args)
    {
        Debug.WriteLine(message, args);
    }
}
```

To enable dependency injection for OWIN middleware derive from `OwinMiddleware` as usual, and add any additional constructor dependencies after the constructor parameter for the next middleware in the chain. In the example below we are adding the `ILogger` dependency to the middleware.

```csharp
public class LoggerMiddleware : OwinMiddleware
{
    private readonly ILogger _logger;

    public LoggerMiddleware(OwinMiddleware next, ILogger logger) : base(next)
    {
        _logger = logger;
    }

    public override async Task Invoke(IOwinContext context)
    {
        _logger.Write("Inside the 'Invoke' method of the 'LoggerMiddleware' middleware.");

        foreach (var pair in context.Environment)
            _logger.Write("Key: {0}, Value: {1}", pair.Key, pair.Value);

        await Next.Invoke(context);
    }
}
```

To wire this up we have to register the middleware and its dependencies with the container, and then enable the middleware dependency injection support via a call to `UseAutofacMiddleware`. This call should be the first piece of middleware registered with the `IAppBuilder`.

```csharp
var builder = new ContainerBuilder();

builder.RegisterType<LoggerMiddleware>().InstancePerApiRequest();
builder.Register(c => new Logger()).As<ILogger>().InstancePerLifetimeScope();

app.UseAutofacMiddleware(container);
```

This particular extension method is included in the `Autofac.Owin` package which is shared by the `Autofac.WebApi2.Owin` and `Autofac.Mvc5.Owin` packages. You would not normally use this package by itself because of the second role the shared package plays. Not only is it responsible for adding middleware dependency injection support, it also creates an Autofac `ILifetimeScope` instance for each request early in the OWIN pipeline. You can access this lifetime scope using the `GetAutofacLifetimeScope` method on `IOwinContext`. The OWIN packages for the Web API and MVC integrations use this method to access the lifetime scope and make it available further along in the request.

## Extending the lifetime scope to Web API

To enable the lifetime scope created during the OWIN request to extend into the Web API dependency scope call the `UseAutofacWebApi` method.

```csharp
app.UseAutofacMiddleware(container);
app.UseAutofacWebApi(GlobalConfiguration.Configuration);
```

This will add a `DelegatingHandler` which extracts the `ILifetimeScope` from the `IOwinContext`. Once it has a hold of the `ILifetimeScope` an `AutofacWebApiDependencyScope` is created and added into the appropriate `HttpRequestMessage` property that Web API expects the `IDependencyScope` to be available from. The code below shows this task being performed during the `SendAsync` method of the handler.

```csharp
protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
{
    if (request == null) throw new ArgumentNullException("request");

    var owinContext = request.GetOwinContext();
    if (owinContext == null) return base.SendAsync(request, cancellationToken);

    var lifetimeScope = owinContext.GetAutofacLifetimeScope();
    if (lifetimeScope == null) return base.SendAsync(request, cancellationToken);

    var dependencyScope = new AutofacWebApiDependencyScope(lifetimeScope);
    request.Properties[HttpPropertyKeys.DependencyScope] = dependencyScope;

    return base.SendAsync(request, cancellationToken);
}
```

Notice that we still made a call to `UseAutofacMiddleware`. This is required because along with enabling the middleware DI support, this is also responsible for placing the lifetime scope in the OWIN context. I'm not totally happy with this dual responsibility but it does reduce the API surface area and means less `IAppBuilder` extensions are required. For now, if you don't want to use middleware DI support, don't register your middleware with the container.

## Extending the lifetime scope to MVC

To enable the lifetime scope created during the OWIN request to extend into the MVC request call the `UseAutofacMvc` method on your `IAppBuilder` instance.

```csharp
app.UseAutofacMiddleware(container);
app.UseAutofacMvc();
```

Just like with Web API we need to ensure that `UseAutofacMiddleware` has been called first. You only need to call this method once, even when using both the MVC and Web API integrations together. Remember, the call to `UseAutofacMiddleware` should be made as early as possible during the bootstrapping process.

In the MVC middleware we are also retrieving the `ILifetimeScope` from the `IOwinContext`, but in this case we are placing it in the `HttpContext` as is expected by the MVC integration. The code below shows this process directly implemented in a middleware method.

```csharp
public static IAppBuilder UseAutofacMvc(this IAppBuilder app)
{
    return app.Use(async (context, next) =>
    {
        var lifetimeScope = context.GetAutofacLifetimeScope();
        var httpContext = CurrentHttpContext();

        if (lifetimeScope != null && httpContext != null)
            httpContext.Items[typeof(ILifetimeScope)] = lifetimeScope;

        await next();
    });
}
```

In case you are wondering, `CurrentHttpContext` is an internal property that returns a `HttpContextBase` allowing for mocking of the HTTP context during unit testing.

## NuGet Packages

As mentioned earlier the packages are currently pre-release, so don't forget the `-Pre` switch on the command line, or the `Include Prerelease` option in the GUI. Please report any issues that you find on [GitHub](https://github.com/autofac/Autofac/issues).

Autofac Web API OWIN Integration:

[Install-Package Autofac.WebApi2.Owin -Pre](https://www.nuget.org/packages/Autofac.WebApi2.Owin/)

Autofac MVC 5 OWIN Integration:

[Install-Package Autofac.Mvc5.Owin -Pre](https://www.nuget.org/packages/Autofac.Mvc5.Owin/)

Please note that you still need to configure the relevant dependency resolver for each integration: `AutofacWebApiDependencyResolver` for Web API, and `AutofacDependencyResolver` for MVC.
