---
title: Mocking support in Microsoft Velocity
description: Microsoft Velocity does not have mocking support, making it difficult for developers to unit test code that uses the application cache. Microsoft should provide interfaces or make methods virtual to improve the API's support for unit testing.
date: 2009-06-03
tags: [velocity]
---

I have been looking at the [Microsoft Distributed Cache](http://www.microsoft.com/downloads/details.aspx?FamilyId=B24C3708-EEFF-4055-A867-19B5851E7CD2&displaylang=en) and have found the been fairly impressed with the project. The download page offers a brief description of “Velocity”:

> "Velocity" is a distributed in-memory application cache platform for developing scalable, high-performance applications. "Velocity" can be used to cache any common language runtime (CLR) object and provides access through simple APIs. The key aspects of "Velocity" are distributed cache performance, scalability, and availability.

Being a fan of [TDD](http://www.testdriven.com/) (Test-Driven Development) and mocking in my unit tests I was keen to see how well the API supported mocking. It turns out that the support for mocking is no where to be found. None of the classes implement interfaces and the important methods that support general caching operations are not virtual. Looking at the sample code below you can see how not having an `IDataCache` interface on the `DataCache` class will make unit testing the `CustomerRepository` class in isolation difficult. Even though the `DataCache` instance is passed into the constructor the interaction with it cannot be mocked.

```csharp
public class CustomerRepository : ICustomerRepository
{
    private readonly DataCache _dataCache;

    public CustomerRepository(DataCache dataCache)
    {
        _dataCache = dataCache;
    }

    public Customer GetCustomer(int customerId)
    {
        Customer customer = (Customer)_dataCache.Get(customerId.ToString());
        if (customer == null)
        {
            customer = // Code that gets customer from the database.
            _dataCache.Put(customerId.ToString(), customer);
        }
        return customer;
    }
}
```

The idea of having my unit tests dependant on a running cache service is certainly not attractive, and while it would be possible to wrap the classes and provide an interface implementation of my own, this is not an attractive option either. The support for unit testing is now expected in the design of an API and Microsoft should be providing this for something as core as an application cache. I hope that the team at Microsoft sees this as a problem and provides some interfaces, or at very least makes the methods that support the primary caching operations virtual.
