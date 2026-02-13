---
title: Renaming a computer running SQL Server
description: After renaming a computer running SQL Server, the value returned for @@SERVERNAME may not be updated. To fix this, run the sp_dropserver and sp_addserver stored procedures using the current @@SERVERNAME value for the old name and SERVERPROPERTY('ServerName') for the new. Restart the service for the change to take effect.
date: 2009-01-15
tags: [sql-server]
---

You may have noticed that after renaming a computer running SQL Server that the value returned for `@@SERVERNAME` has not been updated. It returns the computer name as it was during installation of SQL Server. The `SERVERPROPERTY` function does take into consideration changes made to the computer name when the `ServerName` property is requested.

To fix the server name you need to run the `sp_dropserver` and `sp_addserver` stored procedures. Instead of typing in the computer and instance names you can use the current `@@SERVERNAME` value for the old name, and `SERVERPROPERTY('ServerName')` for the new. The TSQL below fixes the name of your local SQL Server and works for default and named instances. You will need to restart the service for the change to take affect.

    EXEC sp_dropserver @@SERVERNAME
    GO

    DECLARE @server nvarchar(128)
    SELECT @server = CAST(SERVERPROPERTY('ServerName') AS nvarchar(128))
    EXEC sp_addserver @server, 'local'
    GO

Here are some links if your keen further information.

- [@@SERVERNAME (Transact-SQL)](http://msdn.microsoft.com/en-us/library/ms187944.aspx)
- [SERVERPROPERTY (Transact-SQL)](http://msdn.microsoft.com/en-us/library/ms174396.aspx)
- [sp_addserver (Transact-SQL)](http://msdn.microsoft.com/en-us/library/ms174411.aspx)
- [sp_dropserver (Transact-SQL)](http://msdn.microsoft.com/en-us/library/ms174310.aspx)
- ["Renaming A Server" Topic in SQL Server Books Online is Incomplete](http://support.microsoft.com/kb/303774/en-us)

The last link refers to a KB article for SQL Server 2000 but still contains relevant information.
