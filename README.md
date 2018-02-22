# remoteload

simple library to load array of urls into a local temporary folder.

# installation

```
npm install remoteload
```

or clone this repository :)

# usage

##### inclusion
```javascript
const remoteload = require("remoteload");
```

##### load resources
```javascript
remoteload
    .loadURls(["https://pixabay.com/en/photos/download/puppy-1502565_1920.jpg"])
    .then(i_sFolder => console.log("URLs Copied to folder: ", i_sFolder));
```

the loadURls method returns a promise which will receive the temporary folder as argument.

##### cleanup
```javascript
remoteload
    .cleanup()
    .then(() => console.log("All loaded folders cleaned up!"));
```

the cleanup method returns a promise.
