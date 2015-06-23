var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');
var fs = nodeRequire('fs');
var request = nodeRequire('request');
var Files = require('../../files');


var Files = require('../../files');

var _ = require('underscore');

//parsers
var esprima = require('esprima');
var escodegen = require('escodegen');


var liveCodingEnabled = true;
//global objects tracked for live coding
var globalObjs = {};




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
      }
    } else {
      // gui.App.clearCache();
      startServer(this.projectPath, this, function(url) {
        if (self.settings.runInBrowser) {
          gui.Shell.openExternal(url);
        } else {
          self.outputWindow = self.newWindow(url, {toolbar: true, 'inject-js-start': 'js/debug-console.js'}, 
                                             self.outX, self.outY);
          self.outputWindow.on('document-start', function(){

            //call codeChanged to get the globalObjs initialized. for the first time it doen't emit any change.
            var content = self.currentFile.contents;
            //TODO get the file by name to make sure sketch.js gets parsed.
            self.modeFunction('codeChanged', content);
            self.outputWindow.show();
          });
          self.outputWindow.on("close", function(){
            self.outX = self.outputWindow.x;
            self.outY = self.outputWindow.y;
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

  codeChanged: function(codeContent) {
    //if live coding enabled and socket connection is established (e.g. code is running)
    if(liveCodingEnabled && io) {


      try {
        //TODO is there any way of doing a shallow parse since we just need global stuff (most likely not)
        var syntax = esprima.parse(codeContent);

      }
      catch(e) {
        return;
      }

        _.each(syntax.body, function(i) {

            if (i.type === 'FunctionDeclaration') {
              // Global functions: 


              //TODO: is there a better way of getting the content of the function than unparsing it?

              
              var name = i.id.name;
              var value = escodegen.generate(i.body).replace('\n','');

              var params = i.params.map(function(item) {
                return item.name;
              });
              
              checkForChangeAndEmit(name, 'function', value, params);

            }
            else if (i.type ==='ExpressionStatement' &&
                     i.expression.left && i.expression.left.type === 'MemberExpression' &&
                     i.expression.right && i.expression.right.type === 'FunctionExpression') {
              // functions declared as expression e.g Obj.prototype.foo = function() {}

              var name = escodegen.generate(i.expression.left);
              var value = escodegen.generate(i.expression.right.body).replace('\n','');

              var params = i.params.map(function(item) {
                return item.name;
              });
              
              checkForChangeAndEmit(name, 'function', value, params);

              
            }
            else if (i.type === 'VariableDeclaration') {
              // Global variables: 
              //console.log(i);

              var name = i.declarations[0].id.name;
              var value = i.declarations[0].init ? escodegen.generate(i.declarations[0].init) : null;

              // client should know if the value is number to parseFloat string that is received.
              var isNumber = i.declarations[0].init  && //it is initialized and ... 
                            ((i.declarations[0].init.type==='Literal' 
                                && typeof i.declarations[0].init.value === 'number')  //for numbers
                            || (i.declarations[0].init.type==='UnaryExpression' 
                                && typeof i.declarations[0].init.argument.value === 'number')); //for negative numbers
                            //TODO what else? is there any other type of parse tree for numbers?
              
              var type = isNumber ? 'number' : 'variable';

              if(i.declarations[0].init.type==="ObjectExpression") {
                //pass object type since it needs to be parsed on client
                type = 'object';
              }


              checkForChangeAndEmit(name, type, value);


            }
        });
      
    }
          


  },

  referenceURL: 'http://p5js.org/reference/'

};

function checkForChangeAndEmit(name, type, value, params) {

    //if object doesn't exist or has been changed, update and emit change.
    if(!globalObjs[name]) {
      globalObjs[name] = {name: name, type: type, value: value, params: params};
    }
    else if( globalObjs[name].value !== value) {
      globalObjs[name] = {name: name, type: type, value: value, params: params};
      console.log('emitting', globalObjs[name]);
      io.emit('codechange', globalObjs[name]);
    }

}

var running = false;
var url = '';
var io;

function startServer(path, app, callback) {
  if (running === false) {
    var portscanner = nodeRequire('portscanner');
    portscanner.findAPortNotInUse(3000, 4000, '127.0.0.1', function(error, port) {
      var staticServer = nodeRequire('node-static');
      var server = nodeRequire('http').createServer(handler);
      io = nodeRequire('socket.io')(server);
      var file = new staticServer.Server(path, {cache: false});

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
