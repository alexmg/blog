---
title: Autofac ASP.NET MVC 4 (Beta) Integration
description: Autofac 2.6.1 has released a MVC 4 Beta integration, available for download via NuGet, with no breaking changes from the MVC 3 version. The minor change made in the internals allows the lifetime scope applied to a registration to be shared between MVC and the Web API. Users should report any bugs on the issue tracker or ask questions on Stack Overflow using the “autofac” tag.
pubDatetime: 2012-03-08
tags: [autofac]
---

Following the release of [Autofac 2.6.1](https://github.com/autofac/Autofac/releases/tag/v3.5.2), the Autofac MVC 4 Beta integration is now ready for [downloading via NuGet](https://nuget.org/packages/Autofac.Mvc4/). I will look into what additional features might be possible later, but the immediate priority was to make something available ensuring people could starting enjoying Autofac with MVC 4 Beta. This work is currently being done in a branch and will be merged back into the mainline once the final RTW of MVC 4 is made available.

[![Install-Package Autofac.Mvc4](/images/blog/Install-Package-Autofac.Mvc4.png "Install-Package Autofac.Mvc4")](https://nuget.org/packages/Autofac.Mvc4/2.6.1.841)

There are no breaking changes in the API between this and the MVC 3 version of the integration so the upgrade should be fairly painless. Detailed instructions for upgrading your actual MVC 3 project can be found in the MVC 4 [release notes](http://www.asp.net/whitepapers/mvc4-release-notes#_Toc303253806).

Please download the package and report any bugs on the [issue tracker](http://code.google.com/p/autofac/issues/list) or if you need help post your questions on [Stack Overflow](http://stackoverflow.com/questions/tagged/autofac) using the “autofac” tag. The current [MVC 3 documentation](http://code.google.com/p/autofac/wiki/Mvc3Integration) on the wiki still applies and can help you get up and running if your new to the integration.

A minor change was made in the internals to allow the lifetime scope applied to a registration to be shared between MVC and the Web API (which you have no doubt now deduced is on the way too).

```csharp
// Register MVC controller and API controller dependencies per request.
builder.Register(c => new Logger()).As<ILogger>()
    .InstancePerHttpRequest()
    .InstancePerApiRequest();
```

Technically both extension methods use the same tag for the nested lifetime scope so only one is really needed, but I like adding both because makes it obvious that the service will be scoped to the controller, regardless of it being of the MVC or Web API variety. I don’t think there is too much more to add other than to watch out for the Web API integration which will probably be available by the time you read this.
