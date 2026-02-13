---
title: BlogEngine.NET 2.5 Upgrade
description: Upgrading from BlogEngine.NET 2.0 to 2.5 was a fairly straightforward process, requiring some custom files and an SQL CE upgrade script to be run. I also added some customizations for a mobile version of the site and updated the titles on the Recent Comments and Posts widgets.
date: 2011-07-31
tags: [blogengine-net]
---

I just upgraded to [BlogEngine.NET 2.5](http://blogengine.codeplex.com/releases/view/69117) and found the process to be fairly straight forward. The [upgrade instructions](http://blogengine.codeplex.com/wikipage?title=Upgrading%20to%20BlogEngine.NET%202.5) suggest that you start from a v2.5 installation, and then copy your existing data and settings into the fresh install. I did this and then copied some additional files that were not explicitly mentioned in the instructions. Most of these were files that I added myself to customise the blog.

- The `apple-touch-icon.png` file into the root folder.
- Extensions I added into the `App_Code/Extensions` folder.
- The assembly for a custom extension I wrote into the `bin` folder.
- SQL Server CE runtime files and .NET provider assembly into the `bin` folder.
- JavaScript files for the jQuery lightBox plugin that I use.

After the upgrade I did get one compiler error in the [SimpleDownloadCounter](http://nyveldt.com/blog/post/Simple-BlogEngineNET-Download-Counter-Extension.aspx) extension.

> Compiler Error Message: CS1061: 'BlogEngine.Core.BlogSettings' does not contain a definition for 'StorageLocation' and no extension method 'StorageLocation' accepting a first argument of type 'BlogEngine.Core.BlogSettings' could be found (are you missing a using directive or an assembly reference?)

That was easily fixed by replacing the occurrence of `BlogSettings.Instance.StorageLocation` with `BlogConfig.StorageLocation`.

I moved from [VistaDB](http://www.vistadb.net/) to [SQL Server CE](http://www.microsoft.com/sqlserver/en/us/editions/compact.aspx) during the 2.0 upgrade so that more difficult migration was already done. This time I only needed to run the `SQL_CE_UpgradeFrom2.0to2.5.sql` upgrade script to update my SQL Server CE database schema. I used the [SQL Server Compact Toolbox](http://sqlcetoolbox.codeplex.com/) add-in for Visual Studio 2010 to run the script and had no problems.

Because I run a custom theme I check for new additions to the Standard theme and add any that I feel are required into my own. A quick check of the differences showed a new item was added to the header menu in the `site.master` file. It adds a link to the menu that allows a user to
switch between the regular and mobile version of the site when viewed on a mobile device.

```html
<% if (Utils.IsMobile) { %>
<li><blog:MobileThemeSwitch runat="server" /></li>
<% } %>
```

It seemed like a cool feature so I added the new code to my custom theme and tested the site from my iPhone to check that the new menu item was working. There were also a couple of CSS modifications that I moved over too. The last thing was to fix the titles on the Recent Comments and Recent Posts widgets. Either the space in the titles was removed during the upgrade or they were never there and I have only just noticed.

Overall, nothing too stressful. The complete list of new features in 2.5 can be found [here](http://dotnetblogengine.net/page/BlogEngineNET-25-Features-Notes.aspx).
