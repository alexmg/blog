---
title: Data contract generation is now available in WSCF.blue
description: Data contract generation is now available in the WSCF.blue V1 Beta 2 release, and as always user feedback and bug reports are welcome. The feature allows users to select one or more source XSD or WSDL files and generate data contracts using the XmlSerializer. Data Contract Code Generation Options are also available.
pubDatetime: 2009-09-01
tags: [web-services, wscf]
---

I am pleased to report that data contract generation is now available, and that the functionality has been extended to allow the selection of multiple source XSD or WSDL files. This feature is available in the [V1 Beta 2](http://wscfblue.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=32274#DownloadId=81520) release, and as always, user [feedback](http://wscfblue.codeplex.com/Thread/List.aspx) and [bug reports](http://wscfblue.codeplex.com/WorkItem/List.aspx) are welcome.

Data contract generation was one of the features from [WSCF.classic](http://www.codeplex.com/WSCFclassic) that got left behind while the work was done to support WCF in [WSCF.blue](http://www.codeplex.com/WSCFblue/). Since this was a very popular feature it was important to make sure it was available in WSCF.blue as part of the V1 release.

The generated data contract types are designed to work with the `XmlSerializer`. WSCF.blue uses the `XmlSerializer` because the `DataContractSerializer` is limited in regards to its support for many of the XSD constructs that often appear in contract-first WSDL. Regardless, I would like to add the ability to generate data contract types using the `DataContractSerializer`. Please let me know if this is a feature you would like to see implemented.

To generate data contracts start by selecting the required XSD or WSDL file in your project. You can select one or more files as required.

![Source XSD files.](/images/blog/Solution-Explorer.png)

Right-click your selection and choose **Generate Data Contract Code...**from the context menu.

![Generate Data Contract Code...](/images/blog/Generate-Data-Contract-Code.png)

You will be presented with the **Data Contract Code Generation Options** dialog.

![Data Contact Code Generation Options](/images/blog/Generation-Options-dialog.png)

You can choose to create a separate file for each type or keep them all in a single file. The usual list of **Code generation options** are also available. Click **Generate** and enjoy your data contracts!
