---
title: Bugs in the bit.ly REST API
description: This article discusses bugs found in bit.ly's REST API which prevent users from expanding URLs from its shortened representation by returning XML that includes the hash for the URL as one of the elements, which cannot start with a numeric or punctuation character. It also covers issues with serialization for .NET consumers and how other services in the bit.ly REST API do not suffer the same problem.
date: 2009-04-17
tags: [rest, web-services]
---

## Introduction

[bit.ly](http://bit.ly/) is one of the many websites that offer [URL shortening services](http://lists.econsultant.com/top-10-url-redirection-services.html). It’s certainly one of the better services and integrates nicely with [Twitter](http://twitter.com/). I decided to take a look at their REST API but quickly found problems with the [expand](http://code.google.com/p/bitly-api/wiki/ApiDocumentation#/expand) service, including an obvious bug when results are returned as XML instead of JSON. All of the services allow you to specify JSON or XML as the format for the response. The default response format is JSON.

## Invalid XML

The service for expanding a URL from its shortened representation returns XML that includes the hash for the URL as one of the elements. The problem is that the hash for a URL can, and often does, start with a numeric character. One of the naming rules for an XML element name is that it cannot start with a numeric or punctuation character.

If you run the example URL provided in the API [documentation](http://code.google.com/p/bitly-api/wiki/ApiDocumentation) for expand in the browser, and append `format=xml` to the query string, you will see a parsing error regarding the element name. You can test the link below and see that an error will be displayed regardless of the browser you are using. Firefox, Internet Explorer and Google Chrome all validate an XML response before rendering it.

[http://api.bit.ly/expand?version=2.0.1&shortUrl=http://bit.ly/31IqMl&login=bitlyapidemo&apiKey=R_0da49e0a9118ff35f52f629d2d71bf07&format=xml](http://api.bit.ly/expand?version=2.0.1&shortUrl=http://bit.ly/31IqMl&login=bitlyapidemo&apiKey=R_0da49e0a9118ff35f52f629d2d71bf07&format=xml "http://api.bit.ly/expand?version=2.0.1&shortUrl=http://bit.ly/31IqMl&login=bitlyapidemo&apiKey=R_0da49e0a9118ff35f52f629d2d71bf07&format=xml")

This also means you cannot load the XML into an `XDocument` or `XmlDocument` in .NET. Both classes validate the XML and throw an `XmlException` if validation fails. When provided with the invalid XML both throw an exception with the same message:

`System.Xml.XmlException: Name cannot begin with the '3' character, hexadecimal` `value 0x33. Line 5, position 4.`

You can see the problem element on line 5 in the XML below. If you attempt to use the [Paste XML as Types](http://blogs.msdn.com/endpoint/archive/2009/03/16/paste-xml-as-types-in-rest-starter-kit.aspx) feature in the [WCF REST Starter Kit](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24644) with this XML you will find that it also throws the same exception.

```xml
<bitly>
    <errorCode>0</errorCode>
    <errorMessage></errorMessage>
    <results>
        <31IqMl>
            <longUrl>http://cnn.com/</longUrl>
        </31IqMl>
    </results>
    <statusCode>OK</statusCode>
</bitly>
```

## Serialization Issues

The JSON and XML responses from the expand service are not serialization friendly for .NET consumers. Had the **Paste XML as Types** feature mentioned above actually managed to generate a .NET type you would find that it too was invalid. The hash name that was invalid in the XML also prevents you from creating a .NET type to use with serializers such as the [XmlSerializer](http://msdn.microsoft.com/en-us/library/system.xml.serialization.xmlserializer.aspx), [DataContractSerializer](http://msdn.microsoft.com/en-us/library/system.xml.serialization.xmlserializer.aspx) and [DataContractJsonSerializer](http://msdn.microsoft.com/en-us/library/system.runtime.serialization.json.datacontractjsonserializer.aspx).

The naming issue still exists, except this time instead of XML elements, it’s the names of .NET properties that cannot start with a number. The more important issue though is that the names of the XML element and JSON pairs are actually variable. This prevents them from being mapped to a property on a .NET type by the serializer. If the hash was a value associated with a fixed XML element name or JSON pair name you would be able to deserialize the result into a .NET type.

## Conclusion

The other services in the bit.ly REST API do not suffer the same problem. They use fixed and valid names for the XML elements and JSON pairs. Despite being a little surprised to find these problems, I remain a fan of the bit.ly service and would happily recommend it. These sort of mistakes happen to all of us, but you never hope to see them find their way into a public API.
