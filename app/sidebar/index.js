var Path = nodeRequire('path');
var fs = nodeRequire('fs');
var trash = nodeRequire('trash');

var File = require('./../files');
var _ = require('underscore');
var $ = require('jquery');

module.exports = {
  template: require('./sidebar.html'),

  ready: function() {
    this.$on('open-nested-file', this.openNestedFile);
  },

  components: {

    file: {
      template: require('./file.html'),
      computed: {
        hidden: function() {
          return this.name[0] === '.';
        },
        icon: function() {
          if (this.ext.match(/(png|jpg|gif|svg|jpeg)$/i)) return 'image';
          else if (this.ext.match(/db$/i)) return 'db';
          else return 'file';
        },
        className: function() {
          var c = 'item';
          if (this.$root.currentFile.path == this.path) c += ' selected';
          return c;
        }
      },

      methods: {
        popupMenu: function(target, event) {
          popupMenu.apply(this, arguments);
        }
      }
    },

    folder: {
      template: require('./folder.html'),
      data: {
        open: false,
        icon: 'folder'
      },
      computed: {
        hidden: function() {
          if (!this.$root.settings.showLibs) {
            return this.name[0] === '.' || this.name === 'node_modules' || this.name === 'libraries';
          } else {
            return this.name[0] === '.';
          }
        }
      },
      methods: {
        popupMenu: function(target, event) {
          popupMenu.apply(this, arguments);
        }
      }
    },
  },

  methods: {
    popupMenu: function(target, event) {
      popupMenu.apply(this, arguments);
    },

    openFile: function(file) {
      this.$root.openFile(file.path);
    },

    toggleFolder: function(folder, cb) {
      var self = this;
      folder.open = !folder.open;
      if (folder.open) {
        File.list(folder.path, function(files){
          folder.children = files;
          if (!folder.watching) {
            folder.watching = true;
            self.$root.watch(folder.path);
          }
          if (typeof cb === 'function') cb();
        });
      }
    },


    openNestedFile: function(path) {
      var self = this;
      var dirname = Path.dirname(path);
      var f = _.findWhere(this.$root.files, {path: dirname});
      if (f) {
        this.toggleFolder(f, function(){
          self.$root.openFile(path);
        });
      }
    },

    startDrag: function(e) {
      var container = $('#sidebar-container');
      $(document).on('mousemove', function (e) {
        container.css({width: e.clientX});
        ace.resize();
      }).on('mouseup', function (e) {
        $(document).off('mouseup').off('mousemove');
      });
    }
  }
};

// to do - onely make this once! don't generate each time
var popupMenu = function(target, e) {
  e.preventDefault();
  var self = this;
  var menu = new gui.Menu();
  if (target.type === "file" || target.type === "folder") {
    menu.append(new gui.MenuItem({
    label: "Reveal",
    click: function() {
      gui.Shell.showItemInFolder(target.path);
    }
  }));
  menu.append(new gui.MenuItem({
    label: "Rename",
    click: function() {
      self.$root.renameFile(target.path);
    }
  }));
  menu.append(new gui.MenuItem({
    label: "Delete",
    click: function() {
      trash([target.path], function(err) {});
    }
  }));
  }
  

  menu.append(new gui.MenuItem({
    label: "New file",
    click: function() {
      self.$root.newFile(target.type=='folder' ? target.path : self.$root.projectPath);
    }
  }));
  menu.append(new gui.MenuItem({
    label: "New folder",
    click: function() {
      self.$root.newFolder(target.type=='folder' ? target.path : self.$root.projectPath);
    }
  }));
  menu.popup(e.clientX, e.clientY);
};
