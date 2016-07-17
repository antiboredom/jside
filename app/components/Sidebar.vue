<template>
  <div id="sidebar-container" :class="[className]"  @contextmenu="popupMenu(this, $event)">
    <div id="sidebar">
      <div id="filetree">
        <ul>
          <li v-for="file in files | orderBy 'name'">
            <component :is="file.type" :item="file"></component>
          </li>
        </ul>
      </div>
    </div>
    <div id="sidebar-drag" @mousedown="startDrag"></div>
  </div>
</template>

<script>
  var Path = require('path')
  // var fs = require('fs')
  // var trash = require('trash')
  var Vue = require('vue')

  var File = require('../files')
  var _ = require('underscore')
  var $ = require('jquery')

  // const {remote} = require('electron')
  // const {Menu, MenuItem} = remote

  Vue.component('file', {
    name: 'File',
    template: require('./file.html'),
    props: {
      item: {
        required: true
      }
    },
    computed: {
      hidden: function () {
        return this.item.name[0] === '.'
      },
      icon: function () {
        if (this.item.ext.match(/(png|jpg|gif|svg|jpeg)$/i)) return 'image'
        else if (this.item.ext.match(/db$/i)) return 'db'
        else return 'file'
      },
      className: function () {
        return this.$root.currentFile.path === this.item.path ? 'selected' : ''
      }
    },

    methods: {
      popupMenu: function (target, event) {
        popupMenu.apply(this, arguments)
      },
      openFile: function () {
        this.$root.openFile(this.item.path)
      }
    }
  })

  Vue.component('folder', {
    name: 'Folder',
    template: require('./folder.html'),
    props: {
      item: {
        required: true
      }
    },
    data: function () {
      return {
        open: false,
        icon: 'folder'
      }
    },
    methods: {
      popupMenu: function (target, event) {
        popupMenu.apply(this, arguments)
      },
      toggleFolder: function () {
        this.open = !this.open
        var self = this
        if (this.open) {
          File.list(this.item.path, function (files) {
            var childrenIds = _.map(self.children, _.property('id'))
            var newFiles = _.filter(files, function (file) { return !_.contains(childrenIds, file.id) })
            self.item.children = self.item.children.concat(newFiles)
            if (!this.item.watching) {
              self.item.watching = true
              self.$root.watch(self.path)
            }
            // if (typeof cb === 'function') cb() // TODO fix this (where is cb?)
          })
        }
      }
    }
  })

  export default {
    name: 'Sidebar',
    props: ['files'],

    data: function () {
      return {
        sidebarWidth: 0,
        containerWidth: 0
      }
    },

    computed: {
      className: function() {
        return String(this.$root.settings.showSidebar) === 'true' ? 'expanded' : ''
      }
    },

    watch: {
      className: function(value) {
        const container = $('#sidebar-container')
        if (value === 'expanded') {
          $('#showSidebarLabel').html($('#showSidebarLabel').data('hide'))
          container.css({
            width: this.sidebarWidth
          })
        } else {
          $('#showSidebarLabel').html($('#showSidebarLabel').data('show'))
          this.sidebarWidth = container.width()
          container.css({
            width: 10
          })
        }
        // ace.resize() // TODO get ref to ace
      }
    },

    events: {
      'open-nested-file': 'openNestedFile'
    },

    ready: function () {
      var container = $('#sidebar-container')
      this.sidebarWidth = container.width()
    },

    methods: {
      popupMenu: function (target, event) {
        popupMenu.apply(this, arguments)
      },

      openFile: function (file) {
        this.$root.openFile(file.path)
      },

      openNestedFile: function (path) {
        var self = this
        var dirname = Path.dirname(path)
        var f = _.findWhere(this.$root.files, {
          path: dirname
        })
        if (f) {
          this.toggleFolder(f, function () {
            self.$root.openFile(path)
          })
        }
      },

      startDrag: function (e) {
        var container = $('#sidebar-container')
        $(document).on('mousemove', function (e) {
          container.css({
            width: e.clientX
          })
          // ace.resize() // TODO get ref
        }).on('mouseup', function (e) {
          $(document).off('mouseup').off('mousemove')
        })
      }
    }
  }

  // to do - onely make this once! don't generate each time
  var popupMenu = function (file, e) {
    e.preventDefault()
    // var self = this
    // var menu = new gui.Menu()
    // if (file.type === "file" || file.type === "folder") {
    //   menu.append(new gui.MenuItem({
    //     label: "Reveal",
    //     click: function() {
    //       gui.Shell.showItemInFolder(file.path)
    //     }
    //   }))
    //   menu.append(new gui.MenuItem({
    //     label: "Rename",
    //     click: function() {
    //       self.$root.renameFile(file.path)
    //     }
    //   }))
    //   menu.append(new gui.MenuItem({
    //     label: "Delete",
    //     click: function() {
    //       trash([file.path], function(err) {})
    //     }
    //   }))
    // }

    // menu.append(new gui.MenuItem({
    //   label: "New file",
    //   click: function() {
    //     self.$root.newFile(file.type == 'folder' ? file.path : self.$root.projectPath)
    //   }
    // }))

    // menu.append(new gui.MenuItem({
    //   label: "New folder",
    //   click: function() {
    //     self.$root.newFolder(file.type == 'folder' ? file.path : self.$root.projectPath)
    //   }
    // }))
    // menu.popup(e.clientX, e.clientY)
  }
