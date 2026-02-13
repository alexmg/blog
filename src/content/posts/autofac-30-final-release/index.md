---
title: Autofac 3.0 Final Release
description: Autofac 3.0 is the final release, with the biggest changes being an official SignalR integration and plenty more documentation on the wiki. The NuGet packages and download zips are now available, along with a list of bug fixes, core and extra NuGet packages.
date: 2013-01-30
tags: [autofac]
---

The NuGet [packages](https://nuget.org/profiles/alexmg) and download [zips](http://code.google.com/p/autofac/downloads/list) are now available for the final release of Autofac 3.0. The biggest changes since Beta 2 are the introduction of an official [SignalR integration](https://nuget.org/packages/Autofac.SignalR) (built against the RC1 version) and plenty more documentation on the [wiki](http://code.google.com/p/autofac/wiki/) (with even more on the way). The release notes below outline the changes between Beta 2 and the final release. You find details for the previous beta versions on the [release notes](http://code.google.com/p/autofac/wiki/ReleaseNotes) page. Thank you to everyone who tested the beta versions and provided the team with valuable feedback. A big shout out to [Travis Illig](http://www.paraesthesia.com/) for helping make 3.0 such a great release, and to [Nicholas Blumhardt](http://nblumhardt.com/) for starting such an awesome open source project.

## Changes

- Added [SignalR Integration](https://nuget.org/packages/Autofac.SignalR).
- Updated Newtonsoft.Json package to the latest.
- Added the inner exception message to `DependencyResolutionException` message for easier troubleshooting.

## Bug Fixes

- [Issue 310](http://code.google.com/p/autofac/issues/detail?id=310): Resolve fails on MEF export of type `object`
- [Issue 352](http://code.google.com/p/autofac/issues/detail?id=352): Security exception in Silverlight 5
- [Issue 394](http://code.google.com/p/autofac/issues/detail?id=394): `ContainerBuilder.RegisterAssemblyType` depends on assembly list order
- [Issue 326](http://code.google.com/p/autofac/issues/detail?id=326): If MEF contract type has generics, MEF integration fails
- [Issue 343](http://code.google.com/p/autofac/issues/detail?id=343): Include inner exception message in outer exception message when wrapping exceptions from constructors

## Core NuGet Packages

- [Autofac](https://nuget.org/packages/Autofac)
- [Autofac ASP.NET MVC 4 Integration](https://nuget.org/packages/Autofac.Mvc4)
- [Autofac ASP.NET Web API Integration](https://nuget.org/packages/Autofac.WebApi)
- [Autofac ASP.NET SignalR Integration](https://nuget.org/packages/Autofac.SignalR)
- [Autofac MEF Integration](http://nuget.org/packages/Autofac.Mef)
- [Autofac WCF Integration](https://nuget.org/packages/Autofac.Wcf)
- [Autofac WebForms Integration](https://nuget.org/packages/Autofac.Web)

## Extras NuGet Packages

- [NHibernate Support](https://nuget.org/packages/Autofac.Extras.NHibernate)
- [Microsoft Common Service Locator Implementation](https://nuget.org/packages/Autofac.Extras.CommonServiceLocator)
- [Domain Service Factory for RIA Services](https://nuget.org/packages/Autofac.Extras.DomainServices)
- [Castle Dynamic Proxy Support](https://nuget.org/packages/Autofac.Extras.DynamicProxy2)
- [Enterprise Library Configuration Support](https://nuget.org/packages/Autofac.Extras.EnterpriseLibraryConfigurator)
- [Moq Mocking Support](https://nuget.org/packages/Autofac.Extras.Moq)
- [Multitenant Application Support](https://nuget.org/packages/Autofac.Extras.Multitenant)
- [Aggregate Service Support](https://nuget.org/packages/Autofac.Extras.AggregateService)
- [Metadata Attribute Support](https://nuget.org/packages/Autofac.Extras.Attributed)
