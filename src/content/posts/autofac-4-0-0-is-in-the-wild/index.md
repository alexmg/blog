---
title: Autofac 4.0.0 is in the wild
description: Autofac 4.0.0 is the latest version of Autofac and supports .NET Standard 1.1 which includes .NET Core, .NET Framework 4.5, Mono/Xamarin Platforms, Universal Windows Platform 10, Windows 8, and Windows Phone 8.1. It also supports Microsoft's DI abstraction which allows Autofac to integrate with other frameworks such as ASP.NET Core. Issues should be raised in the relevant GitHub repository.
date: 2016-08-10
tags: [autofac, net-core, asp-net]
---

## The bleeding edge

As Travis mentioned in his earlier [blog post](http://www.paraesthesia.com/archive/2016/06/29/netcore-rtm-where-is-autofac/) the road to 4.0.0 has certainly been an interesting one. This is largely in part because we got on the .NET Core train back in the early DNX days, and as a result experienced all the renames and breaking changes that come with using early bits of a new technology. It certainly highlighted to me just how much I had been taking for granted to the excellent tooling support that Visual Studio provides. There were a few points in time when the Visual Studio tooling would align with a public beta or RC version of .NET Core, but that wasn't useful to us because we had already moved on to working with the next release which was no longer compatible with that tooling. The tooling team was always playing catch up with what had already been finished and fixing things that had been broken. On the plus side I ended becoming more familiar with the new .NET Core command line tools and Visual Studio Code which is a great code editor that you can definitely be productive in.

## Enhancements

Obviously the biggest thing that is new in 4.0.0 is support for .NET Core and the new DI abstraction. This and splitting all the integrations out into [separate repositories](https://github.com/autofac) took up more of our time than we would have liked, but there were also a number of other useful changes made along the way:

- The `PreserveExistingDefaults` option now works correctly across lifetime scopes when registrations are added during the creation of a child lifetime scope.
- Support for UWP (Universal Windows Platform).
- The ability to provide an `IPropertySelector` to choose which properties should be property injected.
- More type and component registration descriptions to exception messages for easier debugging.
- `AsImplementedInterfaces` now includes the actual interface being registered preventing the need to call `AsSelf` as well.
- Performance improvements in a number of core components.
- A backwards-compatibility polyfill for the `Serializable` attribute so that .NET 4.5.1 consumers can serialize `DependencyResolutionException` across `AppDomain` etc. as was possible prior to migrating to PCL.
- Details are provided on the specific registration that fails when a tagged lifetime scope can't be found.
- A `DependencyResolutionException` is thrown if an `InstancePerLifetimeScope` service attempts to create an instance of itself during its construction.
- Added assembly scanning overloads of `AsClosedTypesOf` that accepts a `serviceKey` or `serviceKeyMapping` for keyed registrations.

## Supported .NET platforms

Something that was in our favour during the migration to .NET Core, was that we had already migrated Autofac to a PCL (Portable Class Library) in an earlier version. A definite problem with PCLs is that you end up with a limited API surface area to work with because only the lowest common denominator between all the supported target frameworks is available to work with. Having to work with this reduced set of APIs in the PCL actually meant that we tended not to be relying on things that didn't make it across to .NET Core, which has a reduced API surface area due to its goal of being cross-platform.

Now we can enjoy the benefit of automatic support for new .NET platforms thanks to the introduction of the [.NET Standard Library](https://docs.microsoft.com/en-us/dotnet/articles/standard/library). Gone are the days of having to recompile your library and redeploy your package just because a new .NET platform (that you are technically already compatible with) becomes available. With a PCL you need to add this new target to your library which means you are now using a different profile and therefore needed to recompile and redeploy even when no code changes are necessary. The .NET Standard Library approach is a big win for library developers, and after the initial pain of migration is endured, the rewards will become apparent in the future. Trying to figure out exactly what all this .NET Standard Library business was in the early days was challenging. I have to give a thank you to [Oren Novotny](https://oren.codes/) who helped guide us through the maze of targets, frameworks, platforms, libraries, runtimes and standards.

Autofac now targets .NET Standard 1.1 which represents the following platform support:

- .NET Core 1.0
- .NET Framework 4.5
- Mono/Xamarin Platforms
- Universal Windows Platform 10
- Windows 8
- Windows Phone 8.1

Silverlight support has been dropped in 4.0.0. If you need support for Silverlight the 3.5.2 release will continue to serve you well.

## The DI abstraction for .NET

Microsoft has introduced a DI abstraction for .NET in the form of the `Microsoft.Extensions.DependencyInjection.Abstractions` package. This is accompanied by a default container implementing the abstraction which can be found in the `Microsoft.Extensions.DependencyInjection` package. There is also a set of unit tests in the `Microsoft.Extensions.DependencyInjection.Specification.Tests` package that represent a specification that containers must meet to create a compliant adaptor implementation.

The abstraction is based around the [`IServiceProvider`](https://msdn.microsoft.com/en-us/library/system.iserviceprovider%28v=vs.110%29.aspx?f=255&MSPPError=-2147217396) interface which has actually been present since .NET Framework 1.1. It contains a single method called `GetService` that accepts a `Type` parameter and returns an `object`. Due to the obvious issues with checking for `null` and casting return values, a number of [extensions methods](https://github.com/aspnet/DependencyInjection/blob/master/src/Microsoft.Extensions.DependencyInjection.Abstractions/ServiceProviderServiceExtensions.cs) ship with the abstractions package to make working with the `IServiceProvider` interface easier for those on the consuming side of the API (a framework using the new abstraction for DI support).

There is also a new interface called `ISupportRequiredService` that is similar to `IServiceProvider` but will throw an exception if the requested service cannot be found. Implementation of this interface is not mandatory for an adaptor implementation but its absence or presence should be transparent to consumer. This interface is available in the Autofac integration.

You will most likely first use these new DI packages when building ASP.NET Core applications but expect to start seeing them used in other places. There is nothing in the abstraction or default container that couples them with ASP.NET. For example, [Microsoft Orleans](http://dotnet.github.io/orleans/) has already [used](https://github.com/dotnet/orleans/blob/06cf12e6b867008436304ae97be4db730c0a4076/src/OrleansRuntime/Startup/ConfigureServicesBuilder.cs) the DI abstraction to allow Grain instances to be resolved from a DI container. They don't currently use the default container implementation as a fallback but certainly could if they wanted to. The idea that as someone building a framework, I can utilise this existing abstraction and without additional effort gain support for any container that already implements an adaptor, is something that will just seem too good to refuse.

## The conforming container issue

There has been a lot of discussion around the new DI abstraction being a [conforming container](http://blog.ploeh.dk/2014/05/19/conforming-container/) and the many drawbacks that come along with such an approach. I have already expressed my concerns (such as in this [mega thread](https://github.com/aspnet/DependencyInjection/pull/416)) about how ASP.NET and its use of the default container are defining how the adaptor implementations have to behave and won't bother to rehash all that here. Instead, I will concentrate on the fact that the .NET team are taking the feedback on board and have already started to address some of the issues for the 1.1 release of `Microsoft.Extensions.DependencyInjection`. A number of DI container authors are being included in these discussions and I'm seeing a much more positive and collaborative tone from everyone. In the context of my earlier point about this abstraction gaining more broader usage it's important that this continues.

## DI in ASP.NET Core

There is basic dependency injection available in ASP.NET out-of-the-box that uses the default container implementation mentioned earlier. When you need more advanced DI capabilities you can plug-in your favourite container (which should of course be Autofac) in place of the default. When you do that you can continue to use the `IServiceCollection` based registration API or switch to that of the replacement container.

To take advantage of some of the advanced features available in the replacement container you may need to use its registration API to make your intentions understood. Having these two paths for service registration isn't something that sits particularly well with me but obviously the default container needed to provide some kind of registration API for when it is being used. I would think of the `IServiceCollection` as the registration API of the default container and something that you can continue to use with other containers up to a point. If you intend to use another container right from the start you should probably just stick with its registration API to avoid having different methods of registration present in your application.

The framework also needed a mechanism for registering its own services and allowing them to be passed into a different container for registration with that. In past versions of MVC and Web API the framework didn't use a container internally like it does now. When you used the `DependencyResolver` interface to wire in a container it was basically just a [Service Locator](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/) that acted as an alternative source of services. When a service was provided it was used, and when one wasn't a default singleton style service that was already created was used, or a new instance was created on the spot as required. Now ASP.NET uses a container internally throughout the entire framework and only a single container by default\*. That is why when you replace the default container the framework has to register its own services with the replacement container. This is something that the adaptor implementations have to do as part of their building process. The Autofac adaptor implementation has a `Populate` extension method on the `ContainerBuilder` that accepts the `IServiceCollection` provided to you by the framework in your `ConfigureServices` method.

\*_It is possible to use a second container alongside the default container using hooks provided for services that represent a [Composition Root](http://blog.ploeh.dk/2011/07/28/CompositionRoot/) but this isn't something that just works out-of-the-box or with standard adaptor implementations._

To get started with Autofac as your container in ASP.NET Core I would have a read of the ASP.NET Core integration [documentation](http://docs.autofac.org/en/latest/integration/aspnetcore.html) and then grab the [sample application](https://github.com/autofac/Autofac/tree/master/samples/AutofacWebApiSample) and test it out. The sample application will probably be moved to the [Examples repository](https://github.com/autofac/Examples) and fleshed out with more scenarios in the not too distant future, so if you don't find it at the first link this is where it will be. Because the adaptor does all the heavy lifting, once this is in place all the [documentation](https://docs.asp.net/en/latest/fundamentals/dependency-injection.html) about DI support in ASP.NET Core is consistent regardless of what container you are using.

## Coming soon

We will be upgrading the many integrations to the 4.0.0 release over the coming days, so if you are using those keep an eye on NuGet for the updated packages. We have most of those already sitting on pre-release version of 4.0.0 so switching to the final release shouldn't take too long.

Now that all the .NET Core migration is out of the way I would like to take a look at improving the decorator support in Autofac, particularly the application of multiple decorators to open generic registrations. If you have any thoughts on how you would like to see this work or what the API might look like please stop by our [Gitter room](https://gitter.im/autofac/Autofac) for a chat. In fact if you have suggestions about any area of improve please do get in touch.

We have a large number of integrations and repositories now, so please raise any issues you find with the latest releases in the issue tracker for the relevant repository on [GitHub](https://github.com/autofac) and we will do our best to get them sorted out (PRs are always welcome).
