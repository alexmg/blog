---
title: Autofac 4.0 alpha1 for ASP.NET 5.0 beta3
description: Autofac 4.0 alpha1 for ASP.NET 5.0 beta3 is now available on NuGet and can be used with Visual Studio 2015 CTP 6. This version supports the Core CLR without introducing breaking changes, and provides a single integration for the entire web stack. It also includes an Autofac module to encapsulate dependencies. Using this release, developers will be able to create a Web API controller and inject the dependencies they need.
pubDatetime: 2015-03-12
tags: [autofac, dnx]
---

As Travis outlined in his recent [post](http://www.paraesthesia.com/archive/2015/02/10/update-on-autofac-and-aspnet-vnext/), we've been hard at work getting Autofac ready for ASP.NET 5.0 and the new Core CLR. The 4.0.0-alpha1 release of the [core](https://www.nuget.org/packages/Autofac) library and [integration](https://www.nuget.org/packages/Autofac.Dnx) for ASP.NET 5.0 are now available on NuGet. The packages can be used with Visual Studio 2015 CTP 6 and the 1.0.0-beta3 release of ASP.NET 5.0.

## Autofac

The primary objective in 4.0 was to add support for Core CLR and the new dependency injection (DI) abstraction in DNX (more on this later). At this point in time the API of the Autofac library has not been changed from the 3.5.2 release. Adding support for the Core CLR without introducing breaking changes was made easier by the fact that we had previously migrated to a PCL. The constraints on the available .NET Framework surface area imposed by the chosen PCL targets meant that we didn't use lots of dependencies that are now only available in the full CLR.

In this release we support the `aspnet50`, `aspnetcore50` and `portable-net45+win+wpa81+wp80+MonoAndroid10+Xamarin.iOS10+MonoTouch10` targets. The former two are new in DNX and the latter is the existing PCL profile 259. The PCL target is not currently strong named because no such support is currently available. There is [work underway](https://github.com/aspnet/DNX/issues/963) to make these targets strong named using a key provided by Microsoft. I suspect that the team at Microsoft had hoped to remove strong naming altogether but this proved to be too greater challenge when compatibility scenarios were taken into account. If support for providing our own key is not added the 4.0 release will likely have a new public key for the PCL target. It's also yet to be determined what impact this will have on our strategy of only changing the strong name when breaking changes are made in the API.

The existing integration pacakges on NuGet are all capped as requiring an Autofac version less than 4.0 so the lack of strong naming will not be a problem for those. This version restriction was intentionally imposed as we wanted to leave the option of introducing breaking changes without having existing integrations attempt to upgrade to 4.0. There are some challenging enhancements on the backlog so the introduction of breaking changes in the API between now and the final 4.0 release is a possibility. Don't worry, we aren't talking about anything drastic.

## Autofac.Dnx

This is a new package and you can think of it as the ASP.NET integration for the moment. The DI support in previous versions of ASP.NET differed across individual frameworks such as MVC, Web API and SignalR. Each framework exposed a different DI abstraction and as a result we had to create different integrations for each. These frameworks were released at different times and were created by different teams, but the end result was a bit of mess when it came to DI support.

MVC didn't have support for per-request lifetime scopes so this had to be implemented in the integration. Web API did support them but decided to cache all filters making implementing per-request lifetime scoping of filters a real juggling act. SignalR simply had no mechansim for per-request scoping at all. Then when OWIN came along there was all sorts of trickery involved in making a lifetime scope flow from the OWIN pipeline into MVC or Web API.

That is all in the past, and there is now a single ASP.NET integration that will make the dependencies registered with Autofac available across the [entire web stack](http://blogs.msdn.com/b/webdev/archive/2014/06/17/dependency-injection-in-asp-net-vnext.aspx). This is a welcome addition and the new abstraction has consistent support for per-request lifetime scoping. The API has already been changed post beta-3 to clean up a few rough edges and will hopefully be fairly solid before release.

The name DNX may sound a little strange at the moment but the KRE was recently renamed to [DNX](https://github.com/aspnet/DNX) (.NET Execution Environment). DNX is the runtime hosting infrastructure and the DI abstraction layer is one of the many services that it provides. While ASP.NET is a consumer of this service there is nothing limiting the DI support to only web applications hosted within DNX. This is the reason the package is called `Autofac.Dnx` and not `Autofac.AspNet`. Autofac is being wired up as the DI container implementation for DNX and not specifically for ASP.NET web applications.

The name change by Microsoft was made after beta3 but we decided to adopt the DNX name now to prevent the need for a rename later. I doubt very much that the ASP.NET team feel like going through another renaming exercise, so chances are this will remain the package name.

You may have noticed there is already a `Microsoft.Framework.DependencyInjection.Autofac` package on the ASP.NET vNext MyGet feed. That package is only temporary and was used by the team to start testing their DI abstraction. It's not Microsoft attempting to take over the implementation and maintenance of the different DI containers. That particular package is built against Autofac 3.3.0 and does not support the Core CLR. The 4.0.0-alpha1 packages we have released today will run on Core CLR.

## Getting started

The easiest way to get started with the new bits is to install Visual Studio 2015 CTP 6. Once that is done create a new ASP.NET Web Application using the provided template and select ASP.NET 5 Preview Web API. In this example we are going to wire up Autofac to a Web API controller. Now that MVC and Web API have been unified the same process can be used when building a view based controller.

First, in the `project.json` add dependencies for `Autofac` and `Autofac.Dnx`.

```
"dependencies": {
	"Microsoft.AspNet.Server.IIS": "1.0.0-beta3",
	"Microsoft.AspNet.Mvc": "6.0.0-beta3",
	"Microsoft.AspNet.StaticFiles": "1.0.0-beta3",
	"Microsoft.AspNet.Server.WebListener": "1.0.0-beta3",
	"Autofac": "4.0.0-alpha1",
	"Autofac.Dnx": "4.0.0-alpha1"
},
```

The default template for a Web API exposes the familiar `ValuesController`. We're going to add an `IValuesService` interface that will become a dependency of this controller, and an `ILogger` interface that will in turn be a dependency of the values service.

The `ILogger` interface.

```
public interface ILogger
{
	void Log(string message, params object[] arguments);
}
```

The `IValuesService` interface.

```
public interface IValuesService
{
    IEnumerable<string> FindAll();

    string Find(int id);
}
```

A simple `Logger` implementation.

```
public class Logger : ILogger
{
	public void Log(string message, params object[] arguments)
	{
		Debug.WriteLine(message, arguments);
	}
}
```

And a simple `ValuesService` implementation.

```
public class ValuesService : IValuesService
{
    readonly ILogger _logger;

    public ValuesService(ILogger logger)
    {
        _logger = logger;
    }

    public IEnumerable<string> FindAll()
    {
        _logger.Log("FindAll called");

        return new[] {"value1", "value2"};
    }

    public string Find(int id)
    {
        _logger.Log("Find called with {0}", id);

        return string.Format("value{0}", id);
    }
}
```

We will encapsulate our dependencies in an Autofac module.

```
public class AutofacModule : Module
{
	protected override void Load(ContainerBuilder builder)
	{
		builder.Register(c => new Logger())
			.As<ILogger>()
			.InstancePerLifetimeScope();

		builder.Register(c => new ValuesService(c.Resolve<ILogger>()))
			.As<IValuesService>()
			.InstancePerLifetimeScope();
	}
}
```

Update the `ValuesController` such that it takes a dependency on the `IValuesService` and uses it to return a value from the two `Get` methods.

```
[Route("api/[controller]")]
public class ValuesController : Controller
{
	readonly IValuesService _valuesService;

	public ValuesController(IValuesService valuesService)
	{
		_valuesService = valuesService;
	}

	// GET: api/values
	[HttpGet]
	public IEnumerable<string> Get()
	{
		return _valuesService.FindAll();
	}

	// GET api/values/5
	[HttpGet("{id}")]
	public string Get(int id)
	{
		return _valuesService.Find(id);
	}

	// POST api/values
	[HttpPost]
	public void Post([FromBody]string value)
	{
	}

	// PUT api/values/5
	[HttpPut("{id}")]
	public void Put(int id, [FromBody]string value)
	{
	}

	// DELETE api/values/5
	[HttpDelete("{id}")]
	public void Delete(int id)
	{
	}
}
```

Finally, in the `Startup.cs` we need to wire up the container. Change the signature of the `ConfigureServices` method to return `IServiceProvider` and add the container initialization code.

```
public IServiceProvider ConfigureServices(IServiceCollection services)
{
	// We add MVC here instead of in ConfigureServices.
	services.AddMvc();

	// Create the Autofac container builder.
	var builder = new ContainerBuilder();

	// Add any Autofac modules or registrations.
	builder.RegisterModule(new AutofacModule());

	// Populate the services.
	builder.Populate(services);

	// Build the container.
	var container = builder.Build();

	// Resolve and return the service provider.
	return container.Resolve<IServiceProvider>();
}
```

You can also configure the container in the `Configure` method by calling `UseServices` on the `IApplicationBuilder` parameter. When taking this approach the call to `AddMvc()` must be moved from the `ConfigureServices` method into the `UseServices` lambda. Failing to do this will result in an exception at runtime. The `ConfigureServices` method seems like a more logical place to configure the container.

```
app.UseServices(services =>
{
	// We add MVC here instead of in ConfigureServices.
	services.AddMvc();

	// Create the Autofac container builder.
	var builder = new ContainerBuilder();

	// Add any Autofac modules or registrations.
	builder.RegisterModule(new AutofacModule());

	// Populate the services into the container.
	builder.Populate(services);

	// Build the container.
	var container = builder.Build();

	// Resolve and return the service provider.
	return container.Resolve<IServiceProvider>();
});
```

There is no need to call `RegisterControllers` as was the case with old MVC and Web API integrations. When MVC creates the controller it will ask Autofac for the dependencies. I suspect this means you will not have control over constructor selection which would be possible if Autofac was directly responsible for creating the controller. That's not a common scenario so it probably doesn't really matter.

Now when you run the application you should see the simple home page. Navigating to `/api/Values` will invoke the `Get()` method on the controller, and navigating to `/api/Values/{id}` will invoke the `Get(int id)` method. Set a breakpoint in the constructor of the controller to confirm the dependency is indeed being injected. You should also see the logger messages in your Output window.

The [sample](https://github.com/autofac/Autofac/tree/master/samples/AutofacWebApiSample) above is available on GitHub if you want to see the entire project. We intend to create some more complete and interesting samples in the future.

_Note: The sample above has been updated to support DNX beta4 and Visual Studio 2015 RC._

## Finally

Please start checking out the new packages and raising any issues you find on [GitHub](https://github.com/autofac/Autofac/issues). This is our alpha built against their beta so there are going to be some issues. We intend to keep up with the in-progress DNX work so future releases shouldn't be too far behind Microsoft. Keeping totally up-to-date with the latest DNX is difficult because the tooling in Visual Studio is on a slower release cycle and we expect that the majority of users will be using it to build their applications.

We also want to give thanks to Daniel Roth, David Fowler, Eilon Lipton, Kanchan Mehrotra and others in the ASP.NET team for their help in reaching this milestone. They have been reaching out to OSS library authors in the community and offering their support with the migration to DNX which is something to be commended.
