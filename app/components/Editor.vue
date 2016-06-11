<template>
  <div v-el:editor :style="{fontSize: $root.settings.fontSize +'px'}"></div>
</template>

<script>
  var Path = require('path')

  var _ = require('underscore')
  var Files = require('../files')
  var beautify = require('js-beautify').js_beautify
  var beautify_css = require('js-beautify').css
  var beautify_html = require('js-beautify').html
  var ace = require('brace')

  require('brace/mode/html')
  require('brace/mode/javascript')
  require('brace/mode/css')
  require('brace/mode/json')
  require('brace/mode/text')
  require('brace/theme/tomorrow')
  require('brace/ext/searchbox')

  var modes = {
    ".html": "html",
    ".htm": "html",
    ".js": "javascript",
    ".css": "css",
    ".json": "json",
    ".txt": "text"
  }

  module.exports = {
    name: 'Editor',

    data: function() {
      return {
        newProject: true
      }
    },

    events: {
      'open-file': 'openFile',
      'close-file': 'closeFile',
      'save-project-as': 'saveProjectAs',
      'reformat': 'reformat',
      'settings-changed': 'updateSettings'
    },

    ready: function() {
      this.sessions = []

      this.ace = window.ace = ace.edit(this.$els.editor)
      //this.ace.setTheme('ace/theme/tomorrow')
      this.ace.setReadOnly(true)
      // this.ace.$worker.send("changeOptions", [{asi: false}])

      this.customizeCommands()
    },

    methods: {
      openFile: function(fileObject) {
        var session = _.findWhere(this.sessions, {path: fileObject.path})
        if (!session) {
          var doc = ace.createEditSession(fileObject.contents, "ace/mode/" + modes[fileObject.ext])

          var self = this
          doc.on('change', function() {
            var file = Files.find(self.$root.files, fileObject.path)
            if (file) file.contents = doc.getValue()
          })

          var session = {
            path: fileObject.path,
            doc: doc
          }

          this.sessions.push(session)
        }

        this.ace.setReadOnly(false)
        this.ace.setSession(session.doc)
        this.updateSettings(this.$root.settings)
        this.ace.focus()

        if (this.newProject) {
          this.ace.gotoLine(2, 2)
          this.newProject = false
        }
      },

      closeFile: function(fileObject){
        var session = _.findWhere(this.sessions, {path: fileObject.path})
        if(session){
          var index = _.indexOf(this.sessions, session)
          this.sessions.splice(index,1)
        }
      },

      saveProjectAs: function(path) {
        this.sessions.forEach(function(session) {
          session.path = Path.join(path, Path.basename(session.path))
        })
      },

      reformat: function() {
        var ext = this.$root.currentFile.ext
        var content = this.ace.getValue()
        var opts = {
          "indent_size": this.$root.settings.tabSize,
          "indent_with_tabs": this.$root.settings.tabType === 'tabs',
        }

        var pos = this.ace.getCursorPosition()
        var scrollPos = this.ace.getSession().getScrollTop()

        if (ext == '.js') {
          this.ace.setValue(beautify(content, opts), -1)
        } else if (ext == '.css') {
          this.ace.setValue(beautify_css(content, opts), -1)
        } else if (ext == '.html') {
          this.ace.setValue(beautify_html(content, opts), -1)
        }

        this.ace.moveCursorToPosition(pos)
        this.ace.getSession().setScrollTop(scrollPos)
      },

      updateSettings: function(settings) {
        this.ace.getSession().setTabSize(settings.tabSize)
        this.ace.getSession().setUseSoftTabs(settings.tabType === 'spaces')
        this.ace.getSession().setUseWrapMode(settings.wordWrap === true)
      },

      customizeCommands: function() {
        var self = this
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
            self.$root.toggleSettingsPane()
          }
        }]

        commands.forEach(function(command){
          self.ace.commands.addCommand(command)
        })

      }

    }
  }
</script>

