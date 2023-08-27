---
title: Using REST in NAnt with a custom HTTP Task
description: This article describes how to make HTTP requests to a REST web service from a NAnt script using a custom task. The HttpClient class from the WCF REST Starter Kit is used, and the source code is available on GitHub. The assembly has been merged with the Microsoft.Http.dll dependency making deployment easier.
pubDatetime: 2009-06-18
tags: [httpclient, rest, tools, web-services]
---

I needed to make HTTP requests to a REST web service from a [NAnt](http://nant.sourceforge.net/) script today so I knocked up a custom task. The `HttpClient` class from the [WCF REST Starter Kit](http://msdn.microsoft.com/en-gb/netframework/cc950529.aspx) that I blogged about [previously](http://alexmg.com/post/2009/04/07/Introduction-to-the-HttpClient.aspx) came in handy to offload most of the heavy lifting, leaving me to worry about the task related implementation details. The task supports all the HTTP methods and allows you to specify the content type and the content itself. You can also retrieve the response content and status code through properties set by the task. This was all achieved with surprisingly little code.

```csharp
using System;
using System.Collections.Generic;
using System.Net;

using Microsoft.Http;

using NAnt.Core;
using NAnt.Core.Attributes;

namespace AlexMG.NAntTasks
{
    [TaskName("http")]
    public class HttpTask : Task
    {
        private static readonly List<HttpStatusCode> successCodes = new List<HttpStatusCode>
        {
            HttpStatusCode.OK,
            HttpStatusCode.Created,
            HttpStatusCode.Accepted,
            HttpStatusCode.NonAuthoritativeInformation,
            HttpStatusCode.NoContent,
            HttpStatusCode.ResetContent,
            HttpStatusCode.PartialContent
        };

        [TaskAttribute("url", Required = true)]
        [StringValidator(AllowEmpty = false)]
        public string Url { get; set; }

        [TaskAttribute("method", Required = false)]
        [StringValidator(AllowEmpty = true)]
        public string Method { get; set; }

        [TaskAttribute("content", Required = false)]
        [StringValidator(AllowEmpty = true)]
        public string Content { get; set; }

        [TaskAttribute("contenttype", Required = false)]
        [StringValidator(AllowEmpty = true)]
        public string ContentType { get; set; }

        [TaskAttribute("connectiontimeout", Required = false)]
        public int ConnectionTimeout { get; set; }

        [TaskAttribute("responseproperty", Required = false)]
        [StringValidator(AllowEmpty = true)]
        public string ResponseProperty { get; set; }

        [TaskAttribute("statuscodeproperty", Required = false)]
        [StringValidator(AllowEmpty = true)]
        public string StatusCodeProperty { get; set; }

        protected override void ExecuteTask()
        {
            HttpClient client = new HttpClient();
            HttpRequestMessage request = new HttpRequestMessage();

            if (!string.IsNullOrEmpty(Method))
            {
                request.Method = Method;
            }

            request.Uri = new Uri(Url);

            if (!string.IsNullOrEmpty(ContentType))
            {
                request.Headers.ContentType = ContentType;
            }

            if (!request.Method.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                request.Content = (string.IsNullOrEmpty(Content)) ? HttpContent.CreateEmpty() : HttpContent.Create(Content);
                request.Headers.ContentLength = request.Content.GetLength();
            }

            if (ConnectionTimeout != 0)
            {
                client.TransportSettings.ConnectionTimeout = TimeSpan.FromSeconds(ConnectionTimeout);
            }

            Project.Log(Level.Info, "Executing HTTP request.");
            Project.Log(Level.Info, "Url: {0}", request.Uri);
            Project.Log(Level.Info, "Method: {0}", request.Method);
            Project.Log(Level.Info, "Content Type: {0}", request.Headers.ContentType);
            Project.Log(Level.Info, "Connection Timeout: {0}", client.TransportSettings.ConnectionTimeout);

            try
            {
                HttpResponseMessage response = client.Send(request);

                if (FailOnError)
                {
                    response.EnsureStatusIsSuccessful();
                }

                if (!string.IsNullOrEmpty(StatusCodeProperty))
                {
                    Project.Properties[StatusCodeProperty] = response.StatusCode.ToString();
                }

                if (successCodes.Contains(response.StatusCode) && !string.IsNullOrEmpty(ResponseProperty))
                {
                    Project.Properties[ResponseProperty] = response.Content.ReadAsString();
                }

                Project.Log(Level.Info, "Received HTTP response.");
                Project.Log(Level.Info, "Status Code: {0}", response.StatusCode);
                Project.Log(Level.Info, "Content Type: {0}", response.Headers.ContentType);
            }
            catch (ArgumentOutOfRangeException ex)
            {
                string message = string.Format("The HTTP '{0}' request to '{1}' failed:{2}{3}", Method, Url, Environment.NewLine, ex.Message);
                throw new BuildException(message, ex);
            }
        }
    }
}
```

Using the task is simple. The only mandatory attribute is `url` and the default HTTP method is GET. Here is a sample NAnt project showing how to use the `<http/>` task.

```xml
<?xml version="1.0"?>
<project name="Http">
  <http url="http://www.howtocreate.co.uk/operaStuff/userjs/samplexml.xml"
        method="GET"
        contenttype="text/xml"
        connectiontimeout="30"
        responseproperty="response"
        statuscodeproperty="status"
        failonerror="true" />

  <echo message="Response: ${response}" />
  <echo message="Status Code: ${status}" />
</project>
```

The source code is available on [GitHub](https://github.com/alexmg/HttpNAnt). After pulling down the source build the solution with Visual Studio or by running `msbuild Source\HttpNAnt.sln` from the command line. The `Dist` folder will contain the `AlexMG.HttpNAnt.dll` assembly. The compiled assembly has the `Microsoft.Http.dll` assembly from the WCF REST Starter Kit merged into it using the [ILMerge](http://www.microsoft.com/downloads/details.aspx?FamilyID=22914587-b4ad-4eae-87cf-b14ae6a939b0&DisplayLang=en) tool. This makes deployment easier by removing the chance of accidentally forgetting to deploy the dependency.
