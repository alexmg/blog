---
title: Switching to reCAPTCHA for Comment Spam protection
description: In 2010, I switched to using reCAPTCHA for comment spam protection on my blog. I found an extension written by Filip Stanek that integrates it with BlogEngine.NET, but there were some problems with the extension when used with the DbBlogProvider. I made a few small changes to the code and was able to get it working properly.
date: 2010-03-30
tags: [blogengine-net]
---

![reCAPTCHA](./reCAPTCHA-logo.png)

I recently posted about using [CAPTCHA](http://en.wikipedia.org/wiki/CAPTCHA) on my blog in an attempt to reduce the amount of comment spam. The implementation I posted about has worked well for me but I decided I would like to switch to [reCAPTCHA](http://recaptcha.net/). Not only is this free CAPTCHA service robust and well tested, it also helps to digitize books, newspapers and old time radio shows. Taking the thousands of hours people spend entering CAPTCHA information each day and utilizing them for an additional purpose is a brilliant idea.

As with the previous solution I was sure that someone would have already done the work to integrate reCAPTCHA with [BlogEngine.NET](http://www.dotnetblogengine.net/). My assumption was correct and I quickly found [a solution](http://www.bloodforge.com/post/BlogengineNET-reCaptcha-093-Installation-Instructions.aspx) in the form of an extension written by [Filip Stanek](http://www.bloodforge.com/). I followed the simple installation process and had the control appearing in the comment form straight away. After a short period of testing I quickly found a couple of problems. Once the first comment was added all subsequent comments entered resulting in an error that was reported via the callback. The log viewer added to the administration area was also throwing an exception and failing to load.

I tracked both of these problems down to the extension expecting the return value from `BlogService.LoadFromDataStore` to be a `Stream`. This method returns an `object` instance and delegates its work to the currently configured `BlogProvider`. The `BlogProvider.LoadFromDataStore` method also returns `object`, and it turns out that the type of the object returned will be different depending on the provider being used. My data store is a [VistaDB.NET](http://www.vistadb.net/) database so I am using the `DbBlogProvider` instead of the default `XmlBlogProvider`. Unfortunately the `DbBlogProvider` returns a `string` and the `XmlBlogProvider` returns a `Stream`. There is nothing stopping the next provider that is written from returning yet another type. This no doubt makes life difficult for those writing BlogEngine.NET extensions.

To get the extension working with the `DbBlogProvider` you will need to make a couple of small changes. In the `Recaptcha.cs` file, find the code below in the `UpdateLog` method.

```csharp
Stream s = (Stream)BlogService.LoadFromDataStore(BlogEngine.Core.DataStore.ExtensionType.Extension, "RecaptchaLog");
List<RecaptchaLogItem> log = new List<RecaptchaLogItem>();
if (s != null)
{
    System.Xml.Serialization.XmlSerializer serializer = new System.Xml.Serialization.XmlSerializer(typeof(List<RecaptchaLogItem>));
    log = (List<RecaptchaLogItem>)serializer.Deserialize(s);
    s.Close();
}
log.Add(logItem);
```

Replace it with the following code.

```csharp
string data = (string)BlogService.LoadFromDataStore(BlogEngine.Core.DataStore.ExtensionType.Extension, "RecaptchaLog");
List<RecaptchaLogItem> log = new List<RecaptchaLogItem>();
if (!string.IsNullOrEmpty(data))
{
    using (MemoryStream stream = new MemoryStream(Encoding.Unicode.GetBytes(data)))
    {
        System.Xml.Serialization.XmlSerializer serializer = new System.Xml.Serialization.XmlSerializer(typeof(List<RecaptchaLogItem>));
        log = (List<RecaptchaLogItem>)serializer.Deserialize(stream);
    }
}
log.Add(logItem);
```

In the `RecaptchaLogViewer.aspx.cs` file, find the code below in the `BindGrid` method.

```csharp
Stream s = (Stream)BlogService.LoadFromDataStore(BlogEngine.Core.DataStore.ExtensionType.Extension, "RecaptchaLog");
List<RecaptchaLogItem> log = new List<RecaptchaLogItem>();
if (s != null)
{
    System.Xml.Serialization.XmlSerializer serializer = new System.Xml.Serialization.XmlSerializer(typeof(List<RecaptchaLogItem>));
    log = (List<RecaptchaLogItem>)serializer.Deserialize(s);
    s.Close();
}
```

Replace it with the following code.

```csharp
string data = (string)BlogService.LoadFromDataStore(BlogEngine.Core.DataStore.ExtensionType.Extension, "RecaptchaLog");
List<RecaptchaLogItem> log = new List<RecaptchaLogItem>();
if (!string.IsNullOrEmpty(data))
{
    using (MemoryStream stream = new MemoryStream(Encoding.Unicode.GetBytes(data)))
    {
        System.Xml.Serialization.XmlSerializer serializer = new System.Xml.Serialization.XmlSerializer(typeof(List<RecaptchaLogItem>));
        log = (List<RecaptchaLogItem>)serializer.Deserialize(stream);
    }
}
```

You should now be able to use the extension with the `DbBlogProvider` without any problems. The rest of the extension seems to work without any problems and appears to be well written overall. It is definitely worth checking out if you are looking for a reCAPTCHA solution for BlogEngine.NET.
