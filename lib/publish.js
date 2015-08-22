Meteor.publish('summernoteImages', function(imageCollectionName, docId) {
  check(imageCollectionName, String);
  check(docId, String);
  var collection = FS._collections[imageCollectionName];
  if (collection) {
    return collection.find({
      documentId: docId,
      createdBy: this.userId
    });
  }
  return this.ready();
});
