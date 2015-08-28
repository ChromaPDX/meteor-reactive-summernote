# chroma:reactive-summernote
## Example
[http://meteorpad.com/pad/GBhGLv9SLJu4dgg4p/reactive-summernote](http://meteorpad.com/pad/GBhGLv9SLJu4dgg4p/reactive-summernote)

## Installation
this package does not provide summernote's bootstrap dependencies such that you may customize your version of bootstrap.

If you're not already using bootstrap, you'll need to add it first.

```bash
meteor add twbs:bootstrap
```

this package client side only

`chroma:reactive-summernote` is available on [Atmosphere](https://atmospherejs.com/chroma/reactive-summernote):

```bash
meteor add chroma:reactive-summernote
```

## Usage
### collection options and summernote options can be added inline as template data args and/or with a helper

```bash
<Template name="myTemplate">
  {{> summernote a_data_option=a_data_value options={{summernoteOptions}}}}
</Template>

Template.myTemplate.helpers({
  summernoteOptions: {
    collection: 'notes'
    doc: this.currentDoc
    field: 'markup'
  }
})
```

### options for document
required arguments:

```bash
collection: String
field: String
```

and one of these for a document:

```bash
_id: String
```

OR

```bash
doc: Document or Object
```

OR (make it reactive)

```bash
doc: ReactiveVar or Function
```

### options for images
By default (summernote) images are 'pasted in' as base64 encoded text.

To use CFS instead:

```bash
imageCollection: String
```

To use CFS:S3 and insert direct links (make sure CFS config sets them public on the bucket):

```bash
s3bucket: String
s3subfolder: Optional(String)

s3 link by default calculated as
baseUrl = "https://" + bucketName + ".s3.amazonaws.com/" + s3subfolder "/" + copies[storeName || imageCollectionName].key
```

OR provide insert link generator as function
```
getS3link: function(fileObj){
  return "https://" + ?
}
```

## Summernote Options
Same as collection options, declare these either inline and/or in a template helper options passed to $summernote(options) see

see [http://summernote.org/#/getting-started](http://summernote.org/#/getting-started)

```
<Template name="myTemplate">
  {{> summernote a_data_option=a_data_value options={{summernoteOptions}}}}
</Template>

Template.myTemplate.helpers({
  summernoteOptions: {
    height: 300,                 // set editor height

    minHeight: null,             // set minimum height of editor
    maxHeight: null,             // set maximum height of editor

    focus: true,                 // set focus to editable area after initializing summernote
  }
})
```

## Version history
- `0.1.0` - adding support for 'doc' data member as ReactiveVar and Function in addition to object for reactivity
- `0.0.5` - Test available on meteor pad.
- `0.0.1` - Initial publish.

## Notes
the summernote project is here: [https://github.com/summernote/summernote](https://github.com/summernote/summernote)

this package uses code based on greenewolf's reactive summernote solution here: [https://github.com/summernote/summernote/issues/1064](https://github.com/summernote/summernote/issues/1064)

## Contributing
yes, please.

--------------------------------------------------------------------------------

[ChromaPDX](http://github.com/ChromaPDX)

![](https://avatars0.githubusercontent.com/u/5441664?v=3&s=90)
