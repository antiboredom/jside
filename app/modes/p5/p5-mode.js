var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');
var fs = nodeRequire('fs');

module.exports = {
  newProject: function() {
    //copy the empty project folder to a temporary directory
    var emptyProject = 'mode_assets/p5/empty_project';
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
        this.outputWindow.show();
        this.outputWindow.focus();
      }
    } else {
      this.running = true;
      gui.App.clearCache();
      startServer(this.projectPath, this, function(url) {
        if (self.settings.runInBrowser) {
          gui.Shell.openExternal(url);
        } else {
          self.outputWindow = self.newWindow(url, {toolbar: true, 'inject-js-start': 'js/debug-console.js'});
          self.outputWindow.on('document-start', function(){
            self.outputWindow.show();
          });
          //self.outputWindow.focus();
          self.outputWindow.on("close", function(){
            self.outputWindow = null;
            this.close(true);
            self.running = false;
          });
        }

      });
    }
  },

  stop: function() {
    if (this.outputWindow) {
      this.outputWindow.close();
    }
  },

  update: function(callback) {
    var pathPrefix = 'mode_assets/p5/empty_project/libraries/';
    var urlPrefex = 'https://raw.githubusercontent.com/lmccart/p5.js/master/lib/';

    var files = [
      { local: pathPrefix + 'p5.js', remote: urlPrefex + 'p5.js' },
      { local: pathPrefix + 'p5.sound.js', remote: urlPrefex + 'addons/p5.sound.js' },
      { local: pathPrefix + 'p5.dom.js', remote: urlPrefex + 'addons/p5.dom.js' }
    ];

    var checked = 0;

    files.forEach(function(file) {
      download(file.remote, file.local, function(data){
        if (data) {
          fs.writeFile(file.local, data, function(err){
            if (err) throw err;
          });
        }
        checked ++;
        if (checked == files.length && typeof callback !== 'undefined') {
          callback();
        }
      });
    });
  },

  referenceURL: 'http://p5js.org/reference/'

};

var running = false;
var url = '';

function startServer(path, app, callback) {
  if (running === false) {
    var portscanner = nodeRequire('portscanner');
    portscanner.findAPortNotInUse(3000, 4000, '127.0.0.1', function(error, port) {
      var static = nodeRequire('node-static');
      var server = nodeRequire('http').createServer(handler);
      var io = nodeRequire('socket.io')(server);
      var file = new static.Server(path);

      server.listen(port, function(){
        running = true;
        url = 'http://localhost:' + port;
        callback(url);
      });

      function handler(request, response) {
        request.addListener('end', function () {
          file.serve(request, response);
        }).resume();
      }

      io.on('connection', function (socket) {
        socket.on('console', function (data) {
          app.debugOut(data.msg, data.num, data.type);
        });
      });
    });


  } else {
    callback(url);
  }

}

function download(url, local, cb) {
  getLine(local, 0, function(line) {
    var shouldUpdate = true;
    var data = '';
    var lines = [];
    var request = nodeRequire('https').get(url, function(res) {
      res.on('data', function(chunk) {
        data += chunk;
        lines = data.split('\n');
        if (lines.length > 1 && line == lines[0]) {
          shouldUpdate = false;
          res.destroy();
        }
      });

      res.on('end', function() {
        if (shouldUpdate) {
          cb(data);
        } else {
          cb(null);
        }
      })
    });

    request.on('error', function(e) {
      console.log("Got error: " + e.message);
      cb(null);
    });
  });
}

function getLine(filename, lineNo, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) throw err;

    var lines = data.toString('utf-8').split("\n");
    callback(lines[lineNo]);
  });
}
