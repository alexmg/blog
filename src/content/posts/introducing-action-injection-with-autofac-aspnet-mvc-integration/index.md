---
title: Introducing Action Injection with Autofac ASP.NET MVC Integration
description: Autofac ASP.NET MVC Integration has introduced a new approach to dependency injection called Action Injection, which allows dependencies to be injected into action methods instead of the controller's constructor. This makes it easier to provide mock implementations for unit testing and reduces the number of mocks required.
date: 2010-05-16
tags: [autofac, mvc]
---

There are currently two main approaches to performing dependency injection, [Constructor Injection and Setter Injection](http://www.martinfowler.com/articles/injection.html#FormsOfDependencyInjection). The more popular of the two approaches is Constructor Injection. The dependencies that a type has are made obvious because they must be supplied in order to construct an instance. This also makes it easier for you to ensure that a newly instantiated object is in a valid state. When working with a type the constructor is usually the first thing that you come into contact with.

With Setter Injection, also known as Property Injection, it is much more difficult to tell what the dependencies are when looking at the type from the outside. Setter Injection is most useful when you have no control over the instantiation of the type that requires the dependencies to be injected. This is a common scenario for ASP.NET WebForms where the activation of a `Page` instance is performed by the runtime. You do not have an opportunity to take over the activation process, and the first chance you have to perform dependency injection is when you are provided with an existing instance of `Page`. In this case you have no choice but to inject the dependencies into the type via its properties.

[ASP.NET MVC](http://www.asp.net/mvc) has many extensibility points and is very flexible. It provides you with the opportunity to take over the creation of your `Controller` instances by creating your own factory that implements `IControllerFactory`, or more commonly by deriving from the `DefaultControllerFactory` and overriding the `GetControllerInstance` method. This makes it possible for your controllers to take advantage of Constructor Injection, and is exactly what the [Autofac ASP.NET MVC Integration](http://code.google.com/p/autofac/wiki/MvcIntegration) does. When it comes to unit testing your controller classes, it becomes very easy to see what dependencies it has, and to provide mock implementations for those dependencies.

An issue that is often raised in regards to Constructor Injection is what some people like to call Constructor Bloat. This may indicate that you are not following the [Single Responsibility Principle](http://en.wikipedia.org/wiki/Single_responsibility_principle) and that some refactoring may be in order. The number of constructor parameters that would be considered too many would no doubt vary depending on who you ask. In the case of ASP.NET MVC controllers the number of constructor dependencies is more likely to be higher than for other classes. The level of responsibility for a controller is usual greater than what you would expect for an ordinary internal component. This is the result of mapping an external view of the application (URL based) onto an internal representation (controller based).

It turns out that both [Nicholas Blumhardt](http://nblumhardt.com/) and I found ourselves shifting some of these dependencies out of the controller’s constructor and into the action methods that actually require them. We were both fairly surprised to find out that the other had independently been doing exactly the same thing, and at this point discussed if there was something wrong with the approach because it seemed that no one else was doing it. Surely all good ideas have already been done so this one must be bad. I personally feel that having dependencies injected into your action method should not feel like a foreign concept because that is exactly what MVC is already doing for you with your existing parameters.

For lack of any official term that I am aware of, Action Injection is what I am calling this particular approach to dependency injection in ASP.NET MVC. The more I play around with this approach the more I like it. Your constructor is provided the dependencies that are shared by all actions in your controller, and each individual action can request any additional dependencies that it needs. Now when writing unit tests for your actions there is no need to provide mock implementations for dependencies that your action will not be interacting with. The end result is less mocks in your unit tests and a clear indication of the action’s actual dependencies.

Nick and I have decided to test out the idea of Action Injection in the Autofac ASP.NET MVC Integration. The changes are only in the source code at the moment and have not yet been included in a release. I mentioned earlier that MVC is very extensible and the process for invoking your action methods is no different. It is possible to replace the default behaviour by creating your own `IActionInvoker`. The easiest way to do this is by deriving from the `AsyncControllerActionInvoker` class and overriding the appropriate methods. A controller can be requested to use your custom action invoker by assigning an instance to the controller's `ActionInvoker` property. The current source includes a registration extension that allows you to register an `IActionInvoker` instance that will be assigned to a controller as it is activated. There is a default `IActionInvoker` implementation called `ExtensibleActionInvoker` that allows dependencies to be injected into your action methods. It can also do Setter Injection on your filters but that is a topic for another post. As the name suggests, you can extend this class and add any additional behaviour that you require. Registering controllers in the `HttpApplication` start would look something like this.

```csharp
ContainerBuilder builder = new ContainerBuilder();

builder.RegisterType<ExtensibleActionInvoker>()
    .As<IActionInvoker>()
    .WithParameter("injectActionMethodParameters", true);
builder.RegisterControllers(Assembly.GetExecutingAssembly())
    .InjectActionInvoker();

// Register other services.

IContainer container = builder.Build();
_containerProvider = new ContainerProvider(container);

ControllerBuilder.Current.SetControllerFactory(new AutofacControllerFactory(_containerProvider));
```

I will not go into further detail on the implementation at this point because it may be tweaked a little before being released. Instead, let us look at an example of how we could make our action dependencies clearer using Action Injection. The `NotifyController` class below has action methods that send the current user a message using different delivery methods.

```csharp
public class NotifyController
{
    public NotifyController(ILogger logger,
        IEmailNotifier emailNotifier,
        ISmsNotifier smsNotifier,
        IMessengerNotifier messengerNotifier)
    {
        // Implementation.
    }

    public ActionResult Email(string message)
    {
        // Implementation.
    }

    public ActionResult Sms(string message)
    {
        // Implementation.
    }

    public ActionResult Messenger(string message)
    {
        // Implementation.
    }
}
```

There are three action methods on this controller and four dependencies that must be provided through the constructor. To unit test any of the action methods all four of the dependencies will need to be mocked. In this controller the `ILogger` instance is required by all action methods, but the remaining notifier dependencies are each required only by one action method. The controller could be refactored so that it takes the one `ILogger` dependency through its constructor, and each action could take its particular notifier dependency through a method parameter. Here is an example of how the refactored code would look.

```csharp
public class NotifyController
{
    public NotifyController(ILogger logger)
    {
        // Implementation.
    }

    public ActionResult Email(string message, IEmailNotifier emailNotifier)
    {
        // Implementation.
    }

    public ActionResult Sms(string message, ISmsNotifier smsNotifier)
    {
        // Implementation.
    }

    public ActionResult Messenger(string message, IMessengerNotifier messengerNotifier)
    {
        // Implementation.
    }
}
```

Now when testing the action methods we only ever need to provide two mock services. There is no need to provide additional mock services that will never be used. Assuming we only had one unit test per action and setup our mocks inside each unit test, we would have halved the number of mocks required, taking the total from twelve down to six. That certainly seems like an improvement to me.

I would be interested to know what you think about this idea. Is it totally crazy or could there be something to it? Maybe you too have already been doing this and could share how it has been working out for you.
