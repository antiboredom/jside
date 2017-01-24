var Path = nodeRequire('path');

var _ = require('underscore');
var Files = require('../files');
var beautify = require('js-beautify').js_beautify;
var beautify_css = require('js-beautify').css;
var beautify_html = require('js-beautify').html;
var ace = require('brace');

require('brace/mode/html');
require('brace/mode/javascript');
require('brace/mode/css');
require('brace/mode/json');
require('brace/mode/text');
require('brace/theme/tomorrow');
require('brace/ext/searchbox');

var modes = {
  ".html": "html",
  ".htm": "html",
  ".js": "javascript",
  ".css": "css",
  ".json": "json",
  ".txt": "text"
};


module.exports = {
  template: require('./template.html'),

  data: {
    newProject: true
  },

  ready: function() {
    this.sessions = [];

    this.$on('open-file', this.openFile);
    this.$on('close-file', this.closeFile);
    this.$on('save-project-as', this.saveProjectAs);
    this.$on('reformat', this.reformat);
    this.$on('settings-changed', this.updateSettings);

    this.ace = window.ace = ace.edit('editor');
    //this.ace.setTheme('ace/theme/tomorrow');
    this.ace.setReadOnly(true);
    // this.ace.$worker.send("changeOptions", [{asi: false}]);

    this.customizeCommands();
  },

  methods: {
    openFile: function(fileObject) {
      var session = _.findWhere(this.sessions, {path: fileObject.path});
      if (!session) {
        var doc = ace.createEditSession(fileObject.contents, "ace/mode/" + modes[fileObject.ext]);

        var self = this;
        doc.on('change', function() {
          var file = Files.find(self.$root.files, fileObject.path);
          if (file) file.contents = doc.getValue();
        });

        var session = {
          path: fileObject.path,
          doc: doc
        };

        this.sessions.push(session);
      }

      this.ace.setReadOnly(false);
      this.ace.setSession(session.doc);
      this.updateSettings(this.$root.settings);
      this.ace.focus();

      if (this.newProject) {
        this.ace.gotoLine(2, 2);
        this.newProject = false;
      }
    },

    closeFile: function(fileObject){
      var session = _.findWhere(this.sessions, {path: fileObject.path});
      if(session){
        var index = _.indexOf(this.sessions, session);
        this.sessions.splice(index,1);
      }
    },

    saveProjectAs: function(path) {
      this.sessions.forEach(function(session) {
        session.path = Path.join(path, Path.basename(session.path));
      });
    },

    reformat: function() {
      var ext = this.$root.currentFile.ext;
      var content = this.ace.getValue();
      var opts = {
        "indent_size": this.$root.settings.tabSize,
        "indent_with_tabs": this.$root.settings.tabType === 'tabs',
      };

      var pos = this.ace.getCursorPosition();
      var scrollPos = this.ace.getSession().getScrollTop();

      if (ext == '.js') {
        this.ace.setValue(beautify(content, opts), -1);
      } else if (ext == '.css') {
        this.ace.setValue(beautify_css(content, opts), -1);
      } else if (ext == '.html') {
        this.ace.setValue(beautify_html(content, opts), -1);
      }

      this.ace.moveCursorToPosition(pos);
      this.ace.getSession().setScrollTop(scrollPos);
    },

    updateSettings: function(settings) {
      this.ace.getSession().setTabSize(settings.tabSize);
      this.ace.getSession().setUseSoftTabs(settings.tabType === 'spaces');
      this.ace.getSession().setUseWrapMode(settings.wordWrap === true);
    },

    customizeCommands: function() {
      var self = this;

      var commands = [{
        name: "blockoutdent",
        bindKey: {win: 'Ctrl-[,',  mac: 'Command-['},
        exec: function(editor) { editor.blockOutdent(); },
        multiSelectAction: "forEachLine",
        scrollIntoView: "selectionPart"
      }, {
        name: "blockindent",
        bindKey: {win: 'Ctrl-],',  mac: 'Command-]'},
        exec: function(editor) { editor.blockIndent(); },
        multiSelectAction: "forEachLine",
        scrollIntoView: "selectionPart"
      }, {
        name: 'Preferences',
        bindKey: {win: 'Ctrl-,',  mac: 'Command-,'},
        exec: function(editor) {
          self.$root.toggleSettingsPane();
        }
      }];

      commands.forEach(function(command){
        this.ace.commands.addCommand(command);
      });

    }

  }
};
