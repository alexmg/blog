---
title: Limiting CTE recursion depth in SQL Server
description: This article provides a few different methods for limiting the recursion depth of Common Table Expressions (CTEs) in SQL Server, such as reaching the default maximum recursion depth, setting the MAXRECURSION query hint, or manually controlling the recursion level.
pubDatetime: 2009-12-14
tags: [sql-server]
---

I can think of a few different cases that will result in the recursion of a CTE ([Common Table Expression](http://technet.microsoft.com/en-us/library/ms186243.aspx)) in SQL Server coming to an end:

- You run out records to recursively select and your result is returned without error.
- You reach the default maximum recursion depth of 100 and an error occurs.
- You reach the maximum recursion depth you specified using the `MAXRECURSION` query hint (a value between 1 and 32767) and an error occurs.
- You set the maximum recursion depth to have no limit using the `MAXRECURSION` query hint (a value of 0) and crash your server due to an infinite loop.
- You reach a maximum recursion depth that you manually control in your query.

Obviously, some of these cases have a more desirable outcome than others. While the `MAXRECURSION` query hint does provide a mechanism to ensure you do not end up in an infinite loop, reaching the limit it imposes causes an error to occur, and that is something to be avoided.

It is also possible to set the `MAXRECURSION` query hint to 0 which will result in no limit being applied, so without a mechanism of your own in place to limit the recursion depth, you have definitely made it easier to get yourself into trouble.

I prefer to manually restrict the recursion level and set the `MAXRECURSION` query hint to be the same if my restriction is greater than 100. Remember, 100 is the default limit when the `MAXRECURSION` query hint is not present, and you must exceed and not just reach the limit for the error to occur.

The query below is manually limited to 50 levels of recursion. There is no need to specify the `MAXRECURSION` query hint because the default of 100 will never be reached.

```sql
WITH LimitedLoop AS
(
    SELECT 0 AS RecursionLevel

    UNION ALL

    SELECT (LimitedLoop.RecursionLevel + 1) AS RecursionLevel
    FROM LimitedLoop
    WHERE (LimitedLoop.RecursionLevel + 1) <= 50
)
SELECT * FROM LimitedLoop
```

This query is manually limited to 200 levels of recursion. The `MAXRECURSION` query hint is specified because its default value of 100 is less than the manually imposed limit.

```sql
WITH LimitedLoop AS
(
    SELECT 0 AS RecursionLevel

    UNION ALL

    SELECT (LimitedLoop.RecursionLevel + 1) AS RecursionLevel
    FROM LimitedLoop
    WHERE (LimitedLoop.RecursionLevel + 1) <= 200
)
SELECT * FROM LimitedLoop
OPTION (MAXRECURSION 200)
```

It is also worth noting that the first query will return 51 rows and the second 201 rows. This is because the first record returned containing the 0 in the `RecursionLevel` column is part of the base result set and not the recursive invocation.
