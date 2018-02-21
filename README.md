# remoteload
library to load array of urls into a local temporary folder

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

##### cleanup
```javascript
remoteload
    .cleanup()
    .then(() => console.log("All loaded folders cleaned up!"));
```
