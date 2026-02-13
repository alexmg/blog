---
title: Setting your database Compatibility Level to match the SQL Server version
description: This article explains how to set the Compatibility Level of a database to match the version of SQL Server. It provides a script that can be used on SQL Server 2005 and 2008 instances.
date: 2010-03-07
tags: [sql-server]
---

It is not uncommon to have databases with a [Compatibility Level](http://msdn.microsoft.com/en-us/library/ms191137.aspx) that does not match the version of SQL Server they are running on. When you upgrade a SQL Server installation the databases retain a Compatibility Level that matches the version you upgraded from. The same applies to restoring or attaching databases from an earlier version.

I wrote the script below to set the Compatibility Level of a database to match the version of SQL Server. It is designed to work only on SQL Server 2005 and SQL Server 2008 instances. It uses the `sys.databases` view that does not exist in SQL Server 2000. I decided to use this view because I knew the script would not be executed on a SQL Server 2000 instance.

    DECLARE @database nvarchar(128)
    SET @database = 'Foo'

    DECLARE @databaseLevel tinyint
    SELECT @databaseLevel = compatibility_level FROM sys.databases WHERE name = @database
    IF @databaseLevel IS NULL
        BEGIN
            PRINT N'The database ''' + @database + ''' does not exist.'
            RETURN
        END

    PRINT N'Database Compatibility Level: ' + CONVERT(nvarchar, @databaseLevel)

    DECLARE @productVersion nvarchar(128)
    SELECT @productVersion = CONVERT(nvarchar(128), SERVERPROPERTY('ProductVersion'))
    PRINT N'Server Product Version: ' + @productVersion

    DECLARE @majorVersion tinyint
    SELECT @majorVersion = CONVERT(tinyint, SUBSTRING(@productVersion, 0, CHARINDEX('.' , @productVersion)))
    PRINT N'Server Major Version: ' + CONVERT(nvarchar, @majorVersion)

    DECLARE @serverLevel tinyint
    SET @serverLevel = @majorVersion * 10
    PRINT N'Server Compatibility Level: ' + CONVERT(nvarchar, @serverLevel)

    IF @databaseLevel = @serverLevel
        BEGIN
            PRINT N'The Compatibility Level for ''' + @database + ''' already matches the SQL Server version.'
            RETURN
        END

    DECLARE @query nvarchar(max)
    SET @query = N'ALTER DATABASE [' + @database + '] SET SINGLE_USER'
    EXEC sp_executesql @query

    EXEC sp_dbcmptlevel @database, @serverLevel
    PRINT N'The Compatibility Level for ''' + @database + ''' has been updated.'

    SET @query = N'ALTER DATABASE [' + @database + '] SET MULTI_USER'
    EXEC sp_executesql @query
