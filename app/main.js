import Path from 'path'
import fs from 'fs'
// import os from 'os'
import chokidar from 'chokidar'
import rimdir from 'rimraf'

import Vue from 'vue'
import $ from 'jquery'
import _ from 'underscore'
import keybindings from './keybindings'
import Files from './files'
// import windowstate from './windowstate'
import updater from './updater'
import settings from './settings'
let modes = {
  p5: require('./modes/p5/p5-mode')
}

const shell = require('electron').shell
const remote = require('electron').remote
const dialog = remote.dialog
const ipcRenderer = require('electron').ipcRenderer

// Pasrse any arguments that were sent when creating this BrowserWindow e.g. parentWinId
require('electron-window').parseArgs()

// Require in the window vue component which has global styles for the app
require('./Window')

/* eslint-disable no-new */
window.vueApp = new Vue({
  el: '#app',

  mode: modes.p5,

  components: {
    editor: require('./components/Editor'),
    sidebar: require('./components/Sidebar'),
    settings: require('./components/Settings'),
    debug: require('./components/Debug'),
    tabs: require('./components/Tabs')
  },

  data: {
    title: 'Untitled',
    projectPath: window.__args__.PATH,
    unsaved: window.__args__.UNSAVED,
    windowURL: window.location.href,
    temp: true,
    running: false,
    focused: false,
    settings: {},
    showSettings: false,
    files: [],
    tabs: [],
    justSaved: false,
    askReload: false,
    fileTypes: ['txt', 'html', 'css', 'js', 'json', 'scss', 'xml', 'csv', 'less'],
    outX: 50,
    outY: 50,
    currentFile: {},
    dialogIsOpen: false
  },

  computed: {
    projectName: function () {
      console.log(`projectpath var is = ${this.projectPath}`)
      return (typeof this.projectPath != 'undefined') ? Path.basename(this.projectPath) : ''
    },

    orientation: function () {
      let orientation = this.settings.consoleOrientation
      return orientation
    }
  },

  ready: function () {
    updater.check()
    keybindings.setup(this)

    this.setupCloseHandler()
    this.setupDragListener()
    this.setupSettings()

    if (this.projectPath) {
      if (!this.unsaved) this.temp = false
      let filename = null

      if (fs.lstatSync(this.projectPath).isFile()) {
        // keep the name of the file to be opened
        filename = this.projectPath

        // set the projectPath to the enclosing folder
        this.projectPath = Path.dirname(this.projectPath)
      }

      if (window.FILEPATH && fs.lstatSync(window.FILEPATH).isFile()) {
        filename = window.FILEPATH
      }

      // load the project and open the selected file
      let self = this
      this.loadProject(this.projectPath, function () {
        if (filename) {
          if (Path.dirname(filename) === self.projectPath) {
            self.openFile(filename)
          } else {
            self.$broadcast('open-nested-file', filename)
          }
        }
        // remote.getCurrentWindow().show()
      })

      updateRecentFiles(this.temp, this.projectPath)
    } else {
      // if we don't have a project path global, create a new project
      this.modeFunction('newProject')
    }
    let win = remote.getCurrentWindow()
    win.setMinimumSize(400, 400)
    if (($(window).width() + 100 >= screen.width) || ($(window).height() + 100 >= screen.height)) {
      // console.log(`screen width=${screen.width}. screen height=${screen.height}`)
      // console.log(`setsize width=${(screen.width * 4) / 5}. set size height=${(screen.height * 7) / 8}`)
      win.setSize(Math.floor((screen.width * 4) / 5), Math.floor((screen.height * 7) / 8))
    }
  },

  methods: {
    // runs a function named func in the mode file currently being used
    modeFunction: function (func, args) {
      let mode = this.$options.mode
      if (typeof mode[func] === 'function') {
        // make args an array if it isn't already
        // typeof args won't work because it returns 'object'
        if (Object.prototype.toString.call(args) !== '[object Array]') {
          args = [args]
        }
        mode[func].apply(this, args)
      }
    },

    setupSettings: function () {
      this.settings = settings.load()
      this.$watch('settings', function (value) {
        this.$broadcast('settings-changed', value)
        settings.save(value)
      })
    },

    setupCloseHandler: function () {
      // let self = this
      // let win = remote.getCurrentWindow()
      // win.on('close', function (closeEvent) {
      //   // check to see if there are unsaved files
      //   let shouldClose = true
      //   if (_.any(self.files, function (f) { return f.contents !== f.lastSavedContents })) {
      //     shouldClose = confirm('You have unsaved files. Quit and lose changes?')
      //   }
      //   if (shouldClose) {
      //     // clean up output window
      //     if (self.outputWindow) {
      //       self.outputWindow.close()
      //     }

      //     // save window state if the user quit the program
      //     if (closeEvent === 'quit') {
      //       // windowstate.save(self, win)
      //     }

      //     // windowstate.decrementWindows()
      //     // if (windowstate.totalWindows() < 1) {
      //     //   gui.App.quit()
      //     // }

      //     // close this window
      //     // this.close(true)
      //     // win.close()
      //   }
      // })

      // win.on('focus', function () {
      //   self.focused = true
      //   self.resetMenu()
      //   // if (self.askReload) {
      //   //   self.askReload = false
      //   //   let shouldRefresh = confirm(self.currentFile.path + ' was edited on the disk. Reload? You will lose any changes.')
      //   //   if (shouldRefresh) {
      //   //     let win = self.newWindow(self.windowURL)
      //   //     // windowstate.decrementWindows()

      //   //     win.webContents.on('did-finish-load', function () {
      //   //       win.webContents.executeJavaScript(`window.PATH = '${self.currentFile.path}'`)
      //   //       remote.getCurrentWindow().close()
      //   //     })
      //   //   }
      //   // }
      // })

      // win.on('blur', function () {
      //   self.focused = false
      // })
    },

    // todo: setup drag and drop
    setupDragListener: function () {
      let self = this
      window.ondragover = function (e) { e.preventDefault(); return false }
      window.ondrop = function (e) {
        e.preventDefault()
        if (e.dataTransfer.files[0]) {
          let path = e.dataTransfer.files[0].path
          self.openProject(path)
        }
        return false
      }
    },

    // create a new window 50px below current window
    newWindow: function (url, options, preloadArgs) {
      let currentWindow = remote.getCurrentWindow()
      console.log(`Current BrowserWindow id=${currentWindow.id}`)

      let winSettings = _.extend({
        x: currentWindow.x + 50,
        y: currentWindow.y + 50,
        width: 1024,
        height: 768
      }, options)

      ipcRenderer.send('createWindow', url, winSettings, preloadArgs)
    },

    newOutputWindow: function (url, options, preloadArgs) {
      let currentWindow = remote.getCurrentWindow()
      console.log(`Current BrowserWindow id=${currentWindow.id}`)

      let winSettings = _.extend({
        x: currentWindow.x + 50,
        y: currentWindow.y + 50,
        width: 1024,
        height: 768
      }, options)

      ipcRenderer.send('createOutputWindow', url, winSettings, preloadArgs)
    },

    // open an existing project with a new window
    open: function () {
      if (!this.dialogIsOpen) {
        this.dialogIsOpen = true
        dialog.showOpenDialog({
          title: 'Open File',
          properties: ['openFile']
        }, (filenames) => {
          console.log(filenames)
          console.log(this)
          this.dialogIsOpen = false
          if (filenames === undefined) return
          let path = filenames[0]
          this.openProject(path)
        })
      }
    },

    openProject: function (path, temp) {
      // set the project path of the new window
      if (fs.lstatSync(path).isDirectory()) {
        let sketchPath = Path.join(path, 'sketch.js')
        if (fs.existsSync(sketchPath)) path = sketchPath
      }
      if (temp !== true) { temp = false }
      let preloadArgs = {PATH: path, UNSAVED: temp}

      // create the new window
      this.newWindow(this.windowURL, null, preloadArgs)
    },

    // load project files
    loadProject: function (path, callback) {
      let self = this
      Files.list(path, function (files) {
        self.files = files
        self.watch(path)
        if (typeof callback === 'function') callback()
      })
    },

    // watch the project file tree for changes
    watch: function (path) {
      let self = this

      // don't watch recursively
      let watcher = chokidar.watch(path, {
        ignoreInitial: true,
        ignored: function (filepath) {
          let regex = new RegExp(path + '\/.*\/.+')
          return regex.test(filepath)
        }
      })

      watcher.on('add', function (path) {
        let f = Files.setup(path)
        Files.addToTree(f, self.files, self.projectPath)
      }).on('addDir', function (path) {
        let f = Files.setup(path, {type: 'folder', children: []})
        Files.addToTree(f, self.files, self.projectPath)
      }).on('unlink', function (path) {
        Files.removeFromTree(path, self.files)
      }).on('unlinkDir', function (path) {
        Files.removeFromTree(path, self.files)
      }).on('change', function (path) {
        console.log('self.files')
        console.log(self.files)
        console.log(`path = ${path}`)
        if (Files.find(self.files, path).open === true) {
          if (self.justSaved) {
            self.justSaved = false
          } else {
            console.log(path)
            if (!self.temp) self.askReload = true
          }
        }
      })
    },

    // close the window, checking for unsaved file changes
    closeProject: function () {
      const outputWinId = remote.getCurrentWindow().outputWinId
      if (this.focused) {
        if (outputWinId !== null) {
          remote.BrowserWindow.fromId(outputWinId).close()
        }
        remote.getCurrentWindow.close()
      } else {
        if (this.outputWindow) {
          this.toggleRun()
        }
      }
    },

    // save all open files
    saveAll: function () {
      _.where(this.files, {type: 'file', open: true}).forEach(function (file) {
        if (file.lastSavedContents !== file.contents) {
          fs.writeFileSync(file.path, file.contents, 'utf8')
          file.lastSavedContents = file.contents
        }
      })
      updateRecentFiles(this.temp, this.projectPath)
      this.justSaved = true
    },

    saveAs: function () {
      if (!this.dialogIsOpen) {
        this.dialogIsOpen = true
        dialog.showSaveDialog({
          title: 'Save'
        }, (filename) => {
          console.log(filename)
          console.log(this)
          this.dialogIsOpen = false
          if (filename === undefined) return

          if (this.temp) {
            // mode specific action
            this.modeFunction('saveAs', filename)
            updateRecentFiles(this.temp, this.projectPath)
          } else {
            // save a file
            // if the we are saving inside the project path just open the new file
            // otherwise open a new window
            fs.writeFileSync(filename, this.currentFile.contents, 'utf8')
            if ((Path.dirname(filename) + '/').indexOf(this.projectPath + '/') > -1) {
              let f = Files.setup(filename)
              Files.addToTree(f, this.files, this.projectPath)
              this.openFile(filename)
            } else {
              this.openProject(filename)
            }
          }
        })
      }
    },

    saveProjectAs: function () {
      if (!this.dialogIsOpen) {
        this.dialogIsOpen = true
        dialog.showSaveDialog({
          title: 'Save'
        }, (filename) => {
          console.log(filename)
          console.log(this)
          this.dialogIsOpen = false
          if (filename === undefined) return

          const path = filename
          const self = this
          fs.exists(path, function (existing) {
            if (existing) {
              rimdir(path, function (error) {
                if (error) throw error
                self.modeFunction('saveAs', path)
              })
            } else {
              self.modeFunction('saveAs', path)
            }
          })
        })
      }
    },

    saveFile: function () {
      // if this is a new project then trigger a save-as
      if (this.temp) {
        this.saveAs()
      } else {
        // otherwise just write the current file
        this.writeFile()
      }
    },

    // saveFileAs: function (path) {
    //   let originalName = Path.basename(path)
    //   let newName = prompt('Save file as:', originalName)
    //   if (!newName || newName === originalName) return false

    //   let self = this
    //   let filename = Path.join(Path.dirname(path), newName)
    //   fs.writeFile(filename, this.currentFile.contents, 'utf8', function (err) {
    //     if (err) throw err
    //     Files.setup(filename)
    //     self.openFile(filename)
    //   })
    // },

    writeFile: function () {
      let self = this

      self.justSaved = true

      fs.writeFileSync(this.currentFile.path, this.currentFile.contents, 'utf8')
      this.currentFile.lastSavedContents = this.currentFile.contents
    },

    // open up a file - read its contents if it's not already opened
    openFile: function (path, callback) {
      let self = this
      let re = /(?:\.([^.]+))?$/
      let ext = re.exec(path)[1]

      let file = Files.find(this.files, path)
      if (!file) return false
      if (self.fileTypes.indexOf(ext) < 0) {
        window.alert('Unsupported file type. Types we can edit:\n' + self.fileTypes.toString())
      } else {
        if (file.open) {
          this.title = file.name
          this.currentFile = file
          this.$broadcast('open-file', this.currentFile)
        } else {
          fs.readFile(path, 'utf8', function (err, fileContents) {
            if (err) throw err
            file.contents = file.originalContents = file.lastSavedContents = fileContents
            file.open = true
            self.title = file.name
            self.currentFile = file
            self.$broadcast('open-file', self.currentFile)
            self.$broadcast('add-tab', self.currentFile, self.tabs)

            if (typeof callback === 'function') callback(file)
          })
        }
      }
    },

    closeFile: function (path) {
      // check to see if there are unsaved files
      let file = Files.find(this.files, path)
      if (!file) return false

      // if (this.tabs.length === 1) {
      //   let win = remote.getCurrentWindow()
      //   win.close()
      // }
      let shouldClose = true
      // let win = remote.getCurrentWindow()
      if (file.contents !== file.lastSavedContents) {
        shouldClose = confirm('You have unsaved changes. Close file and lose changes?')
      }
      if (shouldClose) {
        file.open = false
        file.contents = file.lastSavedContents
        this.$broadcast('close-file', file)
        return true
      }
      return false
    },

    // create a new file and save it in the project path
    newFile: function (basepath) {
      let title = prompt('Choose a file name and type: \nSupported types: ' + this.fileTypes.toString()).replace(/ /g, '')
      let dotSplit = title.split('.')
      let re = /(?:\.([^.]+))?$/

      if (!title) return false

      if (this.fileTypes.indexOf(re.exec(title)[1]) < 0 || (dotSplit.length > 2)){
        window.alert('unsupported/improper file type selected.\nAutomaticallly adding a .js extension')
        title = dotSplit[0] + '.js'
      }

      if (typeof basepath === 'undefined') {
        basepath = this.projectPath
      }

      let filename = Path.join(basepath, title)

      let self = this
      fs.writeFile(filename, '', 'utf8', function (err) {
        if (err) throw err
        let f = Files.setup(filename)
        Files.addToTree(f, self.files, self.projectPath)
        self.openFile(filename)
      })
    },

    newFolder: function (basepath) {
      let title = prompt('Folder name:')
      if (!title) return false

      if (typeof basepath === 'undefined') {
        basepath = this.projectPath
      }

      let filename = Path.join(basepath, title)

      // let self = this
      fs.mkdir(filename)
    },

    renameFile: function (path) {
      let originalName = Path.basename(path)
      let newName = prompt('Rename ' + originalName + ' to:', originalName)
      if (!newName) return false

      fs.rename(path, Path.join(Path.dirname(path), newName))
    },

    run: function () {
      // $('#debug').html('')
      this.modeFunction('run')
    },

    toggleRun: function () {
      if (this.running) {
        this.modeFunction('stop')
      } else {
        // $('#debug').html('')
        console.log('toggle run calling modeFunction run!')
        this.modeFunction('run')
      }
    },

    changeFontSize: function (sz) {
      this.settings.fontSize = parseInt(this.settings.fontSize) + sz
    },

    toggleSettingsPane: function () {
      this.showSettings = !this.showSettings
    },

    toggleSidebar: function () {
      this.settings.showSidebar = !this.settings.showSidebar
    },

    showHelp: function () {
      // gui.Shell.openExternal(this.$options.mode.referenceURL)
      shell.openExternal(this.$options.mode.referenceURL)
    },

    showSketchFolder: function () {
      shell.showItemInFolder(this.projectPath)
    }

  }
})

// console.log(vueApp)

function updateRecentFiles (isVueAppTemp, path) {
  ipcRenderer.send('updateRecentFiles', isVueAppTemp, path)
}

// Subscribe to IPC messages from the main process
ipcRenderer.on('winClose', () => {

})

ipcRenderer.on('outputWinClose', (event, winBounds) => {
  // console.log('Output win close ipc event received')
  const vueApp = window.vueApp
  vueApp.outX = winBounds.x
  vueApp.outY = winBounds.y
  vueApp.outW = winBounds.width
  vueApp.outH = winBounds.height
  vueApp.running = false
})

ipcRenderer.on('outputWinResized', () => {
  console.log('Output win resized ipc event received')
  const vueApp = window.vueApp
  vueApp.resizedOutputWindow = true
})

ipcRenderer.on('openProject', (event, path) => {
  const vueApp = window.vueApp
  vueApp.openProject(path)
})

ipcRenderer.on('launchExample', (event, path) => {
  const vueApp = window.vueApp
  vueApp.modeFunction('launchExample', path)
})

ipcRenderer.on('addLibrary', (event, lib) => {
  const vueApp = window.vueApp
  vueApp.modeFunction('addLibrary', lib)
})
