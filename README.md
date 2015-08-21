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

```bash
<Template name="myTemplate">
  {{>summernote collection='MyCollection' field='myField' _id=_id}}
</Template>
```

OR to enable CFS images

```bash
<Template name="myTemplate">
  {{>summernote collection='MyCollection' field='myField' _id=_id imageCollection='attachedImages'}}
</Template>
```

OR to enable CFS images with S3 support

```bash
<Template name="myTemplate">
  {{>summernote collection='MyCollection' field='myField' _id=_id imageCollection='attachedImages' s3bucket:'my-site-image-bucket'}}
</Template>
```

## Version history

- `0.0.1` - Initial publish.

## Contributing

yes, please.

***

[ChromaPDX](http://github.com/ChromaPDX)
