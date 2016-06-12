<template>
  <div>
    <div id="debug-drag" @mousedown="startDrag">
      <span class='prompt-label'>&gt;_</span>
      <span class='console-label'>console</span>
    </div>
    <div id="debug" :style="{fontSize: $root.settings.fontSize + 'px'}"></div>
  </div>
</template>

<script>
  var $ = require('jquery')
  var AutoLinker = require('autolinker')
  var Path = require('path')
  var fs = require('fs')
  var ipcRenderer = require('electron').ipcRenderer

  module.exports = {
    name: 'Debug',

    data: function () {
      return {
        orientation: undefined,
        debugWidth: undefined
      }
    },

    methods: {

      startDrag: function (e) {
        if ($('body').hasClass('horizontal')) {
          this.horizonatlDrag(e)
        } else {
          this.verticalDrag(e)
        }
      },

      horizonatlDrag: function (e) {
        var container = $('#debug-container')
        var startY = e.clientY
        var startHeight = container.height()
        var self = this
        $(document).on('mousemove', function (e) {
          container.css({
            height: startHeight - (e.clientY - startY)
          })
          self.debugWidth = startHeight - (e.clientY - startY)
          self.ace.resize()
        }).on('mouseup', function (e) {
          $(document).off('mouseup').off('mousemove')
        })
      },

      verticalDrag: function (e) {
        var container = $('#debug-container')
        var startX = e.clientX
        var startWidth = container.width()
        var self = this
        $(document).on('mousemove', function (e) {
          container.css({
            width: startWidth - (e.clientX - startX)
          })
          self.debugWidth = startWidth - (e.clientX - startX)
          self.ace.resize()
        }).on('mouseup', function (e) {
          $(document).off('mouseup').off('mousemove')
        })
      },

      checkSize: function (value) {
        if (this.orientation != value.consoleOrientation) {
          this.orientation = value.consoleOrientation
          var container = $('#debug-container')
          if (this.orientation === 'vertical') {
            container.css({
              width: this.debugWidth.toString() + 'px',
              height: 'auto'
            })
            $('.prompt-label').css('margin-left', '8px')
            $('.console-label').css('margin-left', '5px')
          } else {
            container.css({
              width: 'auto',
              height: this.debugWidth > $('#editor-container').height() ? '100px' : this.debugWidth.toString() + 'px'
            })
            $('.prompt-label').css('margin-left', '25px')
            $('.console-label').css('margin-left', '23px')
          }
        }
      },

      debugOut: function (data) {
        var msg = data.msg // .replace(/\\"/g, '"')
        var style = data.style
        var line = data.num
        var type = data.type
        // if (typeof msg === 'object') msg = JSON.stringify(msg)
        // else msg = '' + msg
        if (msg === 'Uncaught ReferenceError: require is not defined') return false
        if (style) {
          msg = msg.replace(/%c/g, '')
          msg = msg.replace('[', '')
          msg = msg.replace(']', '')
        }
        msg = AutoLinker.link(msg)
        $('#debug').append('<div class="' + type + '" style="' + (style ? style : '') + '">' + (line ? line + ': ' : '') + msg + '</div>')
        $('#debug').scrollTop($('#debug')[0].scrollHeight)
      }
    },

    ready: function () {
      this.orientation = this.$root.settings.consoleOrientation
      this.$on('settings-changed', this.checkSize)
      var container = $('#debug-container')
      this.debugWidth = container.width()
      var self = this

      ipcRenderer.on('debugMessage', (event, message) => {
        const debugData = message
        console.log(debugData)
        if (typeof debugData === 'string') {
          var data = JSON.parse(debugData)
          if (data.console) {
            self.debugOut(data.console)
          }
          if (data.downloadFile) {
            var raw = data.downloadFile[0].split(',')[1]
            var filename = Path.resolve(self.$root.projectPath, data.downloadFile[1])
            var ext = data.downloadFile[2]

            fs.writeFile(filename, raw, 'base64', function (err) {
              if (err) {
                console.log(err)
              } else {
                console.log('The file was saved!')
              }
            })
          }
        }
      })
    }

  }
</script>

<style lang="scss">
  #debug {
    background-color: #eeeeee;
    flex: 1;
    color: #333;
    overflow: auto;

    div {
      margin: 5px;
      white-space: pre;
      a {
        color: #fff;
        background-color: #333;
      }
    }
  }

  .error {
    color: red;
  }

  #debug-container {
    width: 100px;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    min-width: 10px;
    min-height: 10px;
  }

  #debug-drag {
    background-color: rgba(153, 153, 153, 0.5);
    padding-top: 2px;
    height: 18px !important;
    cursor: col-resize;
    color: #b1b1b1;
    font-size: 12px;
  }

  .prompt-label {
    margin-left: 25px;
  }

  .console-label {
    margin-left: 23px;
  }


  body.horizontal {
    #debug-container {
      height: 100px;
      width: auto;
      flex-direction: column;
      margin-right: 0;
    }

    #debug-drag {
      height: 10px;
      width: auto;
      cursor: row-resize;
    }
  }
</style>