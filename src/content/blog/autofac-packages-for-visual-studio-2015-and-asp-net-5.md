---
title: Autofac packages for Visual Studio 2015 release
description: Autofac packages for Visual Studio 2015 have been released, with versioning and naming changes to better align with DNX. Documentation is available on the Autofac website.
pubDatetime: 2015-07-21
tags: [autofac]
---

Now that we know the version of DNX that ended up shipping with the Visual Studio 2015 release we have pushed updated packages for Autofac core and ASP.NET 5 across to NuGet.

- [Autofac](https://www.nuget.org/packages/Autofac)
- [Autofac.Framework.DependencyInjection](https://www.nuget.org/packages/Autofac.Framework.DependencyInjection)

If you are playing around with the DNX nightly builds you can find matching Autofac builds on our MyGet feed.

https://www.myget.org/F/autofac/api/v2

## Versioning

We have changed the pre-release versioning strategy for 4.0 to align with the DNX version it is built against. For example, the 4.0.0-beta5-90 release targets DNX beta5, and the suffix is a CI build number that allows us to release fix versions for a particular beta.

This should make it easier to determine what version of Autofac will work with a given release of DNX. With the number of breaking changes we have been facing while moving through the nightly builds it seems reasonable for a pre-release strategy. Once there is a stable DNX version and an official release of Autofac 4.0 things will return to normal.

## Renaming

Before releasing the initial 4.0 packages we spoke with Microsoft about naming and `Autofac.Dnx` seemed like a reasonable choice at the time. Needless to say, not long after pushing to NuGet we received suggestion that `Autofac.Dnx` wasn’t the most appropriate name based on future intent. It turns out that `Microsoft.Framework.DependencyInjection` is to be a dependency injection abstraction not just for the DNX host but across the framework. That means having an implementation of the abstraction in a package that sounds DNX specific doesn't hit the mark.

There are abstractions for a number of cross-cutting concerns including logging, configuration and dependency injection. Coming up with a name for the implementations of these abstractions isn’t easy. A package name such as `Microsoft.Framework.DependencyInjection.Autofac` makes it seem like Microsoft is the owner of the package, and `Autofac.Microsoft.Framework.DependencyInjection` is just way too long. Instead, we have followed Serilog with the naming of its `Serilog.Framework.Logging` [package](http://nblumhardt.com/2015/05/diagnostic-logging-in-dnx-asp-net-5/) and went with `Autofac.Framework.DependencyInjection`. At least replacing Microsoft with the implementation name removes the owner ambiguity. We figure now that there are at least two of us using that naming convention it must be good. That said, I'm not going to make any promises about the name staying as it is.

## Getting started

There are no breaking changes in the exposed interface so the steps outlined in my previous [post](http://alexmg.com/autofac-4-0-alpha-1-for-asp-net-5-0-beta-3/) will work with beta5. The only difference is that you will need to use the `Autofac.Framework.DependencyInjection` package and namespace instead of `Autofac.Dnx`. We are going to start adding documentation about ASP.NET 5 to the [documentation](https://docs.autofac.org) site so keep your eye out for that.
