---
title: Getting the Windows Product ID using WMI
description: The Windows Product ID can be retrieved using WMI via the Win32_OperatingSystem class and the SerialNumber property. The relevant documentation can be found on MSDN and an example of code to query the property value is given. It has been tested successfully on various versions of Windows.
date: 2010-09-21
tags: [csharp, windows, wmi]
---

I needed to get the Windows Product ID from managed code recently and decided that using WMI would be the most reliable and stable way to get the job done. Do not follow any examples that show you how to get this information from the registry. You simply cannot rely on those registry keys being present in the many different versions of Windows. There is also no guarantee that if they are present, that this will continue to be the case into the future. Using an official and supported API means that maintaining compatibility is Microsoft’s problem and not yours.

The WMI class you want is `Win32_OperatingSystem` and the property is called `SerialNumber`. The relevant [documentation](<http://msdn.microsoft.com/en-us/library/aa394239(VS.85).aspx>) can be found on MSDN.

> SerialNumber
>
> Data type: string. Access type: Read-only.
>
> Operating system product serial identification number.
>
> Example: "10497-OEM-0031416-71674"

To query the property value you will need to add a reference to `System.Management` and create an instance of `ManagementObjectSearcher` with the appropriate query. You can then use LINQ to extract the `SerialNumber` property value.

    const string queryString = "SELECT SerialNumber FROM Win32_OperatingSystem";

    string productId = (from ManagementObject managementObject in new ManagementObjectSearcher(queryString).Get()
                        from PropertyData propertyData in managementObject.Properties
                        where propertyData.Name == "SerialNumber"
                        select (string)propertyData.Value).FirstOrDefault();

    Console.WriteLine(productId ?? "What!? WMI is broken!");

That will give you the result you are after and will work on any version of Windows that you are likely to be using. I have successfully tested the code on the following operating systems.

- Windows XP SP3 (32-bit)
- Windows Vista Ultimate SP2 (64-bit)
- Windows 7 Ultimate (64-bit)
- Windows Server 2008 R2 (64-bit)
