---
title: Paste XML as Schema in WSCF.blue
description: WSCF.blue's Paste XML as Schema feature allows users to paste XML from the clipboard and have it automatically converted into an XSD file for use in web services contracts. The menu item appears on the Edit menu in Visual Studio and is only enabled when a project is open.
pubDatetime: 2009-09-21
tags: [web-services, wscf]
---

The [WCF REST Starter Kit](http://www.asp.net/downloads/starter-kits/wcf-rest/) includes a
Visual Studio Add-in called **Paste XML as Type** that, as you would expect given the name, allows you to paste XML from the clipboard into your code as a .NET type definition. This works well in a REST scenario where the response from a web service is XML that you want to
deserialise into a .NET type for use on the client.

[WSCF.blue](http://wscfblue.codeplex.com/) now includes a similar feature, but one that is designed to better fit with the contract-first approach. Instead of taking the XML and creating a .NET type definition, WSCF.blue infers an XML schema that can be used in your web service contract.

Imagine that you have an application that passes XML documents around via the file system or maybe even a queue. You decide that you would like to update this application to use web services, and will of course take the contract-first approach using that WSCF.blue tool that your friends keep raving about. You can open one of those XML documents and copy the contents into the clipboard, then jump over to Visual Studio and have an XSD file containing the appropriate schema added to your project in seconds. After defining the schema for your messages, WSCF.blue will help you construct your WSDL and generate your stub service and client code.

The new feature appears as the **Paste XML as Schema** menu item on the **Edit** menu in Visual Studio. The menu item will only be enabled if a project is currently open and selected. You may notice in the screen capture that the menu items looks suspiciously familiar, maybe even to a neighbouring menu item.

![Paste XML as Schema Menu Item](/images/blog/Paste-XML-as-Schema.png)

WSCF.blue will ensure the text in your clipboard is valid XML before inferring the schema. The paste operation actually adds a new file into your project and does not paste the XSD directly into the active editor window. I know that is a little strange for a paste operation that corresponds to a text formatted copy operation, but think of it as pasting a magically created file into your project. Your new XSD file will be named the same as the root element in the XML. For example, performing the paste with the XML below in your clipboard:

```xml
<?xml version="1.0"?>
<catalog>
   <book id="bk101">
      <author>Gambardella, Matthew</author>
      <title>XML Developer's Guide</title>
      <genre>Computer</genre>
      <price>44.95</price>
      <publish_date>2000-10-01</publish_date>
      <description>An in-depth look at creating applications
      with XML.</description>
   </book>
   <book id="bk102">
      <author>Ralls, Kim</author>
      <title>Midnight Rain</title>
      <genre>Fantasy</genre>
      <price>5.95</price>
      <publish_date>2000-12-16</publish_date>
      <description>A former architect battles corporate zombies,
      an evil sorceress, and her own childhood to become queen
      of the world.</description>
   </book>
</catalog>
```

Will result in the currently selected project having a file called `catalog.xsd` added to it. Below is the schema inferred from the XML that will appear in the XSD file:

```xml
<?xml version="1.0" encoding="utf-8"?>
<xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="catalog">
    <xs:complexType>
      <xs:sequence>
        <xs:element maxOccurs="unbounded" name="book">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="author" type="xs:string" />
              <xs:element name="title" type="xs:string" />
              <xs:element name="genre" type="xs:string" />
              <xs:element name="price" type="xs:decimal" />
              <xs:element name="publish_date" type="xs:date" />
              <xs:element name="description" type="xs:string" />
            </xs:sequence>
            <xs:attribute name="id" type="xs:string" use="required" />
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

Please [download](http://wscfblue.codeplex.com/Release/ProjectReleases.aspx?ReleaseId=32274#ReleaseFiles) the latest **V1 Beta 2** build (1.0.4) and take it out for a spin. Hopefully this feature will make it easier for people to create web services using contract-first and will remove the need for passing around those old XML documents. Web services are a much more fun way to pass XML around!
