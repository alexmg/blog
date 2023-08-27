---
title: Selectively resolving services at runtime with Autofac
description: This article explains how to selectively resolve a service at runtime with Autofac by making use of the IEnumerable<Lazy<IExport, IExportMetadata>> and Lazy<T, TMetadata> relationship types. It also provides an example of how to refactor the controller constructor to receive the list of exports and how to query the metadata to select the correct export service at runtime.
pubDatetime: 2012-05-24
tags: [autofac]
---

The question of how to selectively resolve a service at runtime was asked on the [Autofac Google Group](https://groups.google.com/forum/?fromgroups#!forum/autofac) recently, and since this is not the first time the question has been asked I thought it would be a good idea to write a post for future reference. There are a couple of ways of doing this but I am going to outline one that does not require you to take a dependency on the container (more specifically the component context).

Here is the example from the question. There is a simple `IExport` interface defined that is used to describe services that can export a document in a particular format.

```csharp
public interface IExport
{
    void Run(string content);
}
```

Then there are three different exports; one for PDF, HTML and RTF.

```csharp
public class PdfFormat : IExport
{
    public void Run(string content)
    {
        // export in PDF format
    }
}

public class HtmlFormat : IExport
{
    public void Run(string content)
    {
        // export in HTML format
    }
}

public class RtfFormat : IExport
{
    public void Run(string content)
    {
        // export in RTF format
    }
}
```

Finally, there is a controller that has an `IExport` constructor injected:

```csharp
public class HomeController : Controller
{
    readonly IExport _export;

    public HomeController(IExport export)
    {
        _export = export;
    }

    public void ExportDocument(string content)
    {
        _export.Run(content);
    }
}
```

The problem is that when `ExportDocument` is called we want to make sure that the correct export gets invoked based on a format selected by the user at runtime. To make this work some refactoring is required.

We are going to need something to key the services by and I find that an `enum` works well and does not introduce any magic strings:

```csharp
public enum ExportFormat
{
    Pdf,
    Html,
    Rtf
}
```

A simple interface that defines some metadata for the export services will also be required:

```csharp
public interface IExportMetadata
{
    ExportFormat Format { get; }
}
```

Now let’s jump into the container registration code and then break it down afterward:

```csharp
var builder = new ContainerBuilder();

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

builder.Register(c => new HomeController(
    c.Resolve<IEnumerable<Lazy<IExport, IExportMetadata>>>()));
```

The approach utilizes the `IEnumerable<T>` and `Lazy<T, TMetadata>` [relationship types](http://nblumhardt.com/2010/01/the-relationship-zoo/) supported in [Autofac](http://code.google.com/p/autofac/). These correspond to the enumeration and metadata interrogation with delayed instantiation relationship types. Each implementation type is registered with the container and associates [metadata](http://code.google.com/p/autofac/wiki/Metadata) with the registration using the `WithMetadata` method. This metadata will be used later to select the appropriate export service at runtime without having to instantiate the entire list of registered services.

Inspection of the registration for the `HomeController` shows that the constructor has been refactored to receive an `IEnumerable<Lazy<IExport, IExportMetadata>>` argument and that is the key to how the problem is solved. The container will automatically provide the controller with an enumerable list of `Lazy<IExport, IExportMetadata>`. It is the `Lazy<IExport, IExportMetadata>` that allows you to query the registered metadata for a service without actually instantiating an instance.

```csharp
public class HomeController : Controller
{
    readonly IEnumerable<Lazy<IExport, IExportMetadata>> _exports;

    public HomeController(IEnumerable<Lazy<IExport, IExportMetadata>> exports)
    {
        _exports = exports;
    }

    public void ExportDocument(string content, ExportFormat format)
    {
        var lazy = _exports.FirstOrDefault(e =>  e.Metadata.Format == format);

        if (lazy == null)
            throw new ArgumentException("Export format is not supported.", "format");

        var export = lazy.Value;
        if (export != null)
            export.Run(content);
    }
}
```

To support the selection of a particular export format the `ExportDocument` method on the controller is refactored to receive an `ExportFormat` as an additional parameter. This would be selected by the user at runtime and the metadata will be queried to find the registration that matches the provided format. When the correct service has been found the `Value` property on the `Lazy<IExport, IExportMetadata>` is accessed and the instance is resolved from the container. There is no need to actually create instances of all the export services in order to invoke the correct one thanks to various relationship types.

Notice that I am using `Lazy<T, TMetadata>` from the `System.ComponentModel.Composition` assembly that shipped with .NET 4.0. If you are using an earlier version of .NET you can achieve the same result by using `Meta<Lazy<IExport>, IExportMetadata>`. The `Meta<T, TMetadata>` type is defined in Autofac and you will be introducing a container specific dependency, but that is probably not a huge issue given the value it provides when you cannot upgrade to .NET 4.0. Obviously you would always try to use `Lazy<T, TMetadata>` whenever possible though.
