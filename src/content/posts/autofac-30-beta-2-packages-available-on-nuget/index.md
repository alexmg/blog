---
title: Autofac 3.0 Beta 2 packages available on NuGet
description: Autofac 3.0 Beta 2 is now available on NuGet and includes a number of enhancements and bug fixes, such as the addition of AutoActivate() registration extension, better integration with MVC 4 and Web API filters, and various other improvements and updates to dependencies.
date: 2012-12-22
tags: [autofac]
---

Since releasing the first Beta we have been busy working through the [issue list](http://code.google.com/p/autofac/issues/list) and have included a number of enhancements and bug fixes in [Beta 2](https://nuget.org/packages/Autofac). We are hoping this will be the last Beta before the final release, and will be putting a hold on changes in the meantime to the keep the codebase stable. It would be great to make the release available early in the new year, so please grab the latest packages and let us know if you have any problems.

## Changes

- Added `AutoActivate()` registration extension to flag components to be automatically resolved on container build.
- Added an `InterceptTransparentProxy` registration extension that allows transparent proxy instances to be intercepted using `ProxyGenerator.CreateInterfaceProxyWithTargetInterface`.
- Added `AutofacInstanceContext.Current` static method akin to the MVC `AutofacDependencyResolver.Current`. Made `OperationLifetime` publicly gettable to allow for `AutofacInstanceContext.Current.OperationLifetime` access.
- Added a `RegisterTypes` extension equivalent to `RegisterAssemblyTypes` but which allows you to pass in a specific list of types rather than simply scanning assemblies.
- Removed the now confusing (Beta) suffix from the MVC 4 and Web API integration NuGet package titles.
- The same registration can now be used to register a MVC and Web API filter. Multiple filter types on a single registration are also supported.
- Updated all dependencies to the latest versions.
- Switched Autofac.Extras.CommonServiceLocator to a portable class library.

## Bug Fixes

- [Issue 303](http://code.google.com/p/autofac/issues/detail?id=303): `AutofacDomainServiceFactory` creates instances in the root container.
- [Issue 305](http://code.google.com/p/autofac/issues/detail?id=305): Add `RegisterAssemblyTypes` overload which gets a list of types.
- [Issue 365](http://code.google.com/p/autofac/issues/detail?id=365): Configured Nested Containers Lose `LimitType` on Component Registrations - Affects WCF Service Resolution.
- [Issue 391](http://code.google.com/p/autofac/issues/detail?id=391): Cannot use `ActionFilterFor` for both MVC and Web API controllers on the same registration.
- [Issue 396](http://code.google.com/p/autofac/issues/detail?id=396): `ExtensibleActionInvoker` incorrectly holds attachment to expired lifetime scope in MVC4.
- [Issue 339](http://code.google.com/p/autofac/issues/detail?id=339): Improve the way Autofac.Integration.Wcf exposes the `LifetimeScope`.
- [Issue 351](http://code.google.com/p/autofac/issues/detail?id=351): Autofac.Integration.Mvc fails when Glimpse.Mvc3 is installed.
- [Issue 355](http://code.google.com/p/autofac/issues/detail?id=355): AutofacContrib.[DynamicProxy2](http://code.google.com/p/autofac/wiki/DynamicProxy2): Internal interfaces are not intercepted (and no exception).
- [Issue 361](http://code.google.com/p/autofac/issues/detail?id=361): DynamicProxy interception does not work for WCF clients.
- [Issue 397](http://code.google.com/p/autofac/issues/detail?id=397): Nested lifetime scopes aren't disposed when the parent is disposed.
- [Issue 388](http://code.google.com/p/autofac/issues/detail?id=388): Wrapper around `IStartable` to make a component implicitly activated.

## Core NuGet Packages

- [Autofac](https://nuget.org/packages/Autofac)
- [Autofac MEF Integration](http://nuget.org/packages/Autofac.Mef)
- [Autofac ASP.NET MVC4 Integration](https://nuget.org/packages/Autofac.Mvc4)
- [Autofac WCF Integration](https://nuget.org/packages/Autofac.Wcf)
- [Autofac WebForms Integration](https://nuget.org/packages/Autofac.Web)
- [Autofac ASP.NET Web API Integration](https://nuget.org/packages/Autofac.WebApi)

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
