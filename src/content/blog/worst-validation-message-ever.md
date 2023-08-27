---
title: Worst validation message ever
description: A web service validation message was found to be difficult to understand due to its extremely technical and legal-like wording.
pubDatetime: 2012-03-29
tags: [web-services]
---

I was testing what I hoped (but doubted) would be a non-breaking change to a web service contract and got this doozy of a validation message from svcutil.exe (Microsoft Service Model Metadata Tool). The person that wrote this validation message clearly should have gone into the legal profession, because it reads more like legalise from an EULA than something a sane person is meant to understand:

> Validation Error: Wildcard '\#\#any' allows element ‘http://www.acme.com/Service/Foo:data’, and causes the content model to become ambiguous. A content model must be formed such that during validation of an element information item sequence, the particle contained directly, indirectly or implicitly therein with which to attempt to validate each item in the sequence in turn can be uniquely determined without examining the content or attributes of that item, and without any information about the items in the remainder of the sequence.

If you read it a couple of times it actually starts to make sense, but there is certainly a lot of room for improvement in readability.
