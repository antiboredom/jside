// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, ipcMain } from 'electron'
import Path from 'path'
import window from 'electron-window'
import menu from './menu'
// import fs from 'fs'

var defaultWinSettings = {
  x: 50,
  y: 50,
  width: 1024,
  height: 768,
  show: true
}

// console.log(`platform is ${process.platform}`)

// platform
let isWin = process.platform === 'win32'
let isMac = process.platform === 'darwin'
let isLinux = process.platform === 'linux'

global.sharedObj = {
  isWin: isWin,
  isMac: isMac,
  isLinux: isLinux,
  serialRunning: false,
  checkedUpdate: false
}

// Load the HTML file directly from the webpack dev server if
// hot reload is enabled, otherwise load the local file.
const mainURL = process.env.HOT
  ? `http://localhost:${process.env.PORT}/main.html`
  : 'file://' + Path.join(__dirname, 'main.html')

const debugInjectJSURL = Path.join(__dirname, 'static', 'debug-console.js')

function createWindow (url = mainURL, winSettings = defaultWinSettings, preloadArgs) {
  const win = window.createWindow(winSettings)
  win._isEditorWindow = true

  win.outputWinId = null

  win.on('close', (event) => {
    const eWin = event.sender
    if (eWin.outputWinId) {
      window.windows[eWin.outputWinId].close()
    }
  })

  if (preloadArgs) {
    win.showURL(url, preloadArgs)
  } else {
    win.showURL(url)
  }

  if (process.env.NODE_ENV !== 'production') {
    win.openDevTools()
  }
}

function createOutputWindow (url, parentWinId, winSettings, preloadArgs) {
  const win = window.createWindow(winSettings)
  win.setMenu(null)
  window.windows[parentWinId].outputWinId = win.id
  // console.log(`window.windows[parentWinId].outputWinId = ${window.windows[parentWinId].outputWinId}`)
  win.parentWinId = parentWinId
  // console.log(`new output window id = ${win.id}`)

  win.on('close', (event) => {
    const outputWindow = event.sender
    const parentWinId = outputWindow.parentWinId
    const outWinBounds = outputWindow.getBounds()
    window.windows[parentWinId].outputWinId = null
    window.windows[parentWinId].webContents.send('outputWinClose', outWinBounds)
  })

  win.on('resize', (event) => {
    const outputWindow = event.sender
    const parentWinId = outputWindow.parentWinId
    const parentWindow = window.windows[parentWinId]
    parentWindow.webContents.send('outputWinResized')
  })

  if (preloadArgs) {
    win.showURL(url, preloadArgs)
  } else {
    win.showURL(url)
  }
  // console.log(`Length of windows array after creating window ${Object.keys(window.windows).length}`)
}

ipcMain.on('createWindow', (event, url, settings, preloadArgs) => {
  createWindow(url, settings, preloadArgs)
})

ipcMain.on('createOutputWindow', (event, url, settings, preloadArgs) => {
  let parentWinId = event.sender.getOwnerBrowserWindow().id
  if (!settings.webPreferences) {
    settings.webPreferences = {}
  }
  settings.webPreferences.preload = debugInjectJSURL
  createOutputWindow(url, parentWinId, settings, preloadArgs)
})

ipcMain.on('updateRecentFiles', (event, isVueAppTemp, path) => {
  menu.updateRecentFiles(isVueAppTemp, path)
})

app.on('ready', () => {
  menu.setup(global.sharedObj, () => {
    createWindow()
  })
})

app.on('window-all-closed', () => {
  // OSX typical behaviour is to simply close a window and not actually quit until explicitly told to
  if (!isMac) {
    console.log('Calling app quit')
    app.quit()
  }
})
