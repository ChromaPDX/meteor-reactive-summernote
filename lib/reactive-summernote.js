Template.summernote.helpers({
  content: function() {
    if (_.isEmpty(this)) return '</br>';
    var collection = this.collection || this.options.collection;
    var Collection = Mongo.Collection.get(collection);
    var field = this.field || this.options.field;
    var fields = {};
    fields[field] = 1;
    var _id = this._id || this.options._id;
     return Collection.findOne(_id,{field:fields})[field] || '</br>';
  }
});

Template.summernote.onRendered(function() {
  var templateInstance = this;
  var element = this.find('div.summernote');
  if (!element) return;
  element = $(element);
  var data = this.data || {}; //options set explicitly in html template
  var options = this.data.options || {}; //options set via javascript options variable
  Object.keys(data).forEach(function(key) { //merge with priority to data
    if (key == 'options') return;
    options[key] = data[key];
  });
  data = {};
  ['collection','field','_id','enabled'].forEach(function(key){
    data[key] = options[key]; //data for meteor update
    delete options[key]; //leaves only the options to pass to summernote
  })

  var method = 'update' + _.rtrim(data.collection,'s'); //if collection = Posts, method=updatePost
  var saveText = function(event) { //called on popover blur event
    var elementID = event[0].target.id;
    var popoverVisible = false;
    ['#note-popover-','#note-dialog-'].forEach(function(s) {
      var selector = elementID.replace('note-editor-',s);
      _.each($(selector).children(),function(c) {
        if ($(c).is(':visible')) {
          popoverVisible = true
          return false;
        }
      })
    });
    if (popoverVisible) return;
    //popover not visible so go ahead and save
    //if the popover is visible when a click event occurs
    //outside of the element and all associated popovers and dialogs,
    //this function is called again with a false event that passes through
    var item = {
      _id: data._id
    }
    var text = element.code();
    item[data.field] = text;
    Meteor.call(method,item,function() {
      element.code(text); //reset summernote's code to correct duplication of latest selection
    });
  }
  options.onBlur = saveText;

  //check for clicks outside open popover
  //and make sure popover is closed and save is called
  // ... second-order correction to false blur handler in save function
  $(document).click(function(event) {
    var elementID = element.attr('id') || '';
    if (!elementID) return; //summernote editor disabled?
    if ($(event.target).closest('#'+elementID).length) return; //clicked in edited element
    var popoverVisible = false; //check if this popover is visible
    var clickedIn = false;  //check if click was inside the popover or related menus or dialogs
    ['#note-popover-','#note-dialog-'].forEach(function(s) {
      var selector = elementID.replace('note-editor-',s);
      if($(event.target).closest(selector).length)
        clickedIn = true;
      _.each($(selector).children(),function(c) {
        if ($(c).is(':visible'))
          popoverVisible = true
      })
    });
    if (!popoverVisible) return; //when popover not visible, click outside of element will be caught with normal blur event
    if (clickedIn) return; //clicked one of the popover's menus, buttons or dialogs ... don't save
    //At this point, we've established that the user clicked
    //outside all associated elements and popovers (while the popover was visible)

    var popoverSelector = elementID.replace('note-editor-','#note-popover-');
    popover = $(popoverSelector); //container for all popover elements - link, image, air
    popover.children().hide(); // hide it
    saveText([{target:{id:'notAnElement'}}]); //and save any changes
                                             //passing false event to bypass false blur handler
  });

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