</script>

<style lang="scss">
  $light-gray-1: #eeeceb;
  $light-gray-2: #e1dedc;
  $light-gray-3: #c8c5c2;
  $med-gray: #959595;
  $dark-gray: #58585b;

#side-container {
  flex-direction: column;
  display: flex;
  font-size: 12px;
  margin-top: 5px;
}

  #sidebar-container {
    -webkit-user-select: none;
    visibility: hidden;
    position: relative;
    width: 10px;
    margin-top: 55px;
    flex: 1;
    overflow-y: auto;
  }

  #sidebar-container.expanded{
    display: flex;
    flex-direction: column;
    width:120px;
    visibility: visible;
    min-width: 120px;
  }


  #sidebar {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .runfile {
    position: absolute;
    margin-left: -30px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 10px solid #38B449;
    top: 4px;
    display: none;
    cursor: pointer;
    opacity: .4;
  }

  .runfile.mainfile {
    opacity: 1;
    display: block;
  }

  #sidebar-drag {
    flex: none;
    cursor: col-resize;
    background-color: none;
    position: absolute;
    width: 7px;
    height: 100%;
    right: 0;
    top: 0;
  }



  #filetree {
    overflow-x: auto;
    flex: 1;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        margin: 0;
        padding: 0;
        position: relative;

        div {
          padding: 3px;
          padding-left:30px;
          cursor: pointer;
          color: #b5b5b5;
          min-width: 60px;
        }

        div.selected {
          background-color: rgba(153, 153, 153, 0.1);
        }

        ul li {
          div {
            padding-left: 46px;

          }

          ul li {
            div {
              padding-left: 106px;
            }

            ul li {
              div {
                padding-left: 127px;
              }
            }
          }
        }
      }
    }

    .toggle {
      top: 1px;
      margin-left: -23px;
      position: absolute;
      width: 24px;
      margin-top: -3px;
      height: 24px;
      opacity: 0.4;


      &.open {
        background-image: url('../assets/images/expanded.svg');
      }

      &.closed {
        background-image: url('../assets/images/collapsed.svg');
      }
    }

    .icon {
      width: 9px;
      height: 12px;
      position: absolute;
      top: 4px;
      margin-left: -15px;
      background-size: 9px auto;
      background-repeat: no-repeat;
      opacity: 0.5;
    }

    .icon.file {
      background-image: url('../assets/images/file1.svg');
    }

    .icon.db {
      background-image: url('../assets/images/database.svg');
    }

    .icon.folder {
      background-image: url('../assets/images/folder.svg');
      background-size: 12px auto;
      top: 5px;
      margin-left: -22px;
      width: 12px;
      height: 12px;
    }

    .icon.image {
      background-image: url('../assets/images/image.svg');
    }
  }

</style>