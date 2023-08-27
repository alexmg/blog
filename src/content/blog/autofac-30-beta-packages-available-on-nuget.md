---
title: Autofac 3.0 Beta packages available on NuGet
description: Autofac 3.0 Beta packages are now available on NuGet, and feature a Portable Class Library that supports multiple frameworks such as .NET Framework 4, Silverlight 5, .NET for Windows Store apps, and Windows Phone 8. It includes XML configuration options, metadata support, an improved registration extension, and bug fixes and enhancements.
pubDatetime: 2012-11-01
tags: [autofac]
---

Those of you that follow the [Autofac Google Group](https://groups.google.com/forum/?fromgroups=#!forum/autofac) will no doubt be aware that despite some [changes](https://groups.google.com/forum/?fromgroups=#!topic/autofac/_23kI_91VaE) in project leadership plenty of work has been going into the 3.0 release. With the amount of refactoring that has been done we wanted to make a Beta release available for wider testing before declaring 3.0 stable. I want to take this opportunity to give a big shout out to my partner in crime, [Travis Illig](http://www.paraesthesia.com/), who has been in there smashing through the issues with me.

## Portable Class Library

The major task that has been undertaken in 3.0 is converting the core Autofac project into a PCL ([Portable Class Library](http://msdn.microsoft.com/en-us/library/gg597391.aspx)) allowing the one assembly to be used in multiple framework targets. You will be able to target the following frameworks with Autofac 3.0:

- .NET Framework 4 and higher
- Silverlight 5
- .NET for Windows Store apps
- Windows Phone 8

Windows Phone 7 and Silverlight 4 are not in the list of supported frameworks because they are missing many of the features that Autofac requires (such as a complete implementation of variance in generics). Those frameworks will continue to be supported using the existing 2.6 release. We wanted to make sure that we could cover as broad a base as possible without resorting to having multiple projects or preprocessor directives.

There was a point where we went down the plugin route, having platform specific assemblies that would be plugged into the core PCL at runtime, but found this to be problematic from a security perspective with issues arising in medium-trust scenarios. In the end we got everything that we wanted in the core PCL working by reducing the supported frameworks and the result is a much simpler solution to maintain.

The NuGet package for Autofac 3.0 uses the support for portable libraries added in [NuGet 2.1](http://docs.nuget.org/docs/release-notes/nuget-2.1) so remember to update your package manager.

## Single Solution (Core and Extras)

In the past we had two separate solutions for the core Autofac projects and those for Autofac.Contrib. It was easy for these two solutions to get out of sync so we decided to move everything into a single solution keeping everything consistent and visible. Part of the move was to rebrand the contrib projects into “Extras” packages that are now deployed via NuGet just the same as the core packages. The division between the core and extras packages relates to whether or not the package takes a dependency on a third party library or offers fairly niche functionality.

These are the Core NuGet packages:

- [Autofac](https://nuget.org/packages/Autofac)
- [Autofac MEF Integration](http://nuget.org/packages/Autofac.Mef)
- [Autofac ASP.NET MVC4 Integration](https://nuget.org/packages/Autofac.Mvc4)
- [Autofac WCF Integration](https://nuget.org/packages/Autofac.Wcf)
- [Autofac WebForms Integration](https://nuget.org/packages/Autofac.Web)
- [Autofac ASP.NET Web API Integration](https://nuget.org/packages/Autofac.WebApi)

We did a little bit of clean up but the majority of the contrib projects have been moved across to Extras NuGet packages:

- [NHibernate Support](https://nuget.org/packages/Autofac.Extras.NHibernate)
- [Microsoft Common Service Locator Implementation](https://nuget.org/packages/Autofac.Extras.CommonServiceLocator)
- [Domain Service Factory for RIA Services](https://nuget.org/packages/Autofac.Extras.DomainServices)
- [Castle Dynamic Proxy Support](https://nuget.org/packages/Autofac.Extras.DynamicProxy2)
- [Enterprise Library Configuration Support](https://nuget.org/packages/Autofac.Extras.EnterpriseLibraryConfigurator)
- [Moq Mocking Support](https://nuget.org/packages/Autofac.Extras.Moq)
- [Multitenant Application Support](https://nuget.org/packages/Autofac.Extras.Multitenant)
- [Aggregate Service Support](https://nuget.org/packages/Autofac.Extras.AggregateService)
- [Metadata Attribute Support](https://nuget.org/packages/Autofac.Extras.Attributed)

## Semantic Versioning

Starting with 3.0 we will be following the [Semantic Versioning](http://semver.org/) specification and will utilise prerelease NuGet packages. As such, the 3.0 beta release packages are versioned **3.0.0-beta**. Prerelease packages provide a great way to indicate the current stability of a package while still allowing for easy installation, and semantic versioning provides a means to quickly get a feel for the kind of changes that can be expected in a particular release.

## SymbolSource Support

We are now also building symbol packages that are uploaded to [SymbolSource.org](http://www.symbolsource.org/) allowing you to download and step through the Autofac source code. This support will be provided for all packages both core and extras. [Instructions](http://www.symbolsource.org/Public/Home/VisualStudio) for configuring Visual Studio to work with the symbol server are available on the SymbolSource website. Being able to step through the source makes it much easier to understand what is happening under the hood and makes you feel a lot more in control.

## Metadata Support

Interfaced based strongly-typed metadata was one particular feature that was difficult to port over to the PCL due to its dependency on MEF specific functionality, in particular the `AttributedModelServices` class, and indirectly through to the `System.Reflection.Emit` namespace. The PCL library does not have access to `System.ComponentModel.Composition` because it is not available in all of the target frameworks.

Recently, the MEF team released a lightweight version of MEF ([Microsoft.Composition](http://nuget.org/packages/microsoft.composition)) that also had to address the issue of not being able to generate types for metadata interfaces; they too are targeting Windows Store apps and lost access to the `System.Reflection.Emit` namespace. To remove the need to dynamically generate a type at runtime they switched the interface based metadata views with a class based implementation.

Autofac 3.0 has taken the same approach to strongly-typed metadata when only the PCL is being referenced. If you are running in a Windows Store or Windows Phone 8 app you will need to use class based metadata. Following the example from my [previous blog post](http://alexmg.com/post/2012/05/25/Selectively-resolving-services-at-runtime-with-Autofac.aspx) about selectively resolving services at runtime, the metadata interface would change from:

```csharp
public interface IExportMetadata
{
    ExportFormat Format { get; }
}
```

To a simple metadata class that has public properties with getters and
setters:

```csharp
public class ExportMetadata
{
    public ExportFormat Format { get; set; }
}
```

Registering the metadata remains exactly the same except you provide a class type as the generic type parameter for the `WithMetadata` method:

```csharp
builder.Register(c => new PdfFormat())
    .As<IExport>()
    .WithMetadata<ExportMetadata>(m =>
        m.For(em => em.Format, ExportFormat.Pdf));

builder.Register(c => new HtmlFormat())
    .As<IExport>()
    .WithMetadata<ExportMetadata>(m =>
        m.For(em => em.Format, ExportFormat.Html));

builder.Register(c => new RtfFormat())
    .As<IExport>()
    .WithMetadata<ExportMetadata>(m =>
        m.For(em => em.Format, ExportFormat.Rtf));
```

You can also continue to provide default values using the `DefaultValue` attribute:

```csharp
public class ExportMetadata
{
    [DefaultValue(ExportFormat.Html)]
    public ExportFormat Format { get; set; }
}
```

Another neat trick is the ability to pass the metadata dictionary into the constructor of your metadata class:

```csharp
public class ExportMetadataWithDictionary
{
    public ExportMetadataWithDictionary(IDictionary<string, object> metadata)
    {
        Format = (ExportFormat)metadata["Format"];
    }

    public ExportFormat Format { get; set; }
}
```

If you have access to `System.ComponentModel.Composition` it is still possible to use interfaces for your metadata and even resolve them using `Lazy<T, TMedata>`. This is achieved by adding a reference to the [Autofac.Mef](http://nuget.org/packages/Autofac.Mef) package and calling the `RegisterMetadataRegistrationSources` method on the container builder before registering the metadata against the interface type.

```csharp
builder.RegisterMetadataRegistrationSources();

builder.Register(c => new PdfFormat())
    .As<IExport>()
    .WithMetadata<IExportMetadata>(m =>
        m.For(em => em.Format, ExportFormat.Pdf));

builder.Register(c => new HtmlFormat())
    .As<IExport>()
    .WithMetadata<IExportMetadata>(m =>
        m.For(em => em.Format, ExportFormat.Html));

builder.Register(c => new RtfFormat())
    .As<IExport>()
    .WithMetadata<IExportMetadata>(m =>
        m.For(em => em.Format, ExportFormat.Rtf));
```

The final point to note is that you can use class based metadata and still resolve your types using `Lazy<T, TMetadata>` from `System.ComponentModel.Composition`. If you don’t add the
[Autofac.Mef](http://nuget.org/packages/Autofac.Mef) package and therefore don’t call the `RegisterMetadataRegistrationSources` method, but have referenced `System.ComponentModel.Composition`, the metadata registration source in the PCL will figure out that `Lazy<T, TMetadata>` is available and will use that with the class based metadata.

There is a lot of confusing detail above so to summarise the important points:

- Class based strongly-typed metadata is now available in all supported target frameworks.
- Interface based strongly-typed metadata remains available when `System.ComponentModel.Composition` can be referenced and the [Autofac.Mef](http://nuget.org/packages/Autofac.Mef) package is installed.
- `Lazy<T, TMetadata>` can be used with class based or interface based strongly-typed metadata.

## XML Configuration

Those that prefer to configure their registrations without code will be pleased to know that Autofac.Configuration has been given some serious attention. To import XML configuration from an arbitrary file you can use the `XmlFileReader` module. It uses the same XML schema as the regular configuration settings but doesn't require the additional elements such as `<configuration/>` that standard .NET configuration files require.

```csharp
var builder = new ContainerBuilder();
var module = new XmlFileReader("path/to/config.xml");
builder.RegisterModule(module);
var container = builder.Build();
```

The `XmlFileReader` and `ConfigurationSettingsReader` modules both derive from `ConfigurationModule`. You can control how configuration is loaded, and how that configuration is converted into registrations, through its two properties of type `SectionHandler` and `IConfigurationRegistrar`.

`SectionHandler` is the configuration section and now has a `Deserialize` method that accepts an `XmlReader`. This opens up the possibilities for how you store your configuration.

`ConfigurationRegistrar`, the default implementation of `IConfigurationRegistrar`, contains convenient virtual methods that allow you to control the parsing of the configuration section into registrations. The following methods can be overridden to customise the parsing behaviour:

- RegisterConfiguredComponents
- RegisterConfiguredModules
- RegisterReferencedFiles
- SetInjectProperties
- SetComponentOwnership
- SetLifetimeScope
- LoadType

It is possible to set the `IConfigurationRegistrar` property on the `XmlFileReader` and `ConfigurationSettingsReader` directly without having to create a custom `ConfigurationModule`.

## FindConstructorsWith

The `FindConstructorsWith` registration extension that took a `BindingFlags` parameter had to be refactor to take a `Func<Type, ConstructorInfo[]>`, because the `BindingFlags` type is not available in the PCL.

It is easy to update existing code where `BindingFlags` is available (such as .NET Framework 4.0) by passing a simple lambda to the method instead.

```csharp
var builder = new ContainerBuilder();
builder.RegisterType<HasPrivateConstructor>()
    .FindConstructorsWith(type => type.GetConstructors(BindingFlags.Instance | BindingFlags.NonPublic));
```

The function parameter also allows you to use the new reflection API found in WinRT to achieve the same result.

## Matching multiple lifetime scopes

It is now possible for a registration to indicate that is should be matched against multiple [named/tagged lifetimes scopes](http://code.google.com/p/autofac/wiki/InstanceScope#Per_Matching_Lifetime_Scope).

```csharp
var builder = new ContainerBuilder();

builder.Register(c => new object()).InstancePerMatchingLifetimeScope("A", 123);

var container = builder.Build();

using (var lifetimeScope = container.BeginLifetimeScope("A"))
{
    var instanceForA = lifetimeScope.Resolve<object>();
}

using (var lifetimeScope = container.BeginLifetimeScope(123))
{
    var instanceFor123 = lifetimeScope.Resolve<object>();
}
```

The `InstancePerMatchingLifetimeScope` method takes a `params` array of objects that will be matched against the tag provided to the lifetime scope when it was created.

## MVC 4 and Web API

The NuGet packages for [MVC 4](https://nuget.org/packages/Autofac.Mvc4) and [Web API](https://nuget.org/packages/Autofac.WebApi) have been updated to **3.0.0-beta** and are compiled against the [Autofac 3.0](https://nuget.org/packages/Autofac) beta package. You can read more about the features available in these integrations (including filters without attributes) in a [previous post](<http://alexmg.com/post/2012/09/01/New-features-in-the-Autofac-MVC-4-and-Web-API-(Beta)-Integrations.aspx>). These two NuGet packages have “(Beta)” in their titles but they are compiled against the RTW versions of MVC 4 and Web API. Looking at my package list I realise this is confusing and that has been fixed ready for the next push.

## Bug Fixes and Enhancements

Below is a list of bug fixes and enhancements available in Autofac 3.0:

- Issue [389](http://code.google.com/p/autofac/issues/detail?id=389): Exception thrown in AutofacFilterProvider when other filter instances registered in the container
- Issue [379](http://code.google.com/p/autofac/issues/detail?id=379): There is an errror when using Autofac.Integration.Mvc, Autofac.Integration.WebApi and Autofac.Integration.Web together
- Issue [376](http://code.google.com/p/autofac/issues/detail?id=376): Exception while trying to throw an exception in Metro app
- Issue [368](http://code.google.com/p/autofac/issues/detail?id=368): MVC ExtensibleActionInvoker.GetParameterValue Can't Be Disabled
- Issue [386](http://code.google.com/p/autofac/issues/detail?id=386): Support configuration reading from XML file that is not app.config
- Issue [271](http://code.google.com/p/autofac/issues/detail?id=271): Could not register more then one Module with the same type but with different parameters in XmlConfiguration
- Issue [378](http://code.google.com/p/autofac/issues/detail?id=378): Make Container.Empty immutable
- Issue [358](http://code.google.com/p/autofac/issues/detail?id=358): Portable build warnings in a Metro style app
- Issue [352](http://code.google.com/p/autofac/issues/detail?id=352): Provide Silverlight 5 Support
- Issue [287](http://code.google.com/p/autofac/issues/detail?id=287): Guidance for building AutofacContrib packages and moving to nuget
- Issue [252](http://code.google.com/p/autofac/issues/detail?id=252): Single solution for Autofac + AutofacContrib

## What’s next?

Hopefully we get lots of feedback on the PCL support and can quickly iron out any issues. Once that is done we can make a release version of 3.0 available. In the meantime we are going to concentrate on improving the documentation on the wiki and maybe even look at hosting a website with some “Getting Started” examples for the different types of supported applications. Finally, you can discuss all things Autofac in the [Google Group](https://groups.google.com/forum/?fromgroups#!forum/autofac) and raise issues in the [Issue Tracker](http://code.google.com/p/autofac/issues/list). Happy dependency injecting!
