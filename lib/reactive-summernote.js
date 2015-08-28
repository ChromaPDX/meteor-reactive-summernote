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
  } else {
    var collection = Mongo.Collection.get(template.data.collection);
    return collection.findOne(getDocumentId(template))
  }
}

var getDocumentId = function(template) {
  if (template.data._id) {
    return template.data._id;
  } else {
    return getDoc(template)._id;
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

    var userOptions = parseReactive(self.data.options);

    Object.keys(userOptions).forEach(function(key) { // apply user options
      options[key] = userOptions[key];
    });

    var templateKeys = ['collection', 'imageCollection', 's3bucket', 'doc', 's3subfolder', 's3storeName', 'getS3url', 'field', '_id', 'preview', 'updateMethod'];

    Object.keys(options).forEach(function(key) {
      if (self.data[key]) {
        if (!_.contains(templateKeys, key)) { // apply all 'summernote options' to options
          options[key] = self.data[key];
        }
      } else {
        if (_.contains(templateKeys, key)) { // apply all options to data context
          self.data[key] = options[key];
          delete options[key];
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
      var text = $editor.code();
      var callback = function() {
        $editor.code(text); //reset summernote's code to correct duplication of latest selection
      };
      if (self.data.updateMethod) {
        Meteor.call(self.data.updateMethod, getDocumentId(self), text, callback);
        if (Summernote.debug) {
          console.log('summernote calling method', self.data.updateMethod);
        }
      } else {
        if (!self.data.collection) {
          throw ('need collection data-var (String) to update document')
        }
        var updateDoc = {
          $set: {}
        };
        updateDoc.$set[self.data.field] = text;
        var collection = Mongo.Collection.get(self.data.collection);
        collection.update(getDocumentId(self), updateDoc, callback);
        if (Summernote.debug) {
          console.log('summernote updating doc', getDocumentId(self));
        }
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
        if (Summernote.debug) {
          console.log('summernote using CFS collection', imageCollectionName);
        }
      }
    });

    // Wait for image to return valid url() then insert it into summernote
    this.autorun(function() {
      var imageCollection = getFileCollection(self.data.imageCollection);
      var newImage = imageCollection.findOne(self.uploadedImage.get());
      if (newImage) {
        var url;
        if (self.data.s3bucket || self.data.getS3url) {
          var storeName = self.data.s3storeName || self.data.imageCollection;
          var folder = self.data.s3subfolder;
          if (self.data.getS3url) {
            url = self.data.getS3url(newImage, self.data.s3bucket, folder, storeName);
          } else {
            url = getS3url(newImage, self.data.s3bucket, folder, storeName);
          }
        } else if (newImage.url) {
          url = newImage.url();
        }
        if (url) {
          if (Summernote.debug) {
            console.log('summernote insert image link', url);
          }
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
