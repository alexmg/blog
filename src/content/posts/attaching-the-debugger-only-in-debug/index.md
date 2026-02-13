---
title: Attaching the Debugger only in Debug
description: This article discusses how to use the ConditionalAttribute to create a helper class that includes methods that should only be called when the DEBUG symbol is defined. This way, when you compile with the RELEASE symbol defined all calls to the methods will simply be excluded from the generated MSIL.
date: 2010-06-16
tags: [csharp, visual-studio]
---

I noticed an [article](http://feedproxy.google.com/~r/Vistadb/~3/X6jYbiDOjFQ/post.aspx) on the [Infinite Codex](http://infinitecodex.com/) blog that demonstrates how to debug CLR Stored Procedures. The example uses a `#if` [preprocessor directive](http://msdn.microsoft.com/en-us/library/ed8yd1ha.aspx) to compile the debugging code only if the `DEBUG` symbol is defined. Personally, I find using the `#if` directive makes your code look rather ugly, and accidentally including code inside the directive that you did not intend to becomes a real possibility. My preferred solution is to use the `ConditionalAttribute` to refactor such code out into a separate method.

> Applying ConditionalAttribute to a method indicates to compilers that a call to the method should not be compiled into Microsoft intermediate language (MSIL) unless the conditional compilation symbol that is associated withConditionalAttribute is defined.

Using this approach you can create a helper class that includes methods that should only be called when the `DEBUG` symbol is defined. When you compile with the `RELEASE` symbol defined all calls to the methods will simply be excluded from the generated MSIL.

```csharp
public static class Debugging
{
    [Conditional("DEBUG")]
    public static void Break()
    {
        Debugger.Break();
    }
}
```

If you run the code below in Debug mode with the debugger attached, a breakpoint will occur immediately after the first `Console.WriteLine` method call.

```csharp
class Program
{
    static void Main()
    {
        Console.WriteLine("Before the Debugging.Break() method.");
        Debugging.Break();
        Console.WriteLine("After the Debugging.Break() method.");
        Console.ReadLine();
    }
}
```

When the debugger is not attached and you compiled in Debug mode, the Visual Studio Just-In-Time Debugger dialog is presented for you to selected a debugger to attach with.

![Visual Studio Just-In-Time Debugger Dialog](./JIT-Debugger-Dialog.png)

If you run in Release mode no breakpoint will be hit when the debugger is attached, and the Visual Studio Just-In-Time Debugger dialog will not be presented when you run without the debugger attached.
