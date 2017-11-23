# updeux

updeux makes your app run and update without any downtime.

> updeux is in early development and should only be used to help the contributor to test it :)

## Usage

updeux doesn't have any cli options now. See [how to set options](#options)

To launch it, all you have to do is:

```
$ updeux
```

After that updeux will listen to your terminal inputs and you'll be able to control it via these actions:

+ **reset**: update updeux options and then update workers
+ **start**: start workers
+ **status**: display state information (now it just displays the list of all workers)
+ **stop**: stop workers
+ **update**: update the workers

## Options

updeux has several options to handle your needs. You can set options by using a **.updeuxrc** (JSON) or using the `updeuxrc` property in the **package.json**.

+ [maxFailuresByUpdate](#maxFailuresByUpdate) : `number` = `5`
+ [maxWorker](#maxWorker) : `number` = `os.cpus().length`
+ [keepFresh](#keepFresh) : `bool` = `false`
+ [require](#require) : `Array` = `[]`
+ [shutdownDelay](#shutdownDelay) : `number`= `5000`
+ [src](#src) : `string`= `./index.js`
+ [watchDebounce](#watchDebounce) : `number` = `100`

### options.maxFailuresByUpdate : `number` = `5`

Number of failed attempts to run workers by update before stopping to try until next update.

### options.maxWorker : `number` = `os.cpus().length`

Maximum number of workers to use.

### options.keepFresh : `bool` = `false`

If workers are refreshed automatically when there are changes in the source.

### options.require : `Array` = `[]`

Module to require before the source.

```
{
  require: ["babel-register"]
}
```

### options.shutdownDelay : `number`= `5000`

Duration in *ms* to wait before killing a worker that was not shutdown after being asked to.

### options.src : `string`= `./index.js`

Source file to run. If a folder is given, updeux will try to run the index.js file in it.

### options.watchDebounce : `number` = `100`

Debounce delay in *ms* applied to workers update on file change.
