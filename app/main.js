// node modules
var Path = nodeRequire('path');
var fs = nodeRequire('fs');
var os = nodeRequire('os');
var chokidar = nodeRequire('chokidar');
var rimdir = nodeRequire('rimraf');

// front-end modules
var Vue = require('vue');
var $ = require('jquery');
var _ = require('underscore');
var AutoLinker = require('autolinker');
var keybindings = require('./keybindings');
var Files = require('./files');
var menu = require('./menu');
var windowstate = require('./windowstate');
var updater = require('./updater');
var settings = require('./settings');
var modes = {
  p5: require('./modes/p5/p5-mode')
};


var appConfig = {

  el: '#app',

  mode: modes.p5,

  components: {
    editor: require('./editor/index'),
    sidebar: require('./sidebar/index'),
    settings: require('./settings/index'),
    debug: require('./debug/index')
  },

  data: {
    title: 'Untitled',
    projectPath: window.PATH,
    unsaved: window.UNSAVED ? true : false,
    windowURL: window.location.href,
    temp: true,
    running: false,
    focused: false,
    settings: {},
    showSettings: false,
    files: [],
    justSaved: false,
    askReload: false
  },

  computed: {
    projectName: function() {
      return Path.basename(this.projectPath);
    }
  },

  ready: function() {
    this.modeFunction('update');
    updater.check();
    keybindings.setup(this);
    menu.setup(this);

    this.setupFileListener();
    this.setupCloseHandler();
    this.setupDragListener();
    this.setupSettings();

    if (this.projectPath) {
      if (!this.unsaved) this.temp = false;
      var filename = null;

      if (fs.lstatSync(this.projectPath).isFile()) {
        // keep the name of the file to be opened
        filename = this.projectPath;

        // set the projectPath to the enclosing folder
        this.projectPath = Path.dirname(this.projectPath);
      }

      if (window.FILEPATH && fs.lstatSync(window.FILEPATH).isFile()) {
        filename = window.FILEPATH;
      }

      // load the project and open the selected file
      var self = this;
      this.loadProject(this.projectPath, function(){
        if (filename) {
          if (Path.dirname(filename) === self.projectPath) {
            self.openFile(filename);
          } else {
            self.$broadcast('open-nested-file', filename);
          }
        }
        gui.Window.get().show();
      });

      menu.updateRecentFiles(this, this.projectPath);
    } else {
      // if we don't have a project path global, create a new project
      this.modeFunction('newProject');
      menu.updateRecentFiles(this);
    }


  },

  methods: {
    modeFunction: function(func, args) {
      var mode = this.$options.mode;
      if (typeof mode[func] === 'function') {
        // make args an array if it isn't already
        // typeof args won't work because it returns 'object'
        if (Object.prototype.toString.call(args) !== '[object Array]') {
          args = [args];
        }
        mode[func].apply(this, args);
      }
    },

    setupSettings: function() {
      this.settings = settings.load();
      this.$watch('settings', function(value){
        this.$broadcast('settings-changed', value);
        settings.save(value);
      });
    },

    // use jquery to handle file changes
    // (I should move this over to vuejs but it wasn't dealing
    // with the html file element properly)
    setupFileListener: function() {
      $('#openFile').change(this.open.bind(this));
      $('#saveFile').change(this.saveAs.bind(this));
      $('#saveProject').change(this.saveProjectAs.bind(this));
    },

    setupCloseHandler: function() {
      var self = this;
      var win = gui.Window.get();
      win.on('close', function(closeEvent){
        // check to see if there are unsaved files
        var shouldClose = true;
        if (_.any(self.files, function(f) {return f.contents != f.originalContents})) {
          shouldClose = confirm('You have unsaved files. Quit and lose changes?');
        }
        if (shouldClose) {
          // clean up output window
          if (self.outputWindow) {
            self.outputWindow.close(true);
            self.outputWindow = null;
          }

          // save window state if the user quit the program
          if (closeEvent === 'quit') {
            windowstate.save(self, win);
          }

          // close this window
          this.close(true);
          win = null;
        }
      });

      win.on('focus', function(){
        self.focused = true;
        self.resetMenu();
        if (self.askReload) {
          self.askReload = false;
          var shouldRefresh = confirm(self.currentFile.path + ' was edited somewhere else. Reload? You will lose any changes.');
          if (shouldRefresh) {
              //self.openProject(self.currentFile.path);
              //gui.Window.get().close(true);
            window.location = 'index.html';
          }
        }
      });

      win.on('blur', function(){
        self.focused = false;
      });
    },

    // todo: setup drag and drop
    setupDragListener: function() {
      var self = this;
      window.ondragover = function(e) { e.preventDefault(); return false };
      window.ondrop = function(e) {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
          var path = e.dataTransfer.files[0].path;
          self.openProject(path);
        }
        return false
      };
    },

    // create a new window 50px below current window
    newWindow: function(url, options) {
      var currentWindow = gui.Window.get();
      var win = gui.Window.open(url, _.extend({
        x: currentWindow.x + 50,
        y: currentWindow.y + 50,
        width: 1024,
        height: 700,
        toolbar: false,
        focus: true,
        show: false
      }, options));
      return win;
    },

    // open an existing project with a new window
    open: function(event) {
      var path = event.target.files[0].path;
      this.openProject(path);
      // reset value in case the user wants to open the same file more than once
      $('#openFile').val('');
    },

    openProject: function(path) {
      // create the new window
      var win = this.newWindow(this.windowURL);

      // set the project path of the new window
      win.on('document-start', function(){
        if (fs.lstatSync(path).isDirectory()) {
          var sketchPath = Path.join(path, 'sketch.js');
          if (fs.existsSync(sketchPath)) path = sketchPath;
        }
        win.window.PATH = path;
      });
      return win;
    },

    // load project files
    loadProject: function(path, callback) {
      var self = this;
      Files.list(path, function(files){
        self.files = files;
        self.watch(path);
        if (typeof callback === 'function') callback();
      });
    },

    resetMenu: function(){
      menu.resetMenu();
    },

    // watch the project file tree for changes
    watch: function(path) {
      var self = this;

      // don't watch recursively
      var watcher = chokidar.watch(path, {
        ignoreInitial: true,
        ignored: function(filepath) {
          var regex = new RegExp(path + '\/.*\/.+');
          return regex.test(filepath);
        }
      });

      watcher.on('add', function(path) {
        var f = Files.setup(path);
        Files.addToTree(f, self.files, self.projectPath);
      }).on('addDir', function(path) {
        var f = Files.setup(path, {type: 'folder', children: []});
        Files.addToTree(f, self.files, self.projectPath);
      }).on('unlink', function(path) {
        Files.removeFromTree(path, self.files);
      }).on('unlinkDir', function(path) {
        Files.removeFromTree(path, self.files);
      }).on('change', function(path) {
        if (self.justSaved) {
          self.justSaved = false; 
        } else {
          if (!self.temp) self.askReload = true;
        }
      });
    },

    // close the window, checking for unsaved file changes
    closeProject: function() {
      if (this.focused) {
        if (this.outputWindow) {
          this.outputWindow.close(true);
          this.outputWindow = null;
        }
        gui.Window.get().close();
      } else {
        if (this.outputWindow) {
          this.toggleRun();
        }
      }
    },

    // save all open files
    saveAll: function() {
      _.where(this.files, {type: 'file', open: true}).forEach(function(file) {
        if (file.originalContents != file.contents) {
          fs.writeFileSync(file.path, file.contents, "utf8");
          file.originalContents = file.contents;
        }
      });
      menu.updateRecentFiles(this, this.projectPath);
      this.justSaved = true;
    },

    saveAs: function(event) {
      // capture the filename selected by the user
      var file = event.target.files[0].path;

      if (this.temp) {
        // mode specific action
        this.modeFunction('saveAs', file);
        menu.updateRecentFiles(this, this.projectPath);
      } else {
        // save a file
        // if the we are saving inside the project path just open the new file
        // otherwise open a new window
        fs.writeFileSync(file, this.currentFile.contents, "utf8");
        if ((Path.dirname(file) + '/').indexOf(this.projectPath + '/') > -1) {
          var f = Files.setup(file);
          Files.addToTree(f, this.files, this.projectPath);
          this.openFile(file);
        } else {
          this.openProject(file);
        }
      }

      // reset value in case the user wants to save the same filename more than once
      $('#saveFile').val('');
    },

    saveProjectAs: function(event) {
      var path = event.target.files[0].path;
      var self = this
      fs.exists(path, function(existing){
        if (existing) {
          rimdir(path, function(error){
            if (error) throw error;
            //console.log(path + " already exists. deleting...");
            self.modeFunction('saveAs', path);
          })
        } else {
          //console.log(path + " is clear to save");
          self.modeFunction('saveAs', path);
        }
      })
    },

    saveFile: function() {
      // if this is a new project then trigger a save-as
      if (this.temp) {
        $('#saveFile').trigger('click');
      } else {
        // otherwise just write the current file
        this.writeFile();
      }
    },

    saveFileAs: function(path) {
      var originalName = Path.basename(path);
      var newName = prompt('Save file as:', originalName);
      if (!newName || newName === originalName) return false;

      var self = this;
      var filename = Path.join(Path.dirname(path), newName);
      fs.writeFile(filename, this.currentFile.contents, 'utf8', function(err){
        var f = Files.setup(filename);
        self.openFile(filename);
      });
    },

    writeFile: function() {
      var self = this;

      self.justSaved = true;

      fs.writeFileSync(this.currentFile.path, this.currentFile.contents, "utf8");
      this.currentFile.originalContents = this.currentFile.contents;

    },

    // open up a file - read its contents if it's not already opened
    openFile: function(path, callback) {
      var self = this;

      var file = Files.find(this.files, path);
      if (!file) return false;

      if (file.open) {
        this.title = file.name;
        this.currentFile = file;
        this.$broadcast('open-file', this.currentFile);
      } else {
        fs.readFile(path, 'utf8', function(err, fileContents) {
          if (err) throw err;
          file.contents = file.originalContents = fileContents;
          file.open = true;
          self.title = file.name;
          self.currentFile = file;
          self.$broadcast('open-file', self.currentFile);
          if (typeof callback === 'function') callback(file);
        });
      }
    },

    // create a new file and save it in the project path
    newFile: function(basepath) {
      var title = prompt('File name:');
      if (!title) return false;

      if (typeof basepath === 'undefined') {
        basepath = this.projectPath;
      }

      var filename = Path.join(basepath, title);

      var self = this;
      fs.writeFile(filename, '', 'utf8', function(err){
        var f = Files.setup(filename);
        Files.addToTree(f, self.files, self.projectPath);
        self.openFile(filename);
      });
    },

    newFolder: function(basepath) {
      var title = prompt('Folder name:');
      if (!title) return false;

      if (typeof basepath === 'undefined') {
        basepath = this.projectPath;
      }

      var filename = Path.join(basepath, title);

      var self = this;
      fs.mkdir(filename);
    },

    renameFile: function(path) {
      var originalName = Path.basename(path);
      var newName = prompt('Rename ' + originalName + ' to:', originalName);
      if (!newName) return false;

      fs.rename(path, Path.join(Path.dirname(path), newName));
    },

    debugOut: function(data) {
      var msg = data.msg;
      var style = data.style;
      var line = data.num;
      var type = data.type;
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      if (style) {
        msg = msg.replace(/%c/g, '');
        msg = msg.replace('[', '[ ');
        msg = msg.replace(']', '[ ');
      }
      msg = AutoLinker.link(msg);
      // console.log(data);
      $('#debug').append('<div class="'+type+'" style="'+(style ? style : '')+'">' + (line ? line + ': ' : '') + msg + '</div>');
      $('#debug').scrollTop($('#debug')[0].scrollHeight);
    },

    run: function() {
      $('#debug').html('');
      this.modeFunction('run');
    },

    toggleRun: function() {
      if (this.running) {
        this.modeFunction('stop');
      } else {
        $('#debug').html('');
        this.modeFunction('run');
      }
    },

    changeFontSize: function(sz) {
      this.settings.fontSize = parseInt(this.settings.fontSize) + sz;
    },

    toggleSettingsPane: function() {
      this.showSettings = !this.showSettings;
    },

    showHelp: function() {
      gui.Shell.openExternal(this.$options.mode.referenceURL);
    }

  }

};


windowstate.load(function(createNewProject){
  if (createNewProject) {
    var app = new Vue(appConfig);
  } else {
    gui.Window.get().close(true);
  }
});
