---
title: Content missing from FeedBurner feed
description: After moving a FeedBurner account to Google, content was missing from the feed and duplicates appeared in Google Reader. Switching to RSS 2.0 as the feed format solved the first problem and switching to a new base address for the FeedBurner feed solved the second.
pubDatetime: 2009-03-18
tags: [feedburner]
---

![RSS Feed Logo](/images/blog/RSS-logo.png)

After moving my [FeedBurner](http://www.feedburner.com/) account over to [Google](http://feedburner.google.com/) I found that content was no longer appearing in my feed. I tried pinging and resyncing my feed but it made no difference. My feed was being formatted as ATOM 1.0 by [BlogEngine.NET](http://www.dotnetblogengine.net/) so I changed it to RSS 2.0 to see if that would help. For some reason after performing another resync the content was now appearing. This seemed strange as I never had a problem prior to my account being moved Google.

To confirm that it wasn’t just a fluke I changed the format back to ATOM 1.0, and sure enough the problem appeared again. Switching back to RSS 2.0 once again fixed the problem. I have used the W3C [Feed Validation Service](http://validator.w3.org/feed/) to confirm that my feed is valid, so the problem is clearly not the source feed, but rather a problem that has surfaced after moving my account.

Having sorted the first problem out, there were now duplicate posts appearing in [Google Reader](http://reader.google.com) for my feed. Once I switched my feed format to RSS 2.0 and regained the missing content Google Reader assumed I had new posts and added them to its cache. When feeds are cached by Google Reader feed items are never removed and only updates are noted in the cache. I assume this is because it's impossible to tell the difference between a post that was actually deleted and one that is simply no longer included in the feed.

I’m not aware of a way to clear the cache for a feed in Google Reader, so I switched to an alternative base address for my FeedBurner feed that hadn't already been cached. My FeedBurner account indicates that the base address for my feed is *feeds2.feedburner.com.*I switched to using _feedproxy.google.com_ as the base address instead and the duplicates are now gone. I hope Google manages to sort out the [problems people are having](http://www.google.com.au/search?q=google+feedburner+troubles) as it would be a shame to see them loose FeedBurner accounts.
