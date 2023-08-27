---
title: WSCF.blue V1.0.12 Update
description: WSCF.blue V1.0.12 Update is now available for download and contains one new feature, AutoSetSpecifiedPropertiesDecorator, as well as several bug fixes. The update is courtesy of user contributions from BartKoelman, cjberg, jamaica and MrGlover.
pubDatetime: 2011-06-26
tags: [web-services, wscf]
---

A V1.0.12 update release of [WSCF.blue](http://wscfblue.codeplex.com/) is now available for [download](http://wscfblue.codeplex.com/releases/view/69032) from CodePlex. Like the previous update, this one contains a few bug fixes and one new feature. This update is made available to you courtesy of user contributed patches. A big thank you to users [BartKoelman](http://www.codeplex.com/site/users/view/BartKoelman), [cjberg](http://www.codeplex.com/site/users/view/cjberg), [jamaica](http://www.codeplex.com/site/users/view/jamaica) and [MrGlover](http://www.codeplex.com/site/users/view/MrGlover) for their contributions.

### Features

- Added a new `AutoSetSpecifiedPropertiesDecorator` to automatically set the \*\*`_Specified` property to true when setter on matching property is called. Obviously this will only work when the Properties option is used.

### Bug Fixes

- Reduced the number of times menu visibility is updated in the `SelectionEvents.OnChange` event to help prevent `OutOfMemoryException` inside EnvDTE.
- Fixed `NullReferenceException` in `OnTypeNameChanged` method of `MessageContractConverter`.
- Improved validation of namespace identifiers. The original implementation only allowed ASCII letters among other deficiencies, even though C\# allows most Unicode letters in identifiers.
- Data contract generation - choice element name incorrect in generated class ([http://wscfblue.codeplex.com/workitem/10624](http://wscfblue.codeplex.com/workitem/10624)).
- Incorrect `XmlTypeAttribute` for same-named types in different namespaces ([http://wscfblue.codeplex.com/workitem/12733](http://wscfblue.codeplex.com/workitem/12733)).
- Patch for `NullReferenceException` on inline XSD ([http://wscfblue.codeplex.com/workitem/13714](http://wscfblue.codeplex.com/workitem/13714)).
