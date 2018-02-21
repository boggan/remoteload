const
    fs = require("fs"),
    path = require("path"),
    os = require("os"),
    https = require("https"),
    http = require("http"),
    url = require("url"),
    rimraf = require("rimraf");

// - create temp dir
//==============================================================================
function _createTempDirectory() {
    return new Promise((i_fnResolve, i_fnReject) => {
        fs.mkdtemp(path.join(os.tmpdir(), 'remoteLoad-'), (err, i_sFolder) => {
            if (err) {
                i_fnReject(err);
            }

            i_fnResolve(i_sFolder);
        });
    });
}

//==============================================================================
function _fetchFile(i_sURL) {
    return new Promise(i_fnResolve => _fetchFile_internal(i_sURL, i_fnResolve));
}

//==============================================================================
function _fetchFile_internal(i_sURL, i_oCallback) {
    let l_oRequest,
        l_oOptions = url.parse(i_sURL);

    l_oRequest = https.request(l_oOptions, (i_oResponse) => {
        if (i_oResponse.statusCode === 200) {
            let l_aBuffer = Buffer.from([]);

            i_oResponse.on('data', (i_xData) => {
                l_aBuffer = Buffer.concat([l_aBuffer, i_xData]);
            });

            i_oResponse.on('end', () => {
                i_oCallback(l_aBuffer);
            });
        } else {
            throw ("File not found " + i_sURL);
        }
    });

    l_oRequest.on('error', (e) => {
        console.error(e);
    });

    l_oRequest.end();
}

// - assert writing directories
//==============================================================================
function _assertWritingDirectories(i_sTmpFolder, i_aFileNames) {
    let l_oFolders = new Set(),
        l_aPromises;

    i_aFileNames.forEach(i_sFilePath => l_oFolders.add(path.dirname(path.join(i_sTmpFolder, i_sFilePath))));

    l_aPromises = Array.from(l_oFolders).sort().map(_AssertDirectory);

    return Promise.all(l_aPromises);
}

//==============================================================================
function _AssertDirectory(i_sFolderName) {
    return new Promise(i_fnResolve => {
        fs.access(i_sFolderName, fs.constants.R_OK | fs.constants.W_OK, (i_oError) => {
            if (i_oError) {
                fs.mkdir(i_sFolderName, (err, data) => {
                    i_fnResolve();
                });
            } else {
                i_fnResolve();
            }
        });
    });
}

// - write files
//==============================================================================
function _writeAllFiles(i_sFolder, i_aFileNames, i_aFileData) {
    let l_aWritePromises;

    l_aWritePromises = i_aFileNames.map((i_sRelPath, i_nIdx) => {
        let l_sFilePath = path.join(i_sFolder, i_sRelPath);
        return _writeFileData(l_sFilePath, i_aFileData[i_nIdx]);
    });

    return Promise.all(l_aWritePromises);
}

//==============================================================================
function _writeFileData(i_sFileName, i_xData) {
    return new Promise(i_fnResolve => {
        // make sure destination exists
        fs.writeFile(i_sFileName, i_xData, () => i_fnResolve(i_sFileName));
    });
}

// private variables
var g_oTmpDirRegistry = new WeakMap();

//==============================================================================
class RemoteLoader { // or convert to "function" class to keep private variables ?
    //==========================================================================
    constructor() {
        g_oTmpDirRegistry.set(this, {
            tmpDirs: []
        });
    }

    //==========================================================================
    loadURLs(i_aURLs) {
        // @ this point we can safely assume we're in a nodejs environment
        let l_sTmpDir,
            l_aFileNames = i_aURLs.map(i_sURL => url.parse(i_sURL).path);

        return _createTempDirectory()
            // fetch all files
            .then(i_sTmpFolder => {
                g_oTmpDirRegistry.get(this).tmpDirs.push(i_sTmpFolder);
                l_sTmpDir = i_sTmpFolder;
                return Promise.all(i_aURLs.map(_fetchFile));
            })
            // prepare dir for writing
            .then(i_aURLsData => {
                return _assertWritingDirectories(l_sTmpDir, l_aFileNames)
                    .then(() => i_aURLsData)
            })
            // write all files
            .then(i_aURLsData => _writeAllFiles(l_sTmpDir, l_aFileNames, i_aURLsData))
            .then(() => l_sTmpDir);
    }

    /**
     * removes all created temp directories and their contents
     */
    //==========================================================================
    cleanup() {
        let l_aPromises = g_oTmpDirRegistry
            .get(this)
            .tmpDirs
            .map(i_sTmpDir => new Promise(i_fnResolve => rimraf(i_sTmpDir, i_fnResolve)));

        return Promise.all(l_aPromises);
    }
}

module.exports = new RemoteLoader();
