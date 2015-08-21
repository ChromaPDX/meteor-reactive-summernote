Meteor.publish('summernoteImages', function(collectionName, docId) {
  check(collectionName, String);
  check(docId, String);
  var collection = FS._collections[collectionName] || global[collectionName];
  if (collection) {
    return collection.find({
      documentId: docId,
      createdBy: this.userId
    });
  }
});
