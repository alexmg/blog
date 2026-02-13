---
title: Comment Spam protection for BlogEngine.NET
description: This article discusses a comment spam protection for BlogEngine.NET, which uses Akismet and CAPTCHA solutions to protect from spam. The CAPTCHA solution requires some changes to the code of BlogEngine.NET and might have to be merged with newer versions when upgrading.
date: 2010-02-25
tags: [blogengine-net]
---

![No spam](./No-spam.png)

The amount of comment spam I have been getting on this blog has increased significantly in recent months, and I decided it was finally time to do something about it. I have been using an [Akismet](http://akismet.com/) comment filtering extension for a long time now but the flow of comment spam continued to rise. There is now an Akismet extension included in [BlogEngine.NET 1.6](http://www.dotnetblogengine.net/post/BlogEngineNET-16-is-Released.aspx) and I will continue to use it because the more layers of protection the better.

I wanted to complement the Akismet extension with a [CAPTCHA](http://en.wikipedia.org/wiki/CAPTCHA) based solution and figured that the problem would no doubt have already been tackled by someone else. This was certainly the case, and after settling on [this solution](http://www.codecapers.com/post/How-to-Block-Spam-Comments-in-BlogEngineNET.aspx) outlined by Michael Ceranski, I had the implementation deployed and working in a couple of minutes. The only hesitation I had with the solution is that it requires changes to the BlogEngine.NET code, and I will have to remember to merge them into newer versions when I upgrade. I usually have a number of changes to merge during an upgrade anyway, and if the end result is less spam then it will be well worth it. Now to wait and see how well this CAPTCHA based solution works.
