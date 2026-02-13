---
title: WSCF.blue V1.0.11 Update
description: WSCF.blue V1.0.11 is now available for download, with a new feature and several bug fixes. It supports both Visual Studio 2008 and Visual Studio 2010, and has passed the 10,000 downloads mark.
date: 2011-02-16
tags: [web-services, wscf]
---

A V1.0.11 update release of [WSCF.blue](http://wscfblue.codeplex.com/) is now available for [download](http://wscfblue.codeplex.com/releases/view/61072) from CodePlex. This one contains a few bug fixes and one new feature. It will be the first release since upgrading the V1 solution to Visual Studio 2010, but the add-in continues to support both Visual Studio 2008 and Visual Studio 2010.

Christian recently [posted](http://weblogs.thinktecture.com/cweyer/2011/01/thinktecture-wscfblue-has-hit-the-10000-downloads-landmark-on-codeplex.html) that WSCF.blue passed the 10,000 downloads mark. Benjy would have been proud to see that milestone. We miss you mate.

## Features

- Added a new option that allows properties on data contract types to be marked as virtual.

## Bug Fixes

- Fixed a bug caused by certain project properties not being available on Web Service Software Factory projects.
- Fixed a bug that could result in the `WrapperName` value of the `MessageContractAttribute` being incorrect when the **Adjust Casing** option is used.
- The menu item code now caters for `CommandBar` instances that are not available. For example, the **Web Item** `CommandBar` does not exist if the Visual Web Developer component of Visual Studio is not installed. Adding logging to report any `CommandBar` instances that could not be located.
