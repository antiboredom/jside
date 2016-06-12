const Path = require('path')
const $ = require('jquery')
const _ = require('underscore')
const Files = require('./files')

const {remote} = require('electron')
const shell = require('electron').shell
const {Menu} = remote

let isWin = remote.getGlobal('sharedObj').isWin
let isLinux = remote.getGlobal('sharedObj').isLinux
let isMac = remote.getGlobal('sharedObj').isMac

let menu

const fs = require('fs')

module.exports.setup = function (app) {
  const appName = remote.app.getName()

  // Template for 'app' menu found on OSX
  let appMenu = {
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
  let windowMenu = {
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

  let fileMenu = {
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
          $('#openFile').trigger('click')
        }
      }
    ]
  }

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
        $('#saveProject').trigger('click')
      }
    }
  ])

  // add menu option for loading example sketches
  let examplesMenu = {label: 'Examples'}

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

  examplesMenu.submenu = exampleCategorySubMenu
  fileMenu.submenu.push(examplesMenu)

  fileMenu.submenu.push({type: 'separator'})

  fileMenu.submenu.push({
    label: 'Run',
    accelerator: 'CmdOrCtrl+R',
    click (item, focusedWindow) {
      app.run()
    }
  })

  let editMenu = {
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

  let viewMenu = {
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
          app.$els.editor.reformat()
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

  let helpMenu = {
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
    helpMenu
  ])

  template.splice(1, 0, editMenu)

  menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports.resetMenu = () => {
  Menu.setApplicationMenu(menu)
}
