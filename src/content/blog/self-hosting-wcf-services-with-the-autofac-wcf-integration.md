---
title: Self-Hosting WCF Services with the Autofac WCF Integration
description: This post provides a demonstration of how to use Autofac's WCF Integration to self-host a web service with a dependency that is injected through the WCF extensibility points. An example and instructions on how to create a client proxy are provided.
pubDatetime: 2010-05-07
tags: [autofac, web-services]
---

A question came up recently in the Autofac group about how to use the WCF Integration when self-hosting WCF Services. This post provides a quick demonstration of how to handle the self-hosting scenario and should be enough to get you started. The example is a rather unimaginative web service that echoes back a message.

First declare the interface and implementation for a logger that the WCF Service will take as a dependency in its constructor. This is a simple logger that will log the message sent to the WCF Service out to the console.

```csharp
public interface ILogger
{
    void Write(string message);
}

public class Logger : ILogger
{
    public void Write(string message)
    {
        Console.WriteLine(message);
    }
}
```

Next you need to define the contract and implementation for the WCF Service. Nothing interesting here other than our dependency being requested through the constructor of the WCF Service implementation.

```csharp
[ServiceContract]
public interface IEchoService
{
    [OperationContract]
    string Echo(string message);
}

public class EchoService : IEchoService
{
    private readonly ILogger _logger;

    public EchoService(ILogger logger)
    {
        _logger = logger;
    }

    public string Echo(string message)
    {
        _logger.Write(message);
        return message;
    }
}
```

Now we can create a Console Application that will configure the container and host our WCF Service.

```csharp
ContainerBuilder builder = new ContainerBuilder();
builder.Register(c => new Logger()).As<ILogger>();
builder.Register(c => new EchoService(c.Resolve<ILogger>())).As<IEchoService>();

using (IContainer container = builder.Build())
{
    Uri address = new Uri("http://localhost:8080/EchoService");
    ServiceHost host = new ServiceHost(typeof(EchoService), address);
    host.AddServiceEndpoint(typeof(IEchoService), new BasicHttpBinding(), string.Empty);

    IComponentRegistration registration;
    if (!container.ComponentRegistry.TryGetRegistration(new TypedService(typeof(IEchoService)), out registration))
    {
        Console.WriteLine("The service contract has not been registered in the container.");
        Console.ReadLine();
        Environment.Exit(-1);
    }

    host.Description.Behaviors.Add(new AutofacDependencyInjectionServiceBehavior(container, typeof(EchoService), registration));
    host.Description.Behaviors.Add(new ServiceMetadataBehavior {HttpGetEnabled = true, HttpGetUrl = address});
    host.Open();

    Console.WriteLine("The host has been opened.");
    Console.ReadLine();

    host.Close();
    Environment.Exit(0);
}
```

Here we have added an `IServiceBehavior` called `AutofacDependencyInjectionServiceBehavior` that will add a custom `IInstanceProvider` to the `DispatchRuntime` of each endpoint’s `EndpointDispatcher`. That is a bit of a mouth full but basically means that Autofac will use the WCF extensibility points to provide WCF Service instances that have their dependencies injected.

In this example the WCF Service is exposed on an endpoint that uses the `BasicHttpBinding` but you can use any type of endpoint that you like. I have added a `ServiceMetadataBehavior` in this example that exposes the WSDL for the WCF Service at `http://localhost:8080/EchoService?wsdl`. You can use this address to create a client proxy and send test messages that are hopefully more creative than my example.
