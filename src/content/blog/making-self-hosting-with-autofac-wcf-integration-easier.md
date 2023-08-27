---
title: Making Self-Hosting with Autofac WCF Integration easier
description: This article explains how to use the Autofac WCF integration to make self-hosting WCF services easier. It provides code to extend ServiceHost with a new method called AddDependencyInjectionBehavior which takes an IContainer instance as an argument. This makes the code more concise and eliminates the need to write a separate helper method.
pubDatetime: 2010-05-16
tags: [autofac, web-services]
---

Thinking about the [sample](http://alexmg.com/post/2010/05/07/Self-Hosting-WCF-Services-with-the-Autofac-WCF-Integration.aspx) I recently posted for shelf-hosting WCF Services with the [Autofac WCF Integration](http://code.google.com/p/autofac/wiki/WcfIntegration), I decided that the boilerplate code for configuring the Service Behavior could be moved into an extension method on the `ServiceHost` instead. I have checked in some code that will extend `ServiceHostBase` with a new method called `AddDependencyInjectionBehavior`. There are two overloads of the method, one that takes a generic argument for the service contract type, and another that allows you to provide a `Type` for the service contract in case you are configuring your WCF Services in some sort of latebound manner. Both overloads of the method require an `IContainer` instance.

```csharp
host.AddDependencyInjectionBehavior<IEchoService>(container);
host.AddDependencyInjectionBehavior(typeof(IEchoService), container);
```

As you can see from the updated sample below, the extension method makes the code considerably more concise, and will save you from having to write your own helper method that can be reused with your different WCF Services.

```csharp
ContainerBuilder builder = new ContainerBuilder();
builder.Register(c => new Logger()).As<ILogger>();
builder.Register(c => new EchoService(c.Resolve<ILogger>())).As<IEchoService>();

using (IContainer container = builder.Build())
{
    Uri address = new Uri("http://localhost:8080/EchoService");
    ServiceHost host = new ServiceHost(typeof(EchoService), address);

    host.AddServiceEndpoint(typeof(IEchoService), new BasicHttpBinding(), string.Empty);

    host.AddDependencyInjectionBehavior<IEchoService>(container);

    host.Description.Behaviors.Add(new ServiceMetadataBehavior {HttpGetEnabled = true, HttpGetUrl = address});
    host.Open();

    Console.WriteLine("The host has been opened.");
    Console.ReadLine();

    host.Close();
    Environment.Exit(0);
}
```

The extension method will be available in the next release of Autofac. If you want to try it out without grabbing the latest Autofac source, the code below should give you a feel for how it works. You do not need to provide the service implementation type to the extension method because it can be retrieved from the `ServiceHost` instance. The `Type` instance that you provide in the `ServiceHost` constructor surfaces as the `ServiceHost.Description.ServiceType` property and can be used directly in the extension method.

```csharp
public static class ServiceHostExtensions
{
    public static void AddDependencyInjectionBehavior<T>(this ServiceHostBase serviceHost, IContainer container)
    {
        AddDependencyInjectionBehavior(serviceHost, typeof(T), container);
    }

    public static void AddDependencyInjectionBehavior(this ServiceHostBase serviceHost, Type contractType, IContainer container)
    {
        IComponentRegistration registration;
        if (!container.ComponentRegistry.TryGetRegistration(new TypedService(contractType), out registration))
        {
            string message = string.Format("The service contract type '{0}' has not been registered in the container.", contractType.FullName);
            throw new ArgumentException(message);
        }

        AutofacDependencyInjectionServiceBehavior behavior = new AutofacDependencyInjectionServiceBehavior(
            container, serviceHost.Description.ServiceType, registration);
        serviceHost.Description.Behaviors.Add(behavior);
    }
}
```

Nothing fancy here but that should make self-hosting a little easier.
