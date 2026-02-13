---
title: Introduction to the HttpClient
description: The HttpClient class simplifies interaction with REST web services by providing constructors, a Send method, extension methods, and methods to receive content, use headers, and send requests asynchronously.
date: 2009-04-07
tags: [httpclient, rest, web-services]
---

## Introduction

The [WCF REST Starter Kit Preview 2](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24644) includes a set of classes designed to simplify interaction with REST web services. The communications are performed using the `HttpClient` class with the help of other types from the `Microsoft.Http` namespace. These types can be found in the `Microsoft.Http.dll` assembly located in the `Assemblies` folder of the starter kit.

## Creating a HttpClient

There are three constructors to choose from. There is a default constructor and two others that allow you to set the base address of the web service you will be working with. The base address can be expressed as a `String` or `Uri` value.

```csharp
HttpClient client1 = new HttpClient();
HttpClient client2 = new HttpClient("http://www.foo.com/");
HttpClient client3 = new HttpClient(new Uri("http://www.foo.com/"));
```

## Sending a Message

The `Send` method of the `HttpClient` is used to begin a synchronous request. There are also extension methods available to help you configure your request for the different HTTP methods. We will cover those later as they actually use the `Send` method under the hood.

```csharp
HttpClient client = new HttpClient("http://www.foo.com/");
HttpResponseMessage response = client.Send(HttpMethod.GET.ToString(), "RestService");
```

The `Send` method returns a `HttpResponseMessage` instance. You can use
the response to check the response status code and retrieve any returned
content. If you pass a URI into the `Send` method it will be added as a
relative address to the base address.

## Validating the Response

There are extension methods defined in the `HttpMessageExtensions` class that assist you in checking the returned status code. The HTTP status codes are defined in the `HttpStatusCode` enumeration in the `System.Net` namespace, which is part of the framework and not the starter kit.

When using the `EnsureStatusIsSuccessful` extension method an `ArgumentOutOfRangeException` is thrown if the status code is not `HttpStatusCode.OK`.

```csharp
try
{
    HttpClient client = new HttpClient("http://www.foo.com/");
    HttpResponseMessage response = client.Send(HttpMethod.GET, "RestService");
    response.EnsureStatusIsSuccessful();
}
catch (ArgumentOutOfRangeException exception)
{
    Console.WriteLine(exception);
}
```

You can also use the `EnsureStatusIs` method to check for specific status codes. You must provide at least one status code to check. If the check fails an `ArgumentOutOfRangeException` is thrown just the same as for the `EnsureStatusIsSuccessful` method.

```csharp
HttpClient client = new HttpClient("http://www.foo.com/");
HttpResponseMessage response = client.Send(HttpMethod.GET, "RestService");
response.EnsureStatusIs(HttpStatusCode.PartialContent, HttpStatusCode.UnsupportedMediaType);
```

## Send Extension Methods

As mentioned earlier, a number of extensions methods are defined in the `HttpMethodExtensions` class that help you configure your request with the appropriate HTTP method. There are extension methods for the GET, POST, PUT, DELETE and HEAD methods. The extension methods all end up calling the `Send` method of the `HttpClient` being extended with the appropriate `HttpMethod` value to indicate the HTTP method to use.

```csharp
HttpClient client = new HttpClient("http://www.foo.com/");
HttpResponseMessage postResponse = client.Post("RestService", HttpContent.CreateEmpty());
HttpResponseMessage putResponse = client.Put("RestService", HttpContent.CreateEmpty());
HttpResponseMessage deleteResponse = client.Delete("RestService");
HttpResponseMessage headResponse = client.Head("RestService");
```

The `Post` and `Put` methods require you to provide the content that is to be sent to the server. Providing a `null` value for the `HttpContent` parameter will result in an `ArgumentNullException` being thrown.

## Sending Content

The `Send` method of the `HttpClient` class, along with the `Post` and `Put` extension methods, except a `HttpContent` instance to represent the content that should be sent to the web service. You create a new instance of the `HttpContent` class using its static `Create` method. An empty `HttpContent` instance can also be created using the static
`CreateEmpty` method. The `Create` method can be provided a wide range of parameters including string values, streams, byte arrays and `ICreateHttpContent` instances.

```csharp
HttpClient client = new HttpClient("http://www.foo.com/");

HttpContent stringContent = HttpContent.Create("Foo");
HttpResponseMessage response = client.Post("RestService", stringContent);

byte[] bytes = Encoding.UTF8.GetBytes("Foo");
HttpContent byteContent = HttpContent.Create(bytes);
response = client.Post("RestService", byteContent);

using (MemoryStream memoryStream = new MemoryStream(bytes))
{
    HttpContent streamContent = HttpContent.Create(memoryStream);
    response = client.Post("RestService", streamContent);
}
```

