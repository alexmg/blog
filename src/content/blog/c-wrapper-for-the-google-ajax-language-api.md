---
title: C# wrapper for the Google AJAX Language API
description: This article discusses a C# wrapper for the Google AJAX Language API, which allows users to translate text using a REST based web service API. The WCF REST Starter Kit and DataContractJsonSerializer are used to make working with the API easier. The code is accompanied by a Visual Studio 2008 solution with full source code.
pubDatetime: 2009-04-28
tags: [httpclient, rest]
---

## Introduction

The [Google AJAX Language API](http://code.google.com/apis/ajaxlanguage/documentation/) allows you to perform text translations using a REST based web service API. Being an AJAX targeted API the web service returns a JSON formatted response that is easy to work with in JavaScript. Working with REST web services and JSON responses in C\# is also easy. I decided to check out the API by writing a C\# wrapper that would allow me to easily translate a string in any of the supported languages. A quick search will show that I am certainly not the first person to do this, but I don’t care as I wanted to do it my way and for myself.

## Response Classes

The [DataContractJsonSerializer](http://msdn.microsoft.com/en-us/library/system.runtime.serialization.json.datacontractjsonserializer.aspx) added to the .NET Framework 3.5 makes it easy to serialize and deserialize between JSON and CLR objects. I created classes to represented the JSON response from the web service. The first is the `TranslationResponse`. You will notice I have used the `DataContract` and `DataMember` attributes so I can map my Pascal cased property names to the camel cased property names used in the JSON response. Even when working with JSON it feels dirty when I don’t follow my naming conventions.

```csharp
/// <summary>
///     The translation response returned from Google.
/// </summary>
[DataContract(Name = "translateResponse")]
public class TranslationResponse
{
    /// <summary>
    ///     Gets or sets the response data.
    /// </summary>
    [DataMember(Name = "responseData")]
    public ResponseData ResponseData { get; set; }

    /// <summary>
    ///     Gets or sets the response details.
    /// </summary>
    /// <remarks>
    ///     This value is only present when the request fails
    ///     and will contain a diagnostic string.
    /// </remarks>
    [DataMember(Name = "responseDetails")]
    public string ResponseDetails { get; set; }

    /// <summary>
    ///     Gets or sets the response status.
    /// </summary>
    /// <remarks>
    ///     A status other than 200 indicates failure.
    /// </remarks>
    [DataMember(Name = "responseStatus")]
    public int ResponseStatus { get; set; }
}
```

The second class is `ResponseData` that contains the translated text and source language if it was automatically detected. This occurs when the source language is not provided in the request.

```csharp
/// <summary>
///     The data part of the response from Google.
/// </summary>
[DataContract(Name = "responseData")]
public class ResponseData
{
    /// <summary>
    ///     Gets or sets the translated text.
    /// </summary>
    [DataMember(Name = "translatedText")]
    public string TranslatedText { get; set; }

    /// <summary>
    ///     Gets or sets the detected source language.
    /// </summary>
    /// <remarks>
    ///     This value is only present when the source language was not provided
    ///     in the request and needed to be detected automatically.
    /// </remarks>
    [DataMember(Name = "detectedSourceLanguage")]
    public string DetectedSourceLanguage { get; set; }
}
```

## Request Helpers

I created some classes to help make the request simple to construct. The `Language` class contains a property for each of the supported languages. The properties return two letter ISO language names that are used in the request. I grabbed the list from the documentation and with a quick bit of string replacement had the C\# class ready to go. You didn’t really think I typed them all out did you?

```csharp
/// <summary>
///     The languages supported by the Google AJAX Language API.
/// </summary>
public static class Language
{
    public static readonly string Afrikaans = "af";
    public static readonly string Albanian = "sq";
    public static readonly string Amharic = "am";
    public static readonly string Arabic = "ar";
    public static readonly string Armenian = "hy";
    public static readonly string Azerbaijani = "az";
    public static readonly string Basque = "eu";
    public static readonly string Belarusian = "be";
    public static readonly string Bengali = "bn";
    public static readonly string Bihari = "bh";
    public static readonly string Bulgarian = "bg";
    public static readonly string Burmese = "my";
    public static readonly string Catalan = "ca";
    public static readonly string Cherokee = "chr";
    public static readonly string Chinese = "zh";
    public static readonly string ChineseSimplified = "zh-CN";
    public static readonly string ChineseTraditional = "zh-TW";
    public static readonly string Croatian = "hr";
    public static readonly string Czech = "cs";
    public static readonly string Danish = "da";
    public static readonly string Dhivehi = "dv";
    public static readonly string Dutch = "nl";
    public static readonly string English = "en";
    public static readonly string Esperanto = "eo";
    public static readonly string Estonian = "et";
    public static readonly string Filipino = "tl";
    public static readonly string Finnish = "fi";
    public static readonly string French = "fr";
    public static readonly string Galician = "gl";
    public static readonly string Georgian = "ka";
    public static readonly string German = "de";
    public static readonly string Greek = "el";
    public static readonly string Guarani = "gn";
    public static readonly string Gujarati = "gu";
    public static readonly string Hebrew = "iw";
    public static readonly string Hindi = "hi";
    public static readonly string Hungarian = "hu";
    public static readonly string Icelandic = "is";
    public static readonly string Indonesian = "id";
    public static readonly string Inuktitut = "iu";
    public static readonly string Italian = "it";
    public static readonly string Japanese = "ja";
    public static readonly string Kannada = "kn";
    public static readonly string Kazakh = "kk";
    public static readonly string Khmer = "km";
    public static readonly string Korean = "ko";
    public static readonly string Kurdish = "ku";
    public static readonly string Kyrgyz = "ky";
    public static readonly string Laothian = "lo";
    public static readonly string Latvian = "lv";
    public static readonly string Lithuanian = "lt";
    public static readonly string Macedonian = "mk";
    public static readonly string Malay = "ms";
    public static readonly string Malayalam = "ml";
    public static readonly string Maltese = "mt";
    public static readonly string Marathi = "mr";
    public static readonly string Mongolian = "mn";
    public static readonly string Nepali = "ne";
    public static readonly string Norwegian = "no";
    public static readonly string Oriya = "or";
    public static readonly string Pashto = "ps";
    public static readonly string Persian = "fa";
    public static readonly string Polish = "pl";
    public static readonly string Portuguese = "pt-PT";
    public static readonly string Punjabi = "pa";
    public static readonly string Romanian = "ro";
    public static readonly string Russian = "ru";
    public static readonly string Sanskrit = "sa";
    public static readonly string Serbian = "sr";
    public static readonly string Sindhi = "sd";
    public static readonly string Sinhalese = "si";
    public static readonly string Slovak = "sk";
    public static readonly string Slovenian = "sl";
    public static readonly string Spanish = "es";
    public static readonly string Swahili = "sw";
    public static readonly string Swedish = "sv";
    public static readonly string Tagalog = "tl";
    public static readonly string Tajik = "tg";
    public static readonly string Tamil = "ta";
    public static readonly string Telugu = "te";
    public static readonly string Thai = "th";
    public static readonly string Tibetan = "bo";
    public static readonly string Turkish = "tr";
    public static readonly string Uighur = "ug";
    public static readonly string Ukrainian = "uk";
    public static readonly string Unknown = "";
    public static readonly string Urdu = "ur";
    public static readonly string Uzbek = "uz";
    public static readonly string Vietnamese = "vi";
}
```

I also created a `TextFormat` enumeration that allows you to specify the format of the text to be translated. The only choices are HTML or plain text. If the URL argument for “format” is not provided the Language API assumes that the input is plain text.

```csharp
/// <summary>
///     The format of the text to be translated.
/// </summary>
public enum TextFormat
{
    /// <summary>
    ///     The text to translate is HTML.
    /// </summary>
    Html,

    /// <summary>
    ///     The text to translate is plain text.
    /// </summary>
    Text
}
```

## Making the Request

To make the request I decided to use the `HttpClient` class from the [WCF REST Starter Kit](http://aspnet.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=24644). I have blogged about this class [previously](http://alexmg.com/post/2009/04/07/Introduction-to-the-HttpClient.aspx) and it makes working with REST web services a walk in the park. Before jumping into the actual implementation lets have a look at some sample calling code. The static `Google` class contains an overloaded `Translate` method that accepts parameters for the text to be translated, source language, destination language and input text format.

```csharp
TranslationResponse response = Google.Translate("Hello, world!", Language.English, Language.French, TextFormat.Text);

Console.WriteLine("Status: " + response.ResponseStatus);
Console.WriteLine("Details: " + response.ResponseDetails);
Console.WriteLine("Detected Source Language: " + response.ResponseData.DetectedSourceLanguage);
Console.WriteLine("Translated Text: " + response.ResponseData.TranslatedText);
```

The `Language` class can be used to specify the source and destination languages. The language parameters are actually string values and can be provided dynamically if required. Using the `Language` class is simply a convenience that ensures the language values are correct and makes the method easier to use when the values can be hardcoded.

The `TextFormat` enumeration is used to indicate the format of the text to be translated. Because the parameter is an enumeration the value provided can never be invalid. Plain text is the default when an overload of the `Translate` method is used that does not require a value for the parameter.

The `Translate` method returns the deserialized `TranslationResponse`. I decided to return the response object as it is difficult to report errors without throwing an exception if only the translated text is returned. The response can also include other useful information and I didn’t want to use `out` parameters to return it.

If the `ResponseStatus` property of the response contains a value other than 200 a failure has occurred. This value can be different to the real HTTP status code returned to the `HttpClient`. If the call “virtually” failed the `ResponseDetails` property will contain an error message and the `ResponseData` property will be `null`. If the call was successful the `TranslatedText` property of the `ResponseData` will contain the translated text. The `DetectedSourceLanguage` property will only contain a value if the source language was not provided and was discovered during translation.

## Implementation Details

The `Translate` method from the `Google` class can be seen below.

```csharp
/// <summary>
///     Translates the specified text.
/// </summary>
/// <param name="text">
///     The text to translate.
/// </param>
/// <param name="sourceLanguage">
///     The language to translate from.
/// </param>
/// <param name="destinationLanguage">
///     The language to translate to.
/// </param>
/// <param name="textFormat">
///     The format of the text to be translated.
/// </param>
/// <returns>
///     A response that includes the translated text and status information.
/// </returns>
/// <exception cref="ArgumentException">
///     Thrown if the text to translate or destination language is null or empty.
/// </exception>
/// <exception cref="ArgumentOutOfRangeException">
///     Thrown if the HTTP response status code is not 200.
/// </exception>
/// <exception cref="ApplicationException">
///     Thrown if the response fails due to a non-communication related problem.
///     The response details returned from Google are included in the exception message.
/// </exception>
/// <remarks>
///     If the source language is not provided it will be automatically detected.
/// </remarks>
public static TranslationResponse Translate(string text, string sourceLanguage, string destinationLanguage, TextFormat textFormat)
{
    if (string.IsNullOrEmpty(text)) throw new ArgumentException("The 'text' parameter is invalid.", "text");
    if (string.IsNullOrEmpty(destinationLanguage)) throw new ArgumentException("The 'destinationLanguage' parameter is invalid.", "destinationLanguage");

    HttpClient client = new HttpClient("http://ajax.googleapis.com/");

    HttpQueryString queryString = new HttpQueryString
    {
        {"v", "1.0"},
        {"hl", Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName},
        {"langpair", string.Format("{0}|{1}", sourceLanguage.ToLowerInvariant(), destinationLanguage.ToLowerInvariant())},
        {"q", text},
        {"format", textFormat.ToString().ToLower()}
    };

    Uri serviceUri = new Uri("ajax/services/language/translate", UriKind.Relative);

    HttpResponseMessage responseMessage = client.Get(serviceUri, queryString);
    responseMessage.EnsureStatusIsSuccessful();

    DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(TranslationResponse));
    return (TranslationResponse)serializer.ReadObject(responseMessage.Content.ReadAsStream());
}
```

After checking the required arguments have been provided a new instance of the `HttpClient` is created. The client is provided with the Google API domain name for the base address. Next the `HttpQueryString` class, also from the starter kit, is used to build the query string. This class takes care of all the encoding and string formatting work.

The query string arguments are straight forward:

- `v` is the version of the API and is hardcoded to “1.0”.
- `hl` is the host language which is retrieved from the current thread.
- `langpair` is a pipe separated pair of two letter ISO language names.
- `q` is the text to be translated.
- `format` indicates the format of the text to be translated (HTML or plain text).

A new `Uri` instance is created with the relative address to the translation web service. When the `Get` method is called on the `HttpClient` with the relative URL and query string a `HttpResponseMessage` is returned. The `EnsureStatusIsSuccessful` method on the response is called to ensure that the HTTP status code returned is 200 (OK). An `ArgumentOutOfRangeException` will be thrown if the status code is not 200.

Finally, an instance of the `DataContractJsonSerializer` is created ready to serialize and deserialize instances of the `TranslationResponse` type. The HTTP response is retrieved as a `Stream` and provided to the `ReadObject` method of the `DataContractJsonSerializer`. The deserialized response is then returned to the caller.

## Summary

The Language API is an example of another service from Google that is both cool and free. The WCF REST Starter Kit makes working with REST web services really simple, and JSON is no longer a format that is only useful to web developers working in JavaScript thanks to the `DataContractJsonSerializer`. I have attached a Visual Studio 2008 solution with the full source code.

[GoogleTranslator.zip (136.21kb)](/content/files/2009/Apr/GoogleTranslator.zip)
