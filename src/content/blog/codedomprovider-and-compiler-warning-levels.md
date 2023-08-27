---
title: CodeDomProvider and Compiler Warning Levels
description: By default, the CodeDomProvider does not return warning messages in the CompilerResults that are returned when compiling code in Visual Studio. The default warning level is 4, and you can use CompilerParameters.WarningLevel to set the warning level and CompilerParameters.TreatWarningsAsErrors to abort the compilation for warnings.
pubDatetime: 2010-09-01
tags: [csharp, codedom]
---

When generating code using the `CodeDomProvider` you may noticed that by default you do not get the same warning messages in the `CompilerResults` that you receive when compiling in Visual Studio. For example, lets take the simple code below that has a static method with two unused variables.

```csharp
public class Test
{
    static void testMethod()
    {
        int a;
        int b = 1;
    }
}
```

The code above when compiled in Visual Studio will result in two warning messages appearing in the **Error List** window.

![Warnings in Error List](/images/blog/Error-list.png)

On the CodeDOM side we can confirm with a simple unit test that the default value for `CompilerParameters.WarningLevel` does not cause the two warnings to be returned when the same code is compiled with the `CodeDomProvider`.

```csharp
[Test]
public void DefaultWarningLevel()
{
    StringBuilder snippet = new StringBuilder();
    snippet.AppendLine("public class Test");
    snippet.AppendLine("{");
    snippet.AppendLine("    static void testMethod()");
    snippet.AppendLine("    {");
    snippet.AppendLine("        int a;");
    snippet.AppendLine("        int b = 1;");
    snippet.AppendLine("    }");
    snippet.AppendLine("}");

    CodeDomProvider provider = CodeDomProvider.CreateProvider("C#");
    CompilerParameters parameters = new CompilerParameters {GenerateInMemory = true};

    CompilerResults results = provider.CompileAssemblyFromSource(parameters, snippet.ToString());
    Assert.That(results.Errors.Cast<CompilerError>().Any(r => r.IsWarning), Is.False);
}
```

If you check the **Build** tab in the **Properties** window for a new project in Visual Studio you can see that the default warning level is 4.

![Default Warning Level](/images/blog/Default-Warning-Level.png)

The MSDN [documentation](<http://msdn.microsoft.com/en-us/library/13b90fz7(VS.71).aspx>) tells us that the valid warning levels are 0 through 4.

- 0 - Turns off emission of all warning messages.
- 1 - Displays severe warning messages.
- 2 - Displays level 1 warnings plus certain, less-severe warnings, such as warnings about hiding class members.
- 3 - Displays level 2 warnings plus certain, less-severe warnings, such as warnings about expressions that always evaluate to **true** or **false**.
- 4 - Displays all level 3 warnings plus informational warnings. This is the default warning level at the command line.

Another simple unit test shows that setting `CompilerParameters.WarningLevel` to 4 will result in the same warnings as Visual Studio being returned.

```csharp
[Test]
public void WarningLevelFour()
{
    StringBuilder snippet = new StringBuilder();
    snippet.AppendLine("public class Test");
    snippet.AppendLine("{");
    snippet.AppendLine("    static void testMethod()");
    snippet.AppendLine("    {");
    snippet.AppendLine("        int a;");
    snippet.AppendLine("        int b = 1;");
    snippet.AppendLine("    }");
    snippet.AppendLine("}");

    CodeDomProvider provider = CodeDomProvider.CreateProvider("C#");
    CompilerParameters parameters = new CompilerParameters
    {
        GenerateInMemory = true,
        WarningLevel = 4
    };

    CompilerResults results = provider.CompileAssemblyFromSource(parameters, snippet.ToString());
    Assert.That(results.Errors.Cast<CompilerError>().Count(r => r.IsWarning), Is.EqualTo(2));
    Assert.That(results.Errors[0].ErrorText, Is.StringContaining("The variable 'a' is declared but never used"));
    Assert.That(results.Errors[1].ErrorText, Is.StringContaining("The variable 'b' is assigned but its value is never used"));
}
```

We now have the same warnings that Visual Studio provides, even though the [documentation](http://msdn.microsoft.com/en-us/library/system.codedom.compiler.compilerparameters.warninglevel.aspx) for CompilerParameters.WarningLevel appears to be a little misleading.

> Gets or sets the warning level at which the compiler aborts compilation.

The compilation will not be aborted for a warning unless the `/warnaserror` option is provided to the compiler. When compiling with the CodeDOM you use `CompilerParameters.TreatWarningsAsErrors` to abort the compilation for warnings. Needless to say Visual Studio has the same option available on the **Build**tab in the project **Properties**window.
