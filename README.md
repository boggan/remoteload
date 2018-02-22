# remoteload

simple library to load array of urls into a local temporary folder.

# installation

```
npm install remoteload
```

or clone the repository :)

# usage

##### inclusion
```javascript
const remoteload = require("remoteload");
```

##### load resources
```javascript
remoteload
    .loadURLs(["https://pixabay.com/en/photos/download/puppy-1502565_1920.jpg"])
    .then(i_sFolder => console.log("URLs Copied to folder: ", i_sFolder));
```

the loadURls method returns a promise which will receive the temporary folder as argument.

##### load resource data
```javascript
remoteload
    .loadURLsData(["https://pixabay.com/en/photos/download/puppy-1502565_1920.jpg"])
    .then(i_aDataBuffers => console.log("Data Buffers received: ", i_aDataBuffers.length));
```

the loadURLsData method returns a promise which will receive an array of buffer objects refering to the data retrieved from the requested urls.

##### cleanup
```javascript
remoteload
    .cleanup()
    .then(() => console.log("All loaded folders cleaned up!"));
```

the cleanup method returns a promise.
