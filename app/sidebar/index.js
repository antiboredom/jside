var Path = nodeRequire('path');
var fs = nodeRequire('fs');
var trash = nodeRequire('trash');
var Vue = require('vue');

var File = require('./../files');
var _ = require('underscore');
var $ = require('jquery');

Vue.component('file', {
  name: 'File',
  template: require('./file.html'),
  props: {
    item: {
      required: true
    }
  },
  computed: {
    hidden: function() {
      return this.item.name[0] === '.';
    },
    icon: function() {
      if (this.item.ext.match(/(png|jpg|gif|svg|jpeg)$/i)) return 'image';
      else if (this.item.ext.match(/db$/i)) return 'db';
      else return 'file';
    },
    className: function() {
      return this.$root.currentFile.path === this.item.path ? 'selected' : '';
    }
  },

  methods: {
    popupMenu: function(target, event) {
      popupMenu.apply(this, arguments);
    },
    openFile: function() {
      this.$root.openFile(this.item.path)
    }
  }
});

Vue.component('folder', {
  name: 'Folder',
  template: require('./folder.html'),
  props: {
    item: {
      required: true
    }
  },
  data: function() {
    return {
      open: false,
      icon: 'folder'
    };
  },
  methods: {
    popupMenu: function(target, event) {
      popupMenu.apply(this, arguments);
    },
    toggleFolder: function() {
      this.open = !this.open;
      var self = this;
      if (this.open) {
        File.list(this.item.path, function(files) {
          var childrenIds = _.map(self.children, _.property('id'));
          var newFiles = _.filter(files, function(file) { return !_.contains(childrenIds, file.id); });
          self.item.children = self.item.children.concat(newFiles);
          if (!this.item.watching) {
            self.item.watching = true;
            self.$root.watch(self.path);
          }
          if (typeof cb === 'function') cb();
        });
      }
    }
  }
});

module.exports = {
  name: 'Sidebar',
  template: require('./sidebar.html'),
  props: ['files'],

  data: function() {
    return {
      sidebarWidth: 0,
      containerWidth: 0
    };
  },

  computed: {
    className: function() {
      return String(this.$root.settings.showSidebar) === "true" ? "expanded" : "";
    }
  },

  watch: {
    className: function(value) {
      const container = $('#sidebar-container');
      if (value === "expanded") {
        $('#showSidebarLabel').html( $('#showSidebarLabel').data('hide') );
        container.css({
          width: this.sidebarWidth
        });
      } else {
        $('#showSidebarLabel').html( $('#showSidebarLabel').data('show') );
        this.sidebarWidth = container.width();
        container.css({
          width: 10
        });
      }
      ace.resize();
    }
  },

  events: {
    'open-nested-file': 'openNestedFile'
  },

  ready: function() {
    var container = $('#sidebar-container');
    this.sidebarWidth = container.width();
  },

  methods: {
    popupMenu: function(target, event) {
      popupMenu.apply(this, arguments);
    },

    openFile: function(file) {
      this.$root.openFile(file.path);
    },

    openNestedFile: function(path) {
      var self = this;
      var dirname = Path.dirname(path);
      var f = _.findWhere(this.$root.files, {
        path: dirname
      });
      if (f) {
        this.toggleFolder(f, function() {
          self.$root.openFile(path);
        });
      }
    },

    startDrag: function(e) {
      var container = $('#sidebar-container');
      $(document).on('mousemove', function(e) {
        container.css({
          width: e.clientX
        });
        ace.resize();
      }).on('mouseup', function(e) {
        $(document).off('mouseup').off('mousemove');
      });
    }
  }
};

// to do - onely make this once! don't generate each time
var popupMenu = function(file, e) {
  e.preventDefault();
  var self = this;
  var menu = new gui.Menu();
  if (file.type === "file" || file.type === "folder") {
    menu.append(new gui.MenuItem({
      label: "Reveal",
      click: function() {
        gui.Shell.showItemInFolder(file.path);
      }
    }));
    menu.append(new gui.MenuItem({
      label: "Rename",
      click: function() {
        self.$root.renameFile(file.path);
      }
    }));
    menu.append(new gui.MenuItem({
      label: "Delete",
      click: function() {
        trash([file.path], function(err) {});
      }
    }));
  }

  menu.append(new gui.MenuItem({
    label: "New file",
    click: function() {
      self.$root.newFile(file.type == 'folder' ? file.path : self.$root.projectPath);
    }
  }));

  menu.append(new gui.MenuItem({
    label: "New folder",
    click: function() {
      self.$root.newFolder(file.type == 'folder' ? file.path : self.$root.projectPath);
    }
  }));
  menu.popup(e.clientX, e.clientY);

};
