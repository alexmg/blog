---
title: Model Binder Injection in Autofac ASP.NET MVC 3 Integration
description: Autofac ASP.NET MVC 3 integration supports model binder injection with an improved dependency injection support offered by the IModelBinderProvider interface. Model binders can be registered with the RegisterModelBinders extension method and the AutofacModelBinderProvider is used to determine which model binder should be used for a particular type. This dynamic approach removes the need for a special wrapper around each IModelBinder component.
date: 2010-12-07
tags: []
---

The Autofac MVC integration supported model binder injection in the MVC 2 version, but improvements in the dependency injection support offered by MVC 3 has allowed the implementation to be made cleaner. ASP.NET MVC 3 introduces the `IModelBinderProvider` interface that allows the implementer to determine what model binder should be used for a particular type.

> Developers who implement this interface can optionally return an implementation of IModelBinder for a given type (they should return null if they cannot create a binder for the given type).

Let’s start by looking at how the model binder injection is configured in the MVC integration. You first create a class that implements `IModelBinder` like you would when creating any other model binder in MVC. Next you apply the `ModelBinderType` attribute provided as part of the integration to indicate what types the model binder supports binding. The simple example below declares that the model binder supports binding for string types.

```csharp
[ModelBinderType(typeof(string))]
public class StringBinder : IModelBinder
{
    public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
    {
        // Do implementation here.
    }
}
```

You then use the `RegisterModelBinders` extension method on the `ContainerBuilder` to register all the `IModelBinder` types that are present in one or more assemblies.

```csharp
ContainerBuilder builder = new ContainerBuilder();
builder.RegisterModelBinders(Assembly.GetExecutingAssembly());
```

The interesting part about the implementation of the assembly scanning is that it finds the types the model binder supports through the `ModelBinderType` attributes and then adds this information as [metadata](http://code.google.com/p/autofac/wiki/Metadata) to the registration.

```csharp
public static IRegistrationBuilder<object, ScanningActivatorData, DynamicRegistrationStyle>
    RegisterModelBinders(this ContainerBuilder builder, params Assembly[] modelBinderAssemblies)
{
    return builder.RegisterAssemblyTypes(modelBinderAssemblies)
        .Where(type => typeof(IModelBinder).IsAssignableFrom(type))
        .As<IModelBinder>()
        .InstancePerHttpRequest()
        .WithMetadata(AutofacModelBinderProvider.MetadataKey, type =>
            (from ModelBinderTypeAttribute attribute in type.GetCustomAttributes(typeof(ModelBinderTypeAttribute), true)
             from targetType in attribute.TargetTypes
            select targetType).ToList());
}
```

You must also remember to register the `AutofacModelBinderProvider` using the `RegisterModelBinderProvider` extension method. This is Autofac's implementation of the new `IModelBinderProvider` interface.

```csharp
builder.RegisterModelBinderProvider();
```

The constructor of the `AutofacModelBinderProvider` requests that an `IEnumerable<Meta<Lazy<IModelBinder>>>` be provided. When the `GetBinder` method is called through the `IModelBinderProvider` interface, the list of `Meta<T>` about the components is queried to locate any potential matches based on the types stored in the metadata. The `Lazy<T>` part of dependency makes sure that we do not actually create an instance of the `IModelBinder` until it is actually needed.

```csharp
public IModelBinder GetBinder(Type modelType)
{
    Meta<Lazy<IModelBinder>> modelBinder = _modelBinders
        .FirstOrDefault(binder => ((List<Type>)binder.Metadata[MetadataKey]).Contains(modelType));
    return (modelBinder != null) ? modelBinder.Value.Value : null;
}
```

This dynamic approach to handling model binder injection removes the need for a special wrapper around each `IModelBinder` component, and avoids having to register this wrapper directly into the static `ModelBinders.Binders` dictionary.
