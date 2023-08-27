---
title: Is64BitOperatingSystem and Is64BitProcess in .NET 4.0
description: "The Environment class in .NET 4.0 contains two static properties, Is64BitOperatingSystem and Is64BitProcess, for checking bitness. The code for these properties is quite elegant and simple to follow, taking advantage of the fact that there are two versions of mscorlib.dll assembly: one for x86 and one for x64. It is also possible to check if the process is running under WOW64 (Windows-on-Windows 64-bit)."
pubDatetime: 2009-12-21
tags: [net-framework]
---

The `Environment` class in .NET 4.0 contains two new static properties for checking bitness: `Is64BitOperatingSystem` and `Is64BitProcess`. In the past I have had to answer these questions in code and wondered how the new properties ended up being implemented. It turns out that the code is actually quite elegant and simple to follow. They have taken advantage of the fact that there are two versions of the `mscorlib.dll` assembly: one for the x86 version of the framework and another for the x64 version.

The code in the 64-bit version of `mscorlib.dll` is really simple. If the 64-bit version is loaded, you must be running in a 64-bit process. And if your running in a 64-bit process, you must be running on a 64-bit version of Windows.

```csharp
public static bool Is64BitOperatingSystem
{
    [SecuritySafeCritical]
    get
    {
        return true;
    }
}

public static bool Is64BitProcess
{
    get
    {
        return true;
    }
}
```

The code in the 32-bit version of `mscorlib.dll` is almost as simple. If the 32-bit version is loaded, you must be running in a 32-bit process. In this case though it does not automatically mean you are running on a 32-bit version of Windows. It is possible that the process is running under the WOW64 ([Windows-on-Windows 64-bit](http://msdn.microsoft.com/en-us/library/aa384249%28VS.85%29.aspx)) subsystem on a 64-bit version of Windows.

The `IsWow64Process` function is used to determine if the process is running under WOW64. When this returns true you must be running on a 64-bit version of Windows because your process is running under the WOW64 subsystem. It is worth noting that the `IsWow64Process` function
in `kernel32.dll` is present in current 32-bit versions of Windows but you need to check for its existence to maintain compatibility with versions where it is not present.

```csharp
public static bool Is64BitOperatingSystem
{
    [SecuritySafeCritical]
    get
    {
        bool flag;
        return ((Win32Native.DoesWin32MethodExist("kernel32.dll", "IsWow64Process")
            && Win32Native.IsWow64Process(Win32Native.GetCurrentProcess(), out flag)) && flag);
    }
}

public static bool Is64BitProcess
{
    get
    {
        return false;
    }
}
```

I really like the implementation; it is easy to follow and reliable. You will no longer need for check the `IntPtr.Size` value that gets hardcoded into `mscorlib.dll` to determine the bitness of your process, and you wont have to write your own platform invoke code to check the bitness of the operating system either. What joy a couple of simple static properties can bring!
