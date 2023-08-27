---
title: DomainDataSource Extension Methods
description: A post by Jeff Handley explains how to add or edit an item in the DomainDataSource in .NET RIA Services, and a comment by David Yack on the forum provides his inherited DomainDataSource class which adds methods for adding and editing items. This code was then turned into a set of extension methods that can be used on any DomainDataSource.
pubDatetime: 2009-08-13
tags: [net-ria-services, silverlight]
---

To add a new item or edit an existing item in the `DomainDataSource` that ships with the [.NET RIA Services](http://www.microsoft.com/downloads/details.aspx?FamilyID=76bb3a07-3846-4564-b0c3-27972bcaabce&displaylang=en), you must first cast the `DataView` property to an `IEditableCollectionView`. [Jeff Handley](http://jeffhandley.com/Default.aspx) does a good job of explaining the reason for this in his [DomainDataSource.DataView](http://jeffhandley.com/archive/2009/07/21/domaindatasource-dataview.aspx) post.

[David Yack](http://blog.davidyack.com/) left a comment on the .NET RIA Services [forum](http://silverlight.net/forums/53.aspx) with a link to his [post](http://blog.davidyack.com/journal/2009/7/21/ria-services-domaindatasourcedata-not-updating.html) where he shares his inherited `DomainDataSource` class. The inherited class adds methods for adding and editing items that do all the casting to `IEditableCollectionView` for you. I really liked the idea but didn’t want to create my own derived class, so I took his implementation and turned it into a set of extension methods that are exposed on all `DomainDataSource` instances.

**Update (24-09-2009): Added a `Remove` extension method. Thanks to Phil Steel for posting the code in his comment.**

```csharp
/// <summary>
///    Extensions to the <see cref="DomainDataSource"/> for adding and editing items.
/// </summary>
public static class DomainDataSourceExtensions
{
    /// <summary>
    /// Adds a new item to the collection.
    /// </summary>
    /// <typeparam name="T">The type of the item to add.</typeparam>
    /// <param name="source">The <see cref="DomainDataSource"/> being extended.</param>
    /// <returns>The newly added item.</returns>
    public static T AddNew<T>(this DomainDataSource source)
    {
        IEditableCollectionView collection = ((IEditableCollectionView)source.DataView);
        return (T)collection.AddNew();
    }

    /// <summary>
    /// Edits an item in the collection.
    /// </summary>
    /// <param name="source">The <see cref="DomainDataSource"/> being extended.</param>
    /// <param name="itemToEdit">The item to edit.</param>
    public static void EditItem(this DomainDataSource source, object itemToEdit)
    {
        IEditableCollectionView collection = ((IEditableCollectionView)source.DataView);
        collection.EditItem(itemToEdit);
    }

    /// <summary>
    /// Removes an item from the collection.
    /// </summary>
    /// <param name="source">The <see cref="DomainDataSource"/> being extended.</param>
    /// <param name="itemToRemove">The item to remove.</param>
    public static void Remove(this DomainDataSource source, object itemToRemove)
    {
        IEditableCollectionView collection = ((IEditableCollectionView)source.DataView);
        collection.Remove(itemToRemove);
    }

    /// <summary>
    /// Commits the add or edit transaction.
    /// </summary>
    /// <param name="source">The <see cref="DomainDataSource"/> being extended.</param>
    public static void CommitNewAndEdit(this DomainDataSource source)
    {
        IEditableCollectionView collection = ((IEditableCollectionView)source.DataView);
        if (collection.IsAddingNew)
        {
            collection.CommitNew();
        }
        if (collection.IsEditingItem)
        {
            collection.CommitEdit();
        }
    }

    /// <summary>
    /// Cancels the add or edit transaction.
    /// </summary>
    /// <param name="source">The <see cref="DomainDataSource"/> being extended.</param>
    public static void CancelNewAndEdit(this DomainDataSource source)
    {
        IEditableCollectionView collection = ((IEditableCollectionView)source.DataView);
        if (collection.IsAddingNew)
        {
            collection.CancelNew();
        }
        if (collection.IsEditingItem)
        {
            collection.CancelEdit();
        }
    }
}
```

Thanks for sharing the code David.
