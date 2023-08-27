---
title: "WSCF.blue Beta Released: Are you doing contract-first?"
description: WSCF.blue is a Visual Studio Add-in designed to bring the benefits of contract-first web service development to those working with WCF (Windows Communication Foundation). It is the latest version of an earlier tool called WSCF and was created by a team of talented developers. The contract-first approach makes web services more interoperable, and the Beta version of WSCF.blue can be downloaded and tested.
pubDatetime: 2009-07-05
tags: [tools, web-services, wscf]
---

![WSCF](/images/blog/WSCF-logo.png)

[WSCF.blue](http://wscfblue.codeplex.com/) is a Visual Studio Add-in designed to bring the benefits of contract-first web service development to those working with [WCF](http://msdn.microsoft.com/en-us/netframework/aa663324.aspx) (Windows Communication Foundation). I recently joined the WSCF.blue project and have enjoyed working with a team of very talented developers. Please be sure to read their blogs and benefit from the experience they offer:

- [Christian Weyer](http://blogs.thinktecture.com/cweyer/ "http://blogs.thinktecture.com/cweyer/")
- [Buddhike de Silva](http://blogs.thinktecture.com/buddhike "http://blogs.thinktecture.com/buddhike")
- [Edward Bakker](http://www.edwardbakker.nl/ "http://www.edwardbakker.nl/")
- [Santosh Benjamin](http://santoshbenjamin.wordpress.com/ "http://santoshbenjamin.wordpress.com/")

My first foray into the world of contract-first web service development was made all the more pleasurable thanks to the [WSCF](http://www.thinktecture.com/resourcearchive/tools-and-software/wscf) (Web Service Contract First) tool. This early version of WSCF was targeted at web services developed using ASMX, and was first released by [thinktecture](http://www.thinktecture.com/), where it was maintained by team members [Christian Weyer](http://blogs.thinktecture.com/buddhike) and [Buddhike de Silva](http://blogs.thinktecture.com/buddhike). The project later moved to [CodePlex](http://www.codeplex.com/) where it remains available today; although it has been renamed to [WSCF.classic](http://www.codeplex.com/WSCFclassic) to differentiate it from the new WSCF.blue version designed for use with WCF. I highly recommend taking a look at WSCF.classic if you are developing web services using ASMX and are interesting in the contract-first approach.

For those currently working with WCF, or looking to migrate from ASMX, you will no doubt find WSCF.blue to be a must have tool. It fills a gap in the tooling available to .NET developers that want to embrace the contract-first approach in its true form. If you aren’t familiar with
contract-first web service design I recommend reading the articles below. You will notice that the first of these articles was written by team member Christian Weyer (web services guru, co-founder of thinktecture and creator of WSCF):

- [Introducing Contract First](http://www.code-magazine.com/Article.aspx?quickid=0507061)
- [Service Station: Contract-First Service Development](http://msdn.microsoft.com/en-us/magazine/cc163800.aspx)

The contract-first approach guides the developer of a web service into creating an interface (contract) that is interoperable and standards compliant. It requires a shift in focus, moving away from a code oriented perspective to one that is oriented towards data and messages. This type of thinking will greatly benefit those building SOA (Service Oriented Architecture) based systems. The [XML Schema](http://www.w3.org/XML/Schema) and [WSDL](http://www.w3.org/TR/wsdl) (Web Services Description Language) specifications are key to achieving the goals of contract-first. These specifications may appear strange at first sight, but better understanding them will allow you to make your web services easier to consume, and more interoperable in the heterogeneous environments we frequently find ourselves forced to work within.

Below are posts from the other WSCF.blue team members regarding the Beta release:

- [Next generation of a success story: WSCF.blue for WCF goes Beta 1](http://blogs.thinktecture.com/cweyer/archive/2009/07/05/415374.aspx)
- [WSCF.blue Beta 1 is out!](http://www.edwardbakker.nl/PermaLink,guid,dcf22cb5-ce5e-4572-b6fd-56ebb5ed6fb3.aspx)
- [WSCF blue: Beta-1](http://santoshbenjamin.wordpress.com/2009/07/04/wscf-blue-beta-1/)

Please [download](http://wscfblue.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=29385#ReleaseFiles) the Beta version, smack it around and put it through its paces. It is the development community that is best positioned to shape the future direction of WSCF.blue; so please provide your feedback, report bugs and help spread the word of contract-first.
