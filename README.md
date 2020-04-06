# keynote

A node library that parses Apple's keynote (.key) files.

## Usage

```bash
npm install --save keynoteParser
```

```javascript
const fs = require('fs')
const keynote = require('keynote-parser')

const keynoteFile = fs.createReadStream('myPresentation.key')

const data = await keynote(keynoteFile);

// use data
```

# Format for `data`

The data returned by this library is an object with numeric keys. Each record in the object contains a `messages` array with all the information from keynote you need. These message objects have a `type` that gives you information on what you're looking at (like information about s slide's layout, or a text chunk or styling) and also contains references to other objects in the `data` object. The numeric keys are thus useful to contruct a graph (or maybe it's a tree or DAG, but I can't confirm) between all these different messages. 

There are mny different types that you might see and so I haven't spent the time to document them well, so you'll have to rely on exploring the data structure yourself, looking at example projects _(TODO: add a link to example project)_ and looking through the [`.proto` files](/proto) that does a good job of showing you the different schemas for the data you might come accross

# Local setup

Just `git clone` and `npm install` as usual, but the important added step here is that you need to install `protoc` before you can run the `npm run build` step. The easiest way to get `protoc` setup is to go [here](https://github.com/google/protobuf/releases) and download one of the `protoc-{version}-{platform}.zip` files

# Thanks

This library would not have been possible if it wasn't for the all the work done by @obriensp in 2013 that he documented [here](https://github.com/obriensp/iWorkFileFormat/blob/master/Docs/index.md)