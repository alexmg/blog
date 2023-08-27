---
title: Autofac 3.0.2 update pushed to NuGet
description: On April 8th, 2013, we pushed Autofac 3.0.2 and some minor updates to the core Autofac package and a few of the integration packages to NuGet. These updates include a mix of enhancements and bug fixes across different packages such as SignalR Integration 3.0.1, Web API Integration 3.0.1 and Multitenant Support 3.0.2 and Castle DynamicProxy Integration 3.0.2.
pubDatetime: 2013-04-08
tags: [autofac]
---

We have pushed some minor updates to the core Autofac package and a few of the integration packages to NuGet. There is a mix of enhancements and bug fixes across the different packages. You can find all the details below.

## [Autofac 3.0.2](https://nuget.org/packages/Autofac)

### Changes

- Enabled XML documentation for all projects and added missing comments.
- Minor performance improvements in reflection based activation.

### Bug Fixes

- Resolved issue 414 : Made sure the result from `MetadataViewProvider` is captured in the closure created for the delegate registration instead of being created on each invocation.
- Resolved Issue 421 : Generic parameters constrained with complex generic types fail to resolve.

## [SignalR Integration 3.0.1](https://nuget.org/packages/Autofac.SignalR)

### Changes

- Added a `RegisterHubs` extension method for scanning based registration of hubs.
- Changed the Autofac.Integration.SignalR project to target .NET 4.0 instead of .NET 4.5.
- The `RegisterHubs` extension method now registers hubs as `ExternallyOwned`. There is no way to create a lifetime scope around hub invocations and we don't want the Disposer on the root lifetime scope holding onto instances.
- Removed the `IRegistrationSource` for the SignalR dependency resolver so that registrations are not automatically created for the default services. This is because of a bug in the SignalR message bus blocking indefinitely when Dispose is called twice (discovered in self-hosting scenario). It is still possible to manually add registrations to replace the default services.

## [Web API Integration 3.0.1](https://nuget.org/packages/Autofac.WebApi)

### Bug Fixes

- Resolved  Issue 418 : Multiple `IAutofacActionFilter` causes each filter to execute multiple times. Filter wrappers are now only added once per ControllerType, FilterScope and MethodInfo combination.

## [Multitenant Support 3.0.2](https://nuget.org/packages/Autofac.Extras.Multitenant)

### Bug Fixes

- Resolved Issue 409: Updated Castle references to 3.2.0.
- Resolved Issue 402: Added extension method for easy tenant ID retrieval.

## [Castle DynamicProxy Integration 3.0.2](https://nuget.org/packages/Autofac.Extras.DynamicProxy2)

### Bug Fixes

- Resolved [Issue 409](https://code.google.com/p/autofac/issues/detail?id=409): Updated Castle references to 3.2.0.
