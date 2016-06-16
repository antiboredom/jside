const Path = require('path')
const $ = require('jquery')
const _ = require('underscore')
const Files = require('./files')

const {remote} = require('electron')
const ipcRenderer = require('electron').ipcRenderer
const shell = require('electron').shell
const {Menu} = remote
import storage from 'electron-json-storage'

let nodeGlobal = remote.getGlobal('sharedObj')
let isMac = nodeGlobal.isMac

let menu

let appMenu
let windowMenu
let fileMenu
let editMenu
let viewMenu
let helpMenu
let serialMenu
let openRecent

const fs = require('fs')

module.exports.setup = function (app) {
  const appName = remote.app.getName()

  // Template for 'app' menu found on OSX
  appMenu = {
    label: appName,
    submenu: [
      {
        label: 'About ' + appName,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + appName,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click () { app.quit() }
      }
    ]
  }

  // Template for window menu commonly found on OSX
  windowMenu = {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    ]
  }

  fileMenu = {
    label: 'File',
    submenu: [
      {
        label: 'New Project',
        accelerator: 'CmdOrCtrl+Shift+N',
        click (item, focusedWindow) {
          app.newWindow(app.windowURL)
        }
      },
      {
        label: 'New File',
        accelerator: 'CmdOrCtrl+N',
        click (item, focusedWindow) {
          app.newFile()
        }
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click (item, focusedWindow) {
          // $('#openFile').trigger('click')
          app.open()
        }
      }
    ]
  }

  openRecent = { label: 'Open Recent' }
  // module.exports.updateRecentFiles(app)
  fileMenu.submenu.push(openRecent)

  fileMenu.submenu.push(...[
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      click (item, focusedWindow) {
        app.closeProject()
      }
    },
    {
      label: 'Save',
      accelerator: 'CmdOrCtrl+S',
      click (item, focusedWindow) {
        app.saveFile()
      }
    },
    {
      label: 'Save As...',
      accelerator: 'CmdOrCtrl+Shift+S',
      click (item, focusedWindow) {
        app.saveProjectAs()
      }
    }
  ])

  // add menu option for loading example sketches
  let examplesMenu = {label: 'Examples'}
  examplesMenu.submenu = makeExampleCategorySubMenu(app)
  fileMenu.submenu.push(examplesMenu)

  let importLibsMenu = { label: 'Import Library' }
  importLibsMenu.submenu = makeImportLibsSubMenu(app)
  fileMenu.submenu.push(importLibsMenu)

  fileMenu.submenu.push({type: 'separator'})

  fileMenu.submenu.push({
    label: 'Run',
    accelerator: 'CmdOrCtrl+R',
    click (item, focusedWindow) {
      app.run()
    }
  })

  editMenu = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        click () {
          app.$refs.editor.ace.execCommand('undo')
        }
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        click () {
          app.$refs.editor.ace.execCommand('redo')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Delete',
        accelerator: 'CmdOrCtrl+D',
        click () {
          app.$refs.editor.ace.execCommand('del')
        }
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
      {
        type: 'separator'
      },
      {
        label: 'Find',
        accelerator: 'CmdOrCtrl+F',
        click () {
          app.$refs.editor.ace.execCommand('find')
        }
      },
      {
        label: 'Find and Replace',
        accelerator: 'CmdOrCtrl+Alt+F',
        click () {
          app.$refs.editor.ace.execCommand('replace')
        }
      }
    ]
  }

  viewMenu = {
    label: 'View',
    submenu: [
      {
        label: 'Show Sketch Folder',
        accelerator: 'CmdOrCtrl+K',
        click (item, focusedWindow) {
          shell.showItemInFolder(app.projectPath)
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Reformat',
        accelerator: 'CmdOrCtrl+T',
        click (item, focusedWindow) {
          app.$refs.editor.reformat()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Toggle Settings Panel',
        accelerator: 'CmdOrCtrl+,',
        click (item, focusedWindow) {
          app.toggleSettingsPane()
        }
      },
      {
        label: 'Toggle Sidebar',
        accelerator: 'CmdOrCtrl+.',
        click (item, focusedWindow) {
          app.toggleSidebar()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Increase Font Size',
        accelerator: 'CmdOrCtrl+=',
        click () {
          app.changeFontSize(1)
        }
      },
      {
        label: 'Decrease Font Size',
        accelerator: 'CmdOrCtrl+-',
        click () {
          app.changeFontSize(-1)
        }
      }
    ]
  }

  serialMenu = {
    label: 'Serial',
    submenu: [
      {
        label: getSerialMenuItemLabel(),
        click () {
          if (!nodeGlobal.serialRunning) {
            ipcRenderer.send('startSerialServer')
          } else {
            ipcRenderer.send('stopSerialServer')
          }
        }
      }
    ]
  }

  helpMenu = {
    label: 'Help',
    submenu: [
      {
        label: 'Reference',
        role: 'help',
        click (item, focusedWindow) {
          app.showHelp()
        }
      }
    ]
  }

  // Make the serial menu with the correct menu item (i.e. start serial server or stop serial server)
  makeMenu()
  // Menu.setApplicationMenu(menu)
  module.exports.updateRecentFiles()
  remote.getCurrentWindow().setMenu(menu)
}

module.exports.resetMenu = () => {
  // update the serial menu item label
  serialMenu.submenu[0].label = getSerialMenuItemLabel()

  // Remake the menu again from the template objects.
  // Side note: As far as I can see, Electron does not allow dynamic updating
  // of an already created menu object so have to re-create
  makeMenu()

  // Set this window's menu to the updated menu
  remote.getCurrentWindow().setMenu(menu)
}

module.exports.addRecentFile = () => {

}

module.exports.updateRecentFiles = (app, path) => {
  storage.get('recentFiles', (error, data) => {
    if (error) throw error
    let recentFiles = _.isEmpty(data) ? [] : data.paths

    if (path !== undefined && !app.temp) {
      // Add new path to the beginning of the recentFiles array
      recentFiles.unshift(path)
    }

    // Get rid of duplicates
    recentFiles = _.unique(recentFiles)

    if (recentFiles.length > 10) recentFiles.pop()

    storage.set('recentFiles', {paths: recentFiles}, (error, data) => {
      if (error) throw error
      let openRecentSubMenu = []
      recentFiles.forEach((p) => {
        openRecentSubMenu.push({
          label: Path.basename(p),
          click () { app.openProject(p) }
        })
      })

      // Create a clear recent projects menu item
      if (recentFiles.length > 0) {
        openRecentSubMenu.push(
          { type: 'separator' },
          {
            label: 'Clear Recent Projects',
            click () {
              storage.remove('recentFiles', () => {
                // Update the menu
                module.exports.updateRecentFiles(app)
              })
            }
          }
        )
      }

      openRecent.submenu = openRecentSubMenu
      openRecent.enabled = (openRecentSubMenu.length !== 0)
      module.exports.resetMenu()
    })
  })
}

function makeMenu () {
  const template = []
  if (isMac) {
    template.push(...[
      appMenu,
      windowMenu
    ])
  }

  template.push(...[
    fileMenu,
    viewMenu,
    serialMenu,
    helpMenu
  ])

  template.splice(1, 0, editMenu)

  menu = Menu.buildFromTemplate(template)
}

function getSerialMenuItemLabel () {
  const label = nodeGlobal.serialRunning ? 'Stop Serial Server' : 'Start Serial Server'
  // console.log(`Serial menu item label: ${label}`)
  return label
}

function makeExampleCategorySubMenu (app) {
  // create submenu
  let exampleDir = Path.join('static', 'mode_assets', 'p5', 'examples')

  // get latest example categories
  let files = fs.readdirSync(exampleDir)
  let exampleCategorySubMenu = []

  files.forEach(function (category) {
    let sketchMenu = []
    let categoryLabel = {label: category}
    // populate submenu with sketches for that category
    let categoryDir = Path.join(exampleDir, category)
    if (fs.lstatSync(categoryDir).isDirectory()) {
      let sketches = fs.readdirSync(categoryDir)
      sketches.forEach(function (fileName) {
        sketchMenu.push(
          {
            label: Files.cleanExampleName(fileName),
            click (item, focusedWindow) {
              app.modeFunction('launchExample', exampleDir.concat('/').concat(category).concat('/').concat(fileName))
            }
          }
        )
      })
      categoryLabel.submenu = sketchMenu
      exampleCategorySubMenu.push(categoryLabel)
    }
  })
  return exampleCategorySubMenu
}

function makeImportLibsSubMenu (app) {
  let importLibsSubMenu = []
  let libFiles = fs.readdirSync(Path.join('static', 'mode_assets', 'p5', 'libraries'))
  libFiles.forEach(function (lib) {
    importLibsSubMenu.push({
      label: Path.basename(lib),
      click: () => {
        app.modeFunction('addLibrary', lib)
      }
    })
  })
  return importLibsSubMenu
}