<style lang="scss">
  #main-container {
    margin-top: 30px;
    margin-bottom: 10px;
    margin-right: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 100px;
    /*padding-top: 21px !important;*/
  }

  div#editor-container {
    display: flex;
    flex: 1;
    flex-direction: row;
    border-top: 1px solid #f4f4f4;
    border-right: 1px solid #f4f4f4;
    border-bottom: 1px solid #f4f4f4;
  }

  #main {
    display: flex;
    flex: 1;
  }

  #editor {
    font: 16px inconsolata;
    flex: 1;
    background: #fdfdfd;
  }

  .ace_scroller {
    /*padding-top: 21px !important; PEND */
  }

  .ace_editor {
    overflow: visible !important;
    padding-bottom: 21px !important;
  }

  .ace_active-line {
    background: rgba(207, 207, 207, 0.2);
  }

  .ace_print-margin {
    visibility: hidden !important;
  }

  .ace_gutter {
    color: #b5b5b5 !important;
    background: rgba(153, 153, 153, 0.1) !important;
    width: 53px !important;
    border-right: 1px solid rgba(153, 153, 153, 0.3);
  }

  .ace_gutter-active-line {
    /*margin-top: 21px;  PEND */
  }

  .ace_gutter-layer {
    width: 53px !important;
    /*margin-top: 21px !important; PEND */
  }

  .ace_gutter-cell {
    background-image: none !important;
    background-position: 2px center !important;
    padding-right: 15px !important;
  }

  .ace_warning {
    background-color: rgba(255, 190, 5, 0.3) !important;
  }

  .ace_error {
    background-color: rgba(255, 95, 81, 0.3) !important;
  }


  .ace_function,
  .ace_p5_function {
      color: #DC3787 !important; /* not p5 pink, but related */
  }

  .ace_p5_variable {
      color: #00A1D3 !important; /* not p5 blue, but related */
  }

  /* property, tag, boolean,
     number, function-name, constant,
     symbol */
  .ace_numeric,
  .ace_tag {
      color: #333333 !important;
  }

  /* atrule, attr-value, keyword,
     class-name */
  .ace_type,
  .ace_class,
  .ace_attribute-name {
      color: #704F21 !important; /* darker brown */
  }

  /* selector, attr-name,
  function, builtin */
  .ace_keyword,
  .ace_support {
    color: #B48318 !important;
  }

  /* comment, block-comment, prolog,
     doctype, cdata */
  .ace_comment {
      color: #A0A0A0 !important; /* light gray */
  }

  /* operator, entity, url,
  variable */
  .ace_string {
    color: #a67f59 !important; /* og coy a67f59 a light brown */
  }

  .ace_operator {
      color: #333 !important;
  }

  /* regex, important */
  .ace_regexp {
    color: #e90 !important; /* og coy e90 orange */
  }



  body.horizontal {
    div#editor-container {
      flex-direction: column;
    }
  }

  .ace_scroller.ace_scroll-left {
    box-shadow: none !important;
  }

  /* SEARCH */

  .ace_search {
    background-color: #f4f4f4 !important;
    box-shadow: 0px 12px 12px rgba(0, 0, 0, 0.16) !important;
    max-width: 365px !important;
    width: 365px !important;
    height: 138px !important;
    font-family: montserrat !important;
    font-size: 12px !important;
    color: #b5b5b5 !important;
    border-radius: 0 !important;
    border: none !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  .ace_replace_form {
    width: 365px !important;
    height: 134px !important;
    background-color: #f4f4f4 !important;
    box-shadow: 0px 12px 12px rgba(0, 0, 0, 0.16) !important;
    margin-top: 80px !important;
    border: none !important;
    padding: 0 !important;
  }

  .ace_search_form .ace_search_field {
    top: 51px !important; 
  }

  .ace_replace_form .ace_search_field {
    top: 131px !important; 
  }

  .ace_search_field {
    width: 324px !important;
    height: 40px !important;
    padding: 10px !important;
    position: absolute !important;
    left: 22px !important;
    background-color: white !important;
    outline: 0 !important;
    border: 1px solid #979797 !important;
  }

  .ace_search_form {
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .ace_search_options {
    margin: 0 !important;
    padding: 0 !important;
    position: absolute !important;
    top: 100px !important;
    left: 31px !important;
  }

  .ace_button {
    border: none !important;
    opacity: 0.75 !important;
    color: #b5b5b5 !important;
    margin-right: 12px !important;

    &:hover {
      background-color: none !important;
      opacity: 0.35 !important;
    }
  }

  .ace_searchbtn, .ace_replacebtn {
    background-color: rgba(0, 0, 0, 0) !important;
    border: none !important;
    color: #b5b5b5 !important;
    opacity: 0.75 !important;
    position: absolute !important;
    height: 20px !important;

    &:hover {
      opacity: 0.35 !important;
    }
  }

  .ace_searchbtn {
    top: 100px !important;
  }
  .ace_replacebtn {
    top: 180px !important;
  }

  .ace_search_form button:nth-of-type(1) {
    left: 257px !important;
  }
  .ace_search_form button:nth-of-type(2) {
    left: 287px !important;
  }
  .ace_search_form button:nth-of-type(3) {
    left: 317px !important;
  }

  .ace_searchbtn_close {
    background: url('../assets/images/close-button.svg') !important;

    width: 24px !important;
    height: 24px !important;
    position: absolute !important;
    top: 15px !important;
    right: 14px !important;
    fill: #2F2F30 !important;
    transition: all 0.1s ease !important;
    margin: 0 !important;
    padding: 0 !important;

    &:hover {
      opacity: 0.65 !important;
    }
  }

  .ace_replace_form button:nth-of-type(1) {
    margin-left: 31px !important;
  }

  .ace_replace_form button:nth-of-type(2) {
    margin-left: 319px !important;
    width: 27px !important;
  }

</style>