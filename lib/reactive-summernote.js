Summernote = {};

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
    headers: {
    },
    success: function(data) {
      onSuccess();
      console.log('got response', data);
    },
    error: function(err) {
      console.log('s3 not ready', err);
    }
  };
  $.ajax(corsConfig);
}

var getFileCollection = function(context) {
  if (typeof context.data.collection === 'string') {
    return FS._collections[context.data.imageCollection] || window[context.data.imageCollection];
  }
};

var defaultOptions = function(context) {
  var options = {
    height: 360,
    minHeight: 360
  };
  if (context.data.imageCollection) {
    var imageCollection = getFileCollection(context);
    options.onImageUpload = function(files, editor, $editable) {
      file = new FS.File(files[0]);
      file.createdBy = Meteor.userId();
      file.documentId = context.data._id;
      imageCollection.insert(file, function(err, fileObj) {
        if (!err) {
          context.uploadedImage.set(fileObj._id);
        }
      });
    }
  }
  return options;
}

var insertImage = function(context, url) {
  var element = context.find('div.summernote');
  if (!element) return;
  element = $(element);
  element.summernote('insertImage', url, 'image');
  context.uploadedImage.set(null);
}

Template.summernote.onCreated(function() {
  if (this.data.imageCollection) {
    var imageCollection = getFileCollection(this);
    this.uploadedImage = new ReactiveVar();

    var self = this;

    // Subscribe to all file createdby this user, and part of this summernote doc
    this.autorun(function() {
      var _id = self.data._id;
      if (_id) {
        return Meteor.subscribe('summernoteImages', self.data.imageCollection, _id);
      }
    });

    // Wait for image to return valid url() then insert it into summernote
    this.autorun(function() {
      var newImage = imageCollection.findOne(self.uploadedImage.get());
      if (newImage) {
        var url;
        var bucket = self.data.s3Bucket || Summernote.s3Bucket;
        if (bucket) {
          var storeName = self.data.storeName || Summernote.s3Bucket || self.data.imageCollection;
          var folder = self.data.s3subFolder || Summernote.s3subFolder;
          s3url = getS3url(newImage, bucket, folder, storeName);
          if (s3url) {
            insertImage(self, s3url);
            // var timer = setInterval(function() {
            //   checkS3url(s3url, function() {
            //     insertImage(self, s3url);
            //     clearInterval(timer);
            //   });
            // }, 100);
            // setTimeout(function() {
            //   clearInterval(timer);
            // }, 2000);
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
    if (_.isEmpty(this)) return '</br>';
    var collection = this.collection || this.options.collection;
    var Collection = Mongo.Collection.get(collection);
    var field = this.field || this.options.field;
    var fields = {};
    fields[field] = 1;
    var _id = this._id || this.options._id;
    return Collection.findOne(_id, {
      field: fields
    })[field] || '</br>';
  }
});

Template.summernote.onRendered(function() {
  var templateInstance = this;
  var element = this.find('div.summernote');
  if (!element) return;
  element = $(element);
  var data = this.data || {}; //options set explicitly in html template
  var options = this.data.options || defaultOptions(this); //options set via javascript options variable

  Object.keys(data).forEach(function(key) { //merge with priority to data
    if (key == 'options') return;
    options[key] = data[key];
  });
  data = {};
  ['collection', 'imageCollection', 'field', '_id', 'enabled'].forEach(function(key) {
    data[key] = options[key]; //data for meteor update
    delete options[key]; //leaves only the options to pass to summernote
  })

  var save = function(event) {
    var text = element.code();

    var callback = function() {
      element.code(text); //reset summernote's code to correct duplication of latest selection
    };

    if (data.updateMethod) {
      Meteor.call(data.updateMethod, data._id, text, callback);
    } else {
      var updateDoc = {
        $set: {}
      };
      updateDoc.$set[data.field] = text;
      Collection = Mongo.Collection.get(data.collection);
      Collection.update(data._id, updateDoc, callback);
    }
  }

  options.onBlur = save;

  //summernote has no enable/disable method, so we create and
  //destroy based on the reactive variable enabled
  this.autorun(function() {
    var newData = this.templateInstance().data;
    var newOptions = this.templateInstance().data.options;
    if (newData.enabled) { //how can I check if summernote is already enabled?
      element.summernote(options);
    } else {
      element.destroy();
    }
    //add handler to reactively change other options or callbacks
    //Can't find anything in the summernote documentation
    // that says how to change any parameters after
    //the editor is initialized. May not be possible
    /*_.each(newOptions, function(value, key){
        if (!(key in options) || !_.isEqual(value,options[key])) {
          element.summernote().Setoption(key,value); //how to do this?
          options[key] = value; //keep this up to date
        }
    })*/
  })

});
