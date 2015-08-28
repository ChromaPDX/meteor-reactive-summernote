Summernote = {
  'debug': 0,
  options: {
    height: 240,
    minHeight: 120
  }
};

getS3url = function(fileObj, bucketName, subFolder, storeName) {
  if (fileObj.isMounted() && fileObj.getFileRecord()) {
    if (fileObj.copies) {
      baseUrl = "https://" + bucketName + ".s3.amazonaws.com/";
      if (subFolder) {
        baseUrl = baseUrl + subFolder + "/";
      }
      store = fileObj.copies[storeName];
      return baseUrl + store.key;
    }
  }
  return null;
};

var getFileCollection = function(name) {
  if (typeof name === 'string') {
    return FS._collections[name] || window[name];
  }
};

var parseReactive = function(doc) {
  if (typeof doc === "function") {
    return doc();
  } else if (doc instanceof ReactiveVar) {
    return doc.get();
  } else {
    return doc;
  }
}

var getDoc = function(template) {
  var doc = template.data.doc
  if (doc) {
    return parseReactive(doc);
  }
  return Collection.findOne(getDocumentId(template))
}

var getDocumentId = function(template) {
  if (template.data.doc) { // potentially reactive
    return getDoc(template)._id
  } else {
    return template.data._id || template.data.options._id
  }
}

var insertImage = function(context, url) {
  var element = context.find('div.summernote');
  if (!element) return;
  element = $(element);
  element.summernote('insertImage', url, 'image');
  context.uploadedImage.set(null);
}

Template.summernote.onRendered(function() {
  var self = this;
  self.uploadedImage = new ReactiveVar;
  // update text should it be changed from elsewhere
  this.autorun(function() {
    var $editor = $(self.firstNode);

    var options = Summernote.options;

    Object.keys(self.data.options).forEach(function(key) { //merge with priority to data
      options[key] = self.data.options[key];
    });

    var templateKeys = ['collection', 'imageCollection', 's3bucket', 'doc', 's3subfolder', 'field', '_id', 'preview'];

    Object.keys(options).forEach(function(key) {
      if (!self.data[key]) {
        if (_.contains(templateKeys, key)) {
          self.data[key] = options[key];
          delete options[key];
        }
      } else {
        if (!_.contains(templateKeys, key)) {
          options[key] = self.data[key];
        }
      }
    });

    if (self.data.imageCollection) {
      var imageCollection = getFileCollection(self.data.imageCollection);
      options.onImageUpload = function(files, editor, $editable) {
        file = new FS.File(files[0]);
        file.createdBy = Meteor.userId();
        file.documentId = getDocumentId(self);
        imageCollection.insert(file, function(err, fileObj) {
          if (!err) {
            self.uploadedImage.set(fileObj._id);
          }
        });
      }
    }

    var save = function(event) {
      if (!self.data.collection) {
        throw ('need to pass collection name to template in order to update document')
      }
      var text = $editor.code();
      var callback = function() {
        $editor.code(text); //reset summernote's code to correct duplication of latest selection
      };
      if (self.data.updateMethod) {
        Meteor.call(self.data.updateMethod, getDocumentId(self), text, callback);
      } else {
        var updateDoc = {
          $set: {}
        };
        updateDoc.$set[self.data.field] = text;
        var collection = Mongo.Collection.get(self.data.collection);
        collection.update(getDocumentId(self), updateDoc, callback);
      }
    }

    if (!options.onBlur) {
      options.onBlur = save;
    }

    if (!parseReactive(self.data.preview)) {
      $editor.summernote(options);
      if (Summernote.debug) {
        console.log('summernote options', options);
        console.log('summernote collection settings', self.data);
      }
    }

    if (getDoc(self)) {
      $editor.code(getDoc(self)[self.data.field]);
    }
  });

  if (self.data.imageCollection || self.data.options.imageCollection) {

    this.autorun(function() {
      var _id = getDocumentId(self)
      if (_id) {
        imageCollectionName = self.data.imageCollection || self.data.options.imageCollection
        Meteor.subscribe('summernoteImages', imageCollectionName, _id);
      }
    });

    var imageCollection = getFileCollection(imageCollectionName);

    // Wait for image to return valid url() then insert it into summernote
    this.autorun(function() {
      var newImage = imageCollection.findOne(self.uploadedImage.get());
      if (newImage) {
        var url;
        var bucket = self.data.s3bucket || Summernote.s3bucket;
        if (bucket) {
          var storeName = self.data.storeName || Summernote.s3bucket || self.data.imageCollection;
          var folder = self.data.s3subfolder || Summernote.s3subfolder;
          s3url = getS3url(newImage, bucket, folder, storeName);
          if (s3url) {
            insertImage(self, s3url);
          }
        } else {
          url = newImage.url();
        }
        if (url) {
          insertImage(self, url);
        }
      }
    });
  }

});

Template.summernote.helpers({
  content: function() {
    var field = this.field || this.options.field;
    if (_.isEmpty(this)) return '</br>';
    if (this.doc) {
      return this.doc[field]
    } else {
      var collection = this.collection || this.options.collection;
      var Collection = Mongo.Collection.get(collection);
      var fields = {};
      fields[field] = 1;
      var _id = getDocumentId(Template.instance());
      return Collection.findOne(_id, {
        fields: fields
      })[field] || '</br>';
    }
  }
});

checkS3url = function(url, onSuccess) {
  // THIS WILL NOT WORK UNLESS YOU HAVE A CORS POLICY ON YOUR BUCKET
  // <CORSConfiguration>
  //  <CORSRule>
  //    <AllowedOrigin>*</AllowedOrigin>
  //    <AllowedMethod>GET</AllowedMethod>
  //  </CORSRule>
  // </CORSConfiguration>
  if (!url) {
    return;
  };
  var corsConfig = {
    type: 'HEAD',
    url: url,
    contentType: 'image/jpeg',
    xhrFields: {
      withCredentials: false
    },
    headers: {},
    success: function(data) {
      onSuccess();
    },
    error: function(err) {}
  };
  $.ajax(corsConfig);
}