The `HttpMultipartMimeForm` and `HttpUrlEcodedForm` classes are examples of classes that implement the `ICreateHttpContent` interface. These are helper classes that build up the `HttpContent` instances in more advanced scenarios.

## Receiving Content

The content for a response is accessible via the `Content` property of the `HttpResponseMessage`. Like the content sent in the request, the property is of type `HttpContent`. The `HttpContent` class contains some helper methods for retrieving the data it contains. These include `ReadAsByteArray`, `ReadAsStream` and `ReadAsString`. They return the content in the format that their names suggest.

```csharp
HttpClient client = new HttpClient("http://www.foo.com/");
HttpResponseMessage response = client.Get("RestService");

byte[] byteArrayContent = response.Content.ReadAsByteArray();
Stream streamContent = response.Content.ReadAsStream();
string stringContent = response.Content.ReadAsString();
```

## Using Headers

HTTP headers play an important role in REST web services. The `RequestHeaders` class represents the headers that are sent in the request, and the `ResponseHeaders` class represents the headers returned in the response. Both of these classes derive from the `HttpHeaders` class. This base class acts like a dictionary for the headers and
exposes properties to access the most common header values.

The static `Parse` method on the `RequestHeaders` class can take a string of headers and extract the values. It assumes that the headers appear on separate lines.

```csharp
const string headers = "Content-Type: text/xml\r\nReferer: http://www.referer.com";
RequestHeaders requestHeaders = RequestHeaders.Parse(headers);
```

You can also use the properties to set the header values individually, and in a more strongly-typed manner.

```csharp
RequestHeaders requestHeaders = new RequestHeaders
{
    ContentType = "text/xml", Referer = new Uri("http://www.referer.com")
};
```

The response headers are accessed via the `Headers` property of the `HttpResponseMessage` instance returned from the `Send` method of the `HttpClient`, or from one of the extension methods found in the `HttpMethodExtensions` class.

```csharp
HttpClient client = new HttpClient("http://www.foo.com/");
HttpResponseMessage response = client.Get("RestService");
Console.WriteLine(response.Headers.ContentType);
```

## Sending Asynchronously

There are two ways of sending a request asynchronously via the `HttpClient`. The first is to call the `BeginSend` method and provide an `AsyncCallback` delegate. The second is to call the `SendAsync` method and subscribe to the `SendCompleted` event. You must prepare a `HttpRequestMessage` instance to provide to both of these methods as they do not provide the same overloads as the `Send` method.

The `BeginSend` method uses the typical `IAsyncResult` [pattern](http://msdn.microsoft.com/en-us/library/ms228975.aspx). This allows you to continue with other work and have the callback delegate invoked, or wait for the result using a wait handle or through polling. The example below continues execution leaving the `AsyncCallback` delegate to be invoked when the request has completed. The `EndSend` method on `HttpClient` is called with the `IAsyncResult` provided to the callback to get access to the response message.

```csharp
HttpClient client = new HttpClient("http://www.foo.com/");
HttpRequestMessage request = new HttpRequestMessage(HttpMethod.GET.ToString(), "RestService");
AsyncCallback callback = asyncResult =>
     {
         HttpResponseMessage response = client.EndSend(asyncResult);
         Console.WriteLine(response.StatusCode);
     };
client.BeginSend(request, callback, null);
```

The `SendAsync` method allows you to send requests asynchronously and be informed when a request has completed via the `SendCompleted` event. The event argument is of type `SendCompletedEventArgs` and exposes `Request` and `Response` properties. As expected, these properties provide access to the original `HttpRequestMessage`, and the returned
`HttpResponseMessage`. There is also a `UserState` property, which is actually defined on the base `SendCompletedEventArgs`, that can be used to return an object that was passed into the `SendAsync` method. The user state can be used as a key of sorts to match up returning responses with the requests that initiated them.

```csharp
HttpClient client = new HttpClient("http://www.foo.com/");
HttpRequestMessage request = new HttpRequestMessage(HttpMethod.GET.ToString(), "RestService");
client.SendCompleted += (s, e) => Console.WriteLine(e.UserState);
const string userState = "foo";
client.SendAsync(request, userState);
```

## Summary

The `HttpClient` provides a simple and clean API for working with REST web services. It removes a great deal of the complexity that is inherent with working so close to the HTTP stack. All the HTTP methods are supported, including the common GET, POST, PUT and DELETE methods. Building content for your requests and extracting content from responses has been greatly simplified. The common HTTP headers for the request andresponse can be accessed through a strongly-typed interface. You can check the status of responses without having to worry about remembering the numeric HTTP status codes. There are two different patterns available for performing asynchronous requests.
