# chroma:reactive-summernote

summernote is here:

https://github.com/summernote/summernote

this template is based on greenewolf's solution here:

https://github.com/summernote/summernote/issues/1064

## Example

http://meteorpad.com/pad/v4HnDcwAarAxrAQtn/chroma:summernote

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

## Summernote

### with images embedded as base64

```bash
<Template name="myTemplate">
  {{>summernote collection='MyCollection' field='myField' _id=_id}}
</Template>
```

### using meteor CFS

```bash
<Template name="myTemplate">
  {{>summernote collection='MyCollection' field='myField' _id=_id imageCollection='attachedImages'}}
</Template>
```

### using CFS with S3 direct url support

```bash
  {{>summernote collection='MyCollection' field='myField' _id=_id imageCollection='attachedImages' s3bucket:'my-site-image-bucket'}}
```

jade, with s3 bucket subfolder specified

```bash
+summernote(collection='copyMarkup' field='markup' imageCollection='attachedImages' s3Bucket=s3Bucket s3subFolder='offering' _id=doc._id)
```

## Options

```bash
{{>summernote options=???}}
```
options is a json object passed to $summernote(options) see

see http://summernote.org/#/getting-started
```
{
  height: 300,                 // set editor height

  minHeight: null,             // set minimum height of editor
  maxHeight: null,             // set maximum height of editor

  focus: true,                 // set focus to editable area after initializing summernote
}
```
## Version history

- `0.0.5` - Test available on meteor pad.
- `0.0.1` - Initial publish.

## Contributing

yes, please.

***

[ChromaPDX](http://github.com/ChromaPDX)

![](https://avatars0.githubusercontent.com/u/5441664?v=3&s=90)
