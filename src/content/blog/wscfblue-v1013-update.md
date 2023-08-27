---
title: WSCF.blue V1.0.13 Update
description: I have released an update for WSCF.blue, version 1.0.13, to fix a bug with the WSDL round-tripping feature that caused message headers not to be round-tripped when fault messages existed for the same operation.
pubDatetime: 2011-10-14
tags: [web-services, wscf]
---

![image](/images/blog/WSCF-Logo.png)

I have posted a [V1.0.13 update](http://wscfblue.codeplex.com/releases/view/75058#DownloadId=292847) for [WSCF.blue](http://wscfblue.codeplex.com/) to address a [bug](http://wscfblue.codeplex.com/workitem/13287) with the WSDL round-tripping feature. It was reported that message headers were not being round-tripped in the WSDL when fault messages existed for the same operation. I normally prefer to batch up a few bug fixes for an update build, but I can appreciate that this particular bug would get very annoying when using headers along with numerous operations.
