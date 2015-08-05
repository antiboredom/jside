var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');
var fs = nodeRequire('fs');
var request = nodeRequire('request');
var Files = require('../../files');


module.exports = {
  newProject: function() {
    //copy the empty project folder to a temporary directory
    var emptyProject = Path.join('mode_assets', 'p5', 'empty_project');
    var tempProject = Path.join(os.tmpdir(), 'p5' + Date.now(), 'Untitled');
    wrench.mkdirSyncRecursive(tempProject);
    wrench.copyDirSyncRecursive(emptyProject, tempProject, {
      excludeHiddenUnix: true,
      inflateSymlinks: true,
      forceDelete: true
    });

    this.projectPath = tempProject;

    //open the project and file
    var self = this;
    this.loadProject(tempProject, function(){
      self.openFile(Path.join(tempProject, 'sketch.js'));
      gui.Window.get().show();
    });

  },


  launchExample: function(examplePath) {
    //copy the empty project folder to a temporary directory
    var emptyProject = 'mode_assets/p5/empty_project';
    var tempProjectPath = Path.join(os.tmpdir(), 'p5' + Date.now(), Files.cleanExampleName(examplePath));
    wrench.mkdirSyncRecursive(tempProjectPath);
    wrench.copyDirSyncRecursive(emptyProject, tempProjectPath, {
      excludeHiddenUnix: true,
      inflateSymlinks: true,
      forceDelete: true
    });
    // replace contents of sketch.js with the requested example
    var sketchContents = fs.readFileSync(examplePath, {encoding: 'utf8'});
    var assets = sketchContents.match(/['"]assets\/(.*?)['"]/g);
    if (assets) {
      var assetsDir = Path.join(tempProjectPath, 'assets');
      wrench.mkdirSyncRecursive(assetsDir);
      assets.forEach(function(a){
        a = a.replace(/(assets\/)|['"]/g, '');
        var originalAsset = Path.join('mode_assets/p5/example_assets', a);
        var destAsset = Path.join(assetsDir, a);
        fs.createReadStream(originalAsset).pipe(fs.createWriteStream(destAsset));
      });
    }
    var destination = Path.join(tempProjectPath, "sketch.js");
    fs.writeFileSync(destination, sketchContents);
    this.openProject(tempProjectPath, true);
  },

  exportProject: function() {
    console.log('hello');
  },

  saveAs: function(path) {
    //save all files
    this.saveAll();

    //copy the folder
    wrench.copyDirSyncRecursive(this.projectPath, path);

    //change file paths
    this.files.forEach(function(file) {
      file.path = Path.join(path, file.name);
    });
    this.tabs.forEach(function(tab){
      tab.path = Path.join(path, tab.name);
    });

    this.$broadcast('save-project-as', path);

    this.projectPath = path;
    //this.$broadcast('open-project', path);
    this.temp = false;

    this.watch(path);
  },

  run: function() {
    var self = this;
    this.saveAll();

    if (this.outputWindow) {
      if (this.settings.runInBrowser) {
        gui.Shell.openExternal(url);
      } else {
        this.outputWindow.reloadIgnoringCache();
        if(isWin){
          self.outputWindow.hide();
          self.outputWindow.show();
        }
      }
    } else {
      // gui.App.clearCache();
      startServer(this.projectPath, this, function(url) {
        if (self.settings.runInBrowser) {
          gui.Shell.openExternal(url);
        } else {
          self.outputWindow = self.newWindow(url, {
            toolbar: true,
            'inject-js-start': 'js/debug-console.js',
            x: self.outX,
            y: self.outY,
            width: self.outW,
            height: self.outH
          });
          self.outputWindow.on('document-start', function(){
            self.outputWindow.show();
          });
          self.outputWindow.on("close", function(){
            self.outX = self.outputWindow.x;
            self.outY = self.outputWindow.y;
            self.outW = self.outputWindow.width;
            self.outH = self.outputWindow.height;
            self.running = false;
            self.outputWindow = null;
            this.close(true);
          });
          self.outputWindow.on('focus', function(){
            self.resetMenu();
          });
        }
        self.running = true;
      });
    }
  },

  stop: function() {
    if (this.outputWindow) {
      this.outputWindow.close();
    } else {
      this.running = false;
    }
  },

  update: function(callback) {
    var url = 'https://api.github.com/repos/processing/p5.js/releases/latest';
    var libraryPath = Path.join('mode_assets', 'p5', 'empty_project', 'libraries');
    var fileNames = ['p5.js', 'p5.dom.js', 'p5.sound.js'];

    request({url: url, headers: {'User-Agent': 'request'}}, function(error, response, data){
      var assets = JSON.parse(data).assets.filter(function(asset){
        return fileNames.indexOf(asset.name) > -1;
      });
      assets.forEach(checkAsset);
    });

    function checkAsset(asset){
      var localPath = Path.join(libraryPath, asset.name);
      getVersion(localPath, function(version){
        var remoteVersion = asset.tag;
        if (remoteVersion != version) {
          downloadAsset(asset.browser_download_url, localPath);
        }
      });
    }

    function downloadAsset(remote, local) {
      request({url: remote, headers: {'User-Agent': 'request'}}, function(error, response, body){
        fs.writeFile(local, body);
      });
    }
  },

  referenceURL: 'http://p5js.org/reference/',
  p5jsURL: 'http://p5js.org/',
  processingURL: 'https://github.com/processing'

};

var running = false;
var url = '';
var staticServer = nodeRequire('node-static'), server, io, file;

function startServer(path, app, callback) {
  if (running === false) {
    var portscanner = nodeRequire('portscanner');
    portscanner.findAPortNotInUse(3000, 4000, '127.0.0.1', function(error, port) {
      server = nodeRequire('http').createServer(handler);
      io = nodeRequire('socket.io')(server);
      file = new staticServer.Server(path, {cache: false});

      server.listen(port, function(){
        url = 'http://localhost:' + port;
        callback(url);
        running = true;
      });

      function handler(request, response) {
        request.addListener('end', function () {
          file.serve(request, response);
        }).resume();
      }

      io.on('connection', function (socket) {
        socket.on('console', function (data) {
          app.debugOut(data);
        });
      });
    });


  } else {
    file = new staticServer.Server(path, {cache: false});
    callback(url);
  }

}

function getVersion(filename, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) throw err;

    var line = data.toString('utf-8').split("\n")[0];
    var version = line.match(/v\d+\.\d+\.\d+/)[0].substring(1);
    callback(version);
  });

}
