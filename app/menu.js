import Path from 'path'
import _ from 'underscore'
import Files from './files'

import {app, Menu} from 'electron'
import window from 'electron-window'
import storage from 'electron-json-storage'
import p5serial from 'p5.serialserver'

let nodeGlobal

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

function callOnVueApp (bw, expression) {
  bw.webContents.executeJavaScript(`window.vueApp.${expression};`)
}

// Setup takes two parameters. The nodeGlobal object from background.js which is
// actually global.sharedObj. And cb which is the callback for when the menu has
// been created. Annoyingly need the callback due to asynchronous use of electron
// json storage
module.exports.setup = (nG, cb) => {
  nodeGlobal = nG
  const appName = app.getName()

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
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, 'closeProject()')
        }
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
          callOnVueApp(focusedWindow, 'newWindow(vueApp.windowURL)')
        }
      },
      {
        label: 'New File',
        accelerator: 'CmdOrCtrl+N',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, 'newFile()')
        }
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, 'open()')
        }
      }
    ]
  }

  openRecent = { label: 'Open Recent' }

  // Element 3 in fileMenu.submenu
  fileMenu.submenu.push(openRecent)

  fileMenu.submenu.push(...[
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      click (item, focusedWindow) {
        callOnVueApp(focusedWindow, 'closeProject()')
      }
    },
    {
      label: 'Save',
      accelerator: 'CmdOrCtrl+S',
      click (item, focusedWindow) {
        callOnVueApp(focusedWindow, 'saveFile()')
      }
    },
    {
      label: 'Save As...',
      accelerator: 'CmdOrCtrl+Shift+S',
      click (item, focusedWindow) {
        callOnVueApp(focusedWindow, 'saveProjectAs()')
      }
    }
  ])

  // add menu option for loading example sketches
  let examplesMenu = {label: 'Examples'}
  examplesMenu.submenu = makeExampleCategorySubMenu()
  fileMenu.submenu.push(examplesMenu)

  let importLibsMenu = { label: 'Import Library' }
  importLibsMenu.submenu = makeImportLibsSubMenu()
  fileMenu.submenu.push(importLibsMenu)

  fileMenu.submenu.push({type: 'separator'})

  fileMenu.submenu.push({
    label: 'Run',
    accelerator: 'CmdOrCtrl+R',
    click (item, focusedWindow) {
      callOnVueApp(focusedWindow, 'run()')
    }
  })

  editMenu = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, "$refs.editor.ace.execCommand('undo')")
        }
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, "$refs.editor.ace.execCommand('redo')")
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
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, "$refs.editor.ace.execCommand('del')")
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
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, "$refs.editor.ace.execCommand('find')")
        }
      },
      {
        label: 'Find and Replace',
        accelerator: 'CmdOrCtrl+Alt+F',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, "$refs.editor.ace.execCommand('replace')")
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
          callOnVueApp(focusedWindow, 'showSketchFolder()')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Reformat',
        accelerator: 'CmdOrCtrl+T',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, '$refs.editor.reformat()')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Toggle Settings Panel',
        accelerator: 'CmdOrCtrl+,',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, 'toggleSettingsPane()')
        }
      },
      {
        label: 'Toggle Sidebar',
        accelerator: 'CmdOrCtrl+.',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, 'toggleSidebar()')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Increase Font Size',
        accelerator: 'CmdOrCtrl+=',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, 'changeFontSize(1)')
        }
      },
      {
        label: 'Decrease Font Size',
        accelerator: 'CmdOrCtrl+-',
        click (item, focusedWindow) {
          callOnVueApp(focusedWindow, 'changeFontSize(-1)')
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
            p5serial.start()
            nodeGlobal.serialRunning = true

            // update the serial menu item label
            serialMenu.submenu[0].label = getSerialMenuItemLabel()
            resetMenu()
          } else {
            p5serial.stop()
            nodeGlobal.serialRunning = false

            // update the serial menu item label
            serialMenu.submenu[0].label = getSerialMenuItemLabel()
            resetMenu()
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
          callOnVueApp(focusedWindow, 'showHelp()')
        }
      }
    ]
  }

  module.exports.updateRecentFiles(null, null, () => {
    // Make the menu from the template objects
    makeMenu()

    // Set the application's menu (every window's) default menu to be this menu
    Menu.setApplicationMenu(menu)

    cb()
  })
}

function resetMenu () {
  // Remake the menu again from the template objects.
  // Side note: As far as I can see, Electron does not allow dynamic updating
  // of an already created menu object so have to re-create
  makeMenu()

  // Set all editor windows' menus to the menu object
  Object.keys(window.windows).forEach(function (key) {
    const win = window.windows[key]
    if (win._isEditorWindow) win.setMenu(menu)
  })
}

module.exports.updateRecentFiles = (isVueAppTemp, path, cb = resetMenu) => {
  storage.get('recentFiles', (error, data) => {
    if (error) throw error
    let recentFiles = _.isEmpty(data) ? [] : data.paths

    if (path !== undefined && path !== null && !isVueAppTemp) {
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
          click (item, focusedWindow) {
            focusedWindow.webContents.send('openProject', p)
          }
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
                // Update the menu with the cleared submenu
                module.exports.updateRecentFiles()
              })
            }
          }
        )
      }

      openRecent.submenu = openRecentSubMenu
      openRecent.enabled = (openRecentSubMenu.length !== 0)

      // Set the javascript object to our modified openRecent template item
      fileMenu.submenu[3] = openRecent

      // Yay we're finished so call the callback the user gave us or defaults to resetMenu
      cb()
    })
  })
}

function makeMenu () {
  const template = []
  if (nodeGlobal.isMac) {
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

function makeExampleCategorySubMenu () {
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
              focusedWindow.webContents.send('launchExample', exampleDir.concat('/').concat(category).concat('/').concat(fileName))
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

function makeImportLibsSubMenu () {
  let importLibsSubMenu = []
  let libFiles = fs.readdirSync(Path.join('static', 'mode_assets', 'p5', 'libraries'))
  libFiles.forEach(function (lib) {
    importLibsSubMenu.push({
      label: Path.basename(lib),
      click: (item, focusedWindow) => {
        focusedWindow.webContents.send('addLibrary', lib)
      }
    })
  })
  return importLibsSubMenu
}
