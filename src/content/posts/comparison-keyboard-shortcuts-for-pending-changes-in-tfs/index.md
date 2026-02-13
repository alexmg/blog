---
title: Comparison keyboard shortcuts for Pending Changes in TFS
description: This article provides instructions for setting up keyboard shortcuts for comparing pending changes in Visual Studio with the Latest, Workspace and Previous versions. It also provides updated commands for Visual Studio 2012.
date: 2009-09-05
tags: [tfs, visual-studio]
---

![Logitech MX5500](./Keyboard.png)

One of the first things I configured in my Visual Studio environment when I starting using TFS was keyboard shortcuts to make comparing my pending changes easier. I find having to right-click on each item in the **Pending Changes** window and navigate through the context menu to
perform a comparison quickly tests my patience. The drop down menu on the tool bar button is slightly faster but still not quick enough for my liking. I am always fastest when my hands don’t need to leave the keyboard.

I have configured keyboard shortcuts to compare my pending changes with the Latest, Workspace and Previous versions. Obviously the shortcuts only work when the option would normally appear enabled on the context menu. To configure these shortcuts select **Options** from the **Tools** menu in Visual Studio. In the **Options** dialog use the tree to drill into **Environment** and then to the **Keyboard** settings. Enter the command names below into the **Show commands containing** text box one at a time:

- TeamFoundationContextMenus.SourceControlPendingChangesSourceFiles.Compare.TfsContextPendingCheckinsCompareWithLatestVersion
- TeamFoundationContextMenus.SourceControlPendingChangesSourceFiles.Compare.TfsContextPendingCheckinsCompareWithWorkspaceVersion
- TeamFoundationContextMenus.SourceControlPendingChangesSourceFiles.Compare.TfsContextPendingCheckinsCompareWithPreviousVersion

For each command enter your desired keyboard shortcut into the **Press shortcut keys** text box and click the **Assign**button. I have used the shortcut keys below, assigned to the commands in the same ordinal position above:

- Ctrl+\`
- Ctrl+Shift+\`
- Ctrl+Alt+\`

With this in place I can quickly fire up and navigate through my diffs in [WinMerge](http://winmerge.org/) using only my keyboard. No mucking about and no reaching for the mouse. Even a simple set of steps can become frustrating when you have to repeat them a large number of times. Save yourself all that clunky mouse based GUI interaction and embrace the power of the keyboard!

**With the new Pending Changes page in Visual Studio 2012 the command have changed.**

For Visual Studio 2012 use the command names below instead:

- TeamFoundationContextMenus.PendingChangesPageChangestoInclude.TfsContextPendingChangesPageCompareWithLatestVersion
- TeamFoundationContextMenus.PendingChangesPageChangestoInclude.TfsContextPendingChangesPageCompareWithPreviousVersion
- TeamFoundationContextMenus.PendingChangesPageChangestoInclude.TfsContextPendingChangesPageCompareWithWorkspaceVersion
