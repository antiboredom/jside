var wrench = require('wrench')
var Path = require('path')
var os = require('os')
var fs = require('fs')
var request = require('request')
var Files = require('../../files')

const shell = require('electron').shell
const remote = require('electron').remote

let isWin = remote.getGlobal('sharedObj').isWin
let isLinux = remote.getGlobal('sharedObj').isLinux
let isMac = remote.getGlobal('sharedObj').isMac

var canvasWidth
var canvasHeight
var prevCanvasWidth
var prevCanvasHeight

module.exports = {
  newProject: function () {
    // copy the empty project folder to a temporary directory
    var emptyProject = Path.join('static', 'mode_assets', 'p5', 'empty_project')
    var tempProject = Path.join(os.tmpdir(), 'p5' + Date.now(), 'Untitled')
    wrench.mkdirSyncRecursive(tempProject)
    wrench.copyDirSyncRecursive(emptyProject, tempProject, {
      excludeHiddenUnix: true,
      inflateSymlinks: true,
      forceDelete: true
    })

    this.projectPath = tempProject

    // open the project and file
    var self = this
    this.loadProject(tempProject, function () {
      self.openFile(Path.join(tempProject, 'sketch.js'))
      remote.getCurrentWindow().show()
    })
  },

  launchExample: function (examplePath) {
    // copy the empty project folder to a temporary directory
    var emptyProject = 'static/mode_assets/p5/empty_project'
    var tempProjectPath = Path.join(os.tmpdir(), 'p5' + Date.now(), Files.cleanExampleName(examplePath))
    wrench.mkdirSyncRecursive(tempProjectPath)
    wrench.copyDirSyncRecursive(emptyProject, tempProjectPath, {
      excludeHiddenUnix: true,
      inflateSymlinks: true,
      forceDelete: true
    })
    // replace contents of sketch.js with the requested example
    var sketchContents = fs.readFileSync(examplePath, {encoding: 'utf8'})
    var assets = sketchContents.match(/['"]assets\/(.*?)['"]/g)
    if (assets) {
      var assetsDir = Path.join(tempProjectPath, 'assets')
      wrench.mkdirSyncRecursive(assetsDir)
      assets.forEach(function (a) {
        a = a.replace(/(assets\/)|['"]/g, '')
        var originalAsset = Path.join('static/mode_assets/p5/example_assets', a)
        var destAsset = Path.join(assetsDir, a)
        fs.createReadStream(originalAsset).pipe(fs.createWriteStream(destAsset))
      })
    }
    var destination = Path.join(tempProjectPath, 'sketch.js')
    fs.writeFileSync(destination, sketchContents)
    this.openProject(tempProjectPath, true)
  },

  exportProject: function () {
    console.log('hello')
  },

  saveAs: function (path) {
    if (!path) return false

    if (path.indexOf(this.projectPath) > -1) {
      alert('Unable to save project inside another project')
      return false
    }
    // save all files
    this.saveAll()

    // copy the folder
    wrench.copyDirSyncRecursive(this.projectPath, path)

    // change file paths
    this.files.forEach(function (file) {
      file.path = Path.join(path, file.name)
    })
    this.tabs.forEach(function (tab) {
      tab.path = Path.join(path, tab.name)
    })

    this.$broadcast('save-project-as', path)

    // change the html title tag
    var indexPath = Path.join(path, 'index.html')
    var projectTitle = Path.basename(path)
    var oldProjectTitle = Path.basename(this.projectPath)

    fs.readFile(indexPath, 'utf8', function (err, data) {
      if (!err) {
        data = data.replace('<title>' + oldProjectTitle + '</title>', '<title>' + projectTitle + '</title>')
        fs.writeFile(indexPath, data)
      }
    })

    this.projectPath = path
    this.temp = false
    this.watch(path)
  },

  run: function () {
    var self = this
    self.saveAll()
    const outputWinId = remote.getCurrentWindow().outputWinId
    if (outputWinId !== null) {
      // The output window is open
      if ((String(self.settings.runInBrowser) === 'true')) {
        // The user opened an output window then changed settings to run in browser
        shell.openExternal(url)
      } else {
        // Output window's already open so just reload it to update sketch
        remote.BrowserWindow.fromId(outputWinId).webContents.reloadIgnoringCache()
      }
    } else {
      // Output window isn't open so we're not running. First clear the cache
      remote.getCurrentWindow().webContents.session.clearCache(function () {
        // Start the static server to host the sketch
        startServer(self.projectPath, self, function (url) {
          if ((String(self.settings.runInBrowser) === 'true')) {
            // Open the sketch in an external browser
            shell.openExternal(url)
          } else {
            // User wants an outputWindow so we create it!
            fs.readFile(Path.join(self.projectPath, 'sketch.js'), function (err, data) {
              if (err) throw err

              // Use regex to get canvas width and height if the user coded it otherwise default
              // var matches = ('' + data).match(/createCanvas\((.*),(.*)\)/)
              var matches = ('' + data).match(/createCanvas\(\s*(\d*)\s*,\s*(\d*)\s*(?:,.+)?\s*\)/)
              canvasWidth = matches && matches[1] ? +matches[1] : 400
              canvasHeight = matches && matches[2] ? +matches[2] : 400

              // If output win width and height not set, set them equal to the canvas settings
              if (!self.outW) self.outW = canvasWidth
              if (!self.outH) self.outH = canvasHeight

              if ((canvasWidth !== prevCanvasWidth || canvasHeight !== prevCanvasHeight) && !self.resizedOutputWindow) {
                self.outW = canvasWidth
                self.outH = canvasHeight
              }

              self.newOutputWindow(url, {
                x: self.outX,
                y: self.outY,
                width: self.outW,
                height: self.outH
              }, {parentWindowId: remote.getCurrentWindow().id})

              prevCanvasWidth = canvasWidth
              prevCanvasHeight = canvasHeight
            })
          }
          self.running = true
        })
      })
    }
  },

  stop: function () {
    // if (nodeGlobal.serialRunning) {
    //   p5serial.stop()
    //   nodeGlobal.serialRunning = false
    // }
    let outputWinId = remote.getCurrentWindow().outputWinId
    console.log(`output win id=${outputWinId}`)
    if (outputWinId !== null) {
      remote.BrowserWindow.fromId(outputWinId).close()
    } else {
      this.running = false
    }
  },

  // update: function (callback) {
  //   var url = 'https://api.github.com/repos/processing/p5.js/releases/latest'
  //   var libraryPath = Path.join('static', 'mode_assets', 'p5', 'empty_project', 'libraries')
  //   var fileNames = ['p5.js', 'p5.dom.js', 'p5.sound.js']

  //   request({url: url, headers: {'User-Agent': 'request'}}, function (error, response, data) {
  //     if (error) return

  //     // filter assets to only include the filenames we want
  //     var assets = JSON.parse(data).assets.filter(function (asset) {
  //       return fileNames.indexOf(asset.name) > -1
  //     })

  //     // if remoteVersion != localVersion, download new version of each asset
  //     var remoteVersion = JSON.parse(data).tag_name
  //     var localPathToP5 = Path.join(libraryPath, 'p5.js')

  //     var localVersionTag = getVersion(localPathToP5, function (localVersion) {
  //       if (remoteVersion !== localVersion || !localVersion) {
  //         assets.forEach(function (asset) {
  //           var localPathToAsset = Path.join(libraryPath, asset.name)
  //           downloadAsset(asset.browser_download_url, localPathToAsset)
  //         })
  //       }
  //     })
  //   })

  //   function downloadAsset (remote, local) {
  //     request({url: remote, headers: {'User-Agent': 'request'}}, function (error, response, body) {
  //       if (error) return

  //       if (body.split('\n')[0].indexOf('/*! p5.') > -1) {
  //         fs.writeFile(local, body)
  //       }
  //     })
  //   }
  // },

  addLibrary: function (path) {
    var basename = Path.basename(path)
    var src = Path.join('static', 'mode_assets', 'p5', 'libraries', basename)
    var dest = Path.join(this.projectPath, 'libraries', basename)
    fs.createReadStream(src).pipe(fs.createWriteStream(dest))

    var indexPath = Path.join(this.projectPath, 'index.html')
    fs.readFile(indexPath, 'utf8', function (err, data) {
      if (err) throw err
      var scriptTag = '<script src="libraries/' + basename + '" type="text/javascript"></script>'
      var p5tag = '<script src="libraries/p5.js" type="text/javascript"></script>'

      if (data.indexOf(scriptTag) < 0) {
        var newHtml = data.replace(p5tag, p5tag + '\n    ' + scriptTag)
        fs.writeFile(indexPath, newHtml)
      }
    })
  },

  referenceURL: 'http://p5js.org/reference/'

}

var running = false
var url = ''
var staticServer = require('node-static')
var server
var file

// var p5serial = require('p5.serialserver')

function startServer (path, app, callback) {
  console.log(`root path for static server: ${path}`)
  if (running === false) {
    // if (!nodeGlobal.serialRunning) {
    //   p5serial.start()
    //   nodeGlobal.serialRunning = true
    // }
    var portscanner = require('portscanner')
    portscanner.findAPortNotInUse(3000, 4000, '127.0.0.1', function (err, port) {
      if (err) throw err
      server = require('http').createServer(handler)
      file = new staticServer.Server(path, {cache: false})

      server.listen(port, function () {
        url = 'http://localhost:' + port
        callback(url)
        running = true
      })

      function handler (request, response) {
        request.addListener('end', function () {
          file.serve(request, response)
        }).resume()
      }
    })
  } else {
    file = new staticServer.Server(path, {cache: false})
    callback(url)
  }
}

function getVersion (filename, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) throw err

    var line = data.toString('utf-8').split('\n')[0]
    var version
    try {
      version = line.match(/v\d+\.\d+\.\d+/)[0].substring(1)
    } catch (e) {
      version = null
    }
    callback(version)
  })
}
