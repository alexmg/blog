---
title: Code Tag Plugin for Windows Live Writer
description: I made a plugin for Windows Live Writer that allows users to easily surround text with the HTML phrase tag. It's easy to install and comes with source code files.
date: 2009-01-13
tags: [tools, windows-live-writer]
---

I made a simple [Windows Live Writer](http://windowslivewriter.spaces.live.com/) plugin that allows you to easily surround text with the `<code>` HTML [phrase tag](http://www.w3schools.com/tags/tag_phrase_elements.asp). Writing a plugin for WLW is fairly straightforward and everything you need to know can be found in the Windows Live Writer SDK [documentation](http://msdn.microsoft.com/en-us/library/aa738906.aspx) on MSDN. The default browser rendering of text inside a `<code>` tag is to display it using a fixed-width font. You can of course alter its appearance using [CSS](http://www.w3.org/Style/CSS/) to make it a little more interesting.

If no text is selected in the editor and the plugin is activated, a small dialog is presented into which you can enter the text that is to be placed inside the tag. You can also select text in the editor and have it immediately placed inside the tag when the plugin is activated. Trailing whitespace in the selected text will not be included inside the tag. Any trailing whitespace inside the tag would also be fixed-width, causing the spacing before and after the text inside the tag to appear uneven.

To install the plugin simply drop the _AlexMG.CodeTagPlugin.dll_ file into the _C:\\Program Files\\Windows Live\\Writer\\Plugins_ folder. When building from source code the plugin will be copied to the WLW plugin folder during the post-build event.

[Code Tag Plugin (3.67 kb)](/content/files/2009/Jan/AlexMG.CodeTagPlugin.zip)

[Code Tag Plugin - Source (5.45 kb)](/content/files/2009/Jan/AlexMG.CodeTagPlugin.Source.zip)
