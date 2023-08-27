---
title: View Page Injection in Autofac ASP.NET MVC 3 Integration
description: ASP.NET MVC 3 provides support for dependency injection on view pages via Autofac, a registration source which allows you to create an adapter that will dynamically provide a registration for a service. Your view pages must inherit from a custom base class and you need to add a registration source called ViewRegistrationSource in the application start event. This allows properties on the view page to be injected by the container.
pubDatetime: 2010-12-28
tags: [autofac, mvc]
---

The increased support for dependency injection in ASP.NET MVC 3 includes the ability to have your view pages created by your favourite container.

> Historically, these classes have not had access to dependency injection/service location functionality, because their creation was buried deep inside the implementation of the view engine. In MVC 3, we have updated the built-in view engines to attempt to create the view page classes via the service locator; if that fails, it will fall back to using Activator.CreateInstance, just like in previous versions of MVC.

Because the view pages are dynamically compiled at runtime a few restrictions have been imposed; you cannot use constructor injection and your view pages must inherit from a custom base class.

> The problem is that your .aspx/.ascx/.cshtml/.vbhtml files are converted into classes at runtime by the ASP.NET Build Manager (in collaboration with build providers). When those classes are auto generated, they are auto generated only with a single parameterless constructor.
>
> We looked at auto-generating constructors, but it turns out that we don't actually know enough about the base class when we're generating the code to actually do any reflection on it, so it's not really possible for us to look at the base class and determine which constructors it may or may not have.

Happy that these limitations are not going to pose any serious problems let’s move onto the Autofac integration. Time for yet another uninspiring example, but one that should be easy to follow and doesn’t require too much typing on my part. Imagine that we have a service that provides common company information such as a copyright that we need to display on all our view pages.

```csharp
public interface ICompanyInformation
{
    string Copyright { get; }
}
```

There is of course an implementation of the service that returns the dynamic copyright information (you were warned about the example).

```csharp
public class CompanyInformation : ICompanyInformation
{
    public string Copyright
    {
        get { return string.Format("Copywrong &copy; {0} ACME Corporation", DateTime.Now.Year); }
    }
}
```

In the application start event we build our container and register the service along with our controllers. We also add a registration source called `ViewRegistrationSource`.

```csharp
ContainerBuilder builder = new ContainerBuilder();
builder.Register(c => new CompanyInformation()).As<ICompanyInformation>().InstancePerHttpRequest();
builder.RegisterControllers(Assembly.GetExecutingAssembly());
builder.RegisterSource(new ViewRegistrationSource());

IContainer container = builder.Build();
DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
```

The [registration source](http://nblumhardt.com/2010/01/declarative-context-adapters-autofac2/) is where all the magic happens. A registration source allows you to create an adapter that will dynamically provide a registration for a service. We know that MVC will ask the container for an instance of the view page before it attempts to create it itself, so we can use the registration source to make sure that the container always knows how to provide such an instance. Below is the implementation of the registration source for those that are interested in the details.

```csharp
public class ViewRegistrationSource : IRegistrationSource
{
    public IEnumerable<IComponentRegistration> RegistrationsFor(Service service, Func<Service, IEnumerable<IComponentRegistration>> registrationAccessor)
    {
        var typedService = service as IServiceWithType;

        if (typedService != null && IsSupportedView(typedService.ServiceType))
            yield return RegistrationBuilder.ForType(typedService.ServiceType)
                .PropertiesAutowired()
                .InstancePerHttpRequest()
                .CreateRegistration();
    }

    public bool IsAdapterForIndividualComponents
    {
        get { return false; }
    }

    static bool IsSupportedView(Type serviceType)
    {
        return serviceType.IsAssignableTo<WebViewPage>()
            || serviceType.IsAssignableTo<ViewPage>()
            || serviceType.IsAssignableTo<ViewMasterPage>()
            || serviceType.IsAssignableTo<ViewUserControl>();
    }
}
```

If the requested service inherits from one of the supported view base classes, the `RegistrationBuilder.ForType` helper is used to build the registration. The registration also makes sure that property injection is performed and that the lifetime is scoped to the HTTP request. The Razor view base class `WebViewPage` is supported, along with the WebForms base classes `ViewPage`, `ViewMasterPage` and `ViewUserControl`.

To get properties on the view page that can be injected by the container, you need to slot your own base class into the inheritance hierarchy. This is as simple as creating an abstract class that derives from `WebViewPage` or `WebViewPage<T>` when using the Razor view engine.

```csharp
public abstract class CustomViewPage : WebViewPage
{
    public ICompanyInformation CompanyInformation { get; set; }
}
```

If you are using the WebForms view engine in your MVC project you would derive from the `ViewPage` or `ViewPage<T>` class instead.

```csharp
public abstract class CustomViewPage : ViewPage
{
    public ICompanyInformation CompanyInformation { get; set; }
}
```

The last thing you need to do is ensure that your actual view page inherits from your custom base class. This can be achieved using the `@inherits` directive inside your `.cshtml` file for the Razor view engine.

```html
@inherits Example.Views.Shared.CustomViewPage @{ ViewBag.Title = "Home Page"; }

<h2>@ViewBag.Message</h2>
<p>This is the page content.</p>
<p>@CompanyInformation.Copyright</p>
```

When using the WebForms view engine you set the `Inherits` attribute on the `@ Page` directive inside you `.aspx` file instead.

```html
<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master"
Inherits="Example.Views.Shared.CustomViewPage"%>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server">
  Home Page
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
  <h2><%: ViewBag.Message %></h2>
  <p>This is the page content.</p>
  <p><%= CompanyInformation.Copyright %></p>
</asp:Content>
```

Making your custom base class inherit from the generic `WebViewPage<T>` or `ViewPage<T>` class allows you to provide your strongly typed model as the generic type parameter. You can of course choose to leave the generic type parameter in your base class open making it more reusable.

```csharp
public abstract class CustomViewPage<T> : WebViewPage<T>
{
    public ICompanyInformation CompanyInformation { get; set; }
}
```

You simply provide the model type as the closing generic parameter in the type declared in the `@inherits` or `Inherits` attribute of the page.

```html
@inherits Example.Views.Shared.CustomViewPage<Example.Models.CustomModel
></Example.Models.CustomModel>
```

Taking advantage of view page injection is a very simple matter. No doubt you will have much more creative uses for this than the simplified example shown here.
