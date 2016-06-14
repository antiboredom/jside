// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, ipcMain } from 'electron'
import Path from 'path'
const window = require('electron-window')
// import fs from 'fs'

var defaultWinSettings = {
  x: 50,
  y: 50,
  width: 1024,
  height: 768
}

console.log(`platform is ${process.platform}`)

// platform
let isWin = process.platform === 'win32'
let isMac = process.platform === 'darwin'
let isLinux = process.platform === 'linux'

let vueApp = null
global.sharedObj = {isWin: isWin, isMac: isMac, isLinux: isLinux, vueApp: vueApp}

// Load the HTML file directly from the webpack dev server if
// hot reload is enabled, otherwise load the local file.
const mainURL = process.env.HOT
  ? `http://localhost:${process.env.PORT}/main.html`
  : 'file://' + Path.join(__dirname, 'main.html')

const debugInjectJSURL = Path.join(__dirname, 'static', 'debug-console.js')

function createWindow (url = mainURL, winSettings = defaultWinSettings, preloadArgs) {
  const win = window.createWindow(winSettings)

  win.on('close', (event) => {
    const eWin = event.sender
    if (eWin.outputWinId) {
      window.windows[eWin.outputWinId].close()
    }
  })

  win.on('focus', (event) => {
    event.sender.send('winFocused')
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
  window.windows[parentWinId].outputWinId = win.id
  console.log(`window.windows[parentWinId].outputWinId = ${window.windows[parentWinId].outputWinId}`)
  win.parentWinId = parentWinId
  console.log(`new output window id = ${win.id}`)

  win.on('close', (event) => {
    // console.log(event.sender.id)
    const outputWindow = event.sender
    const parentWinId = outputWindow.parentWinId
    // console.log('Output window\'s bounds:')
    // console.log(outputWindow.getBounds())
    const outWinBounds = outputWindow.getBounds()
    window.windows[parentWinId].webContents.send('outputWinClose', outWinBounds)

    console.log(`Closed output window's parent win id=${parentWinId}`)
  })

  win.on('focus', (event) => {
    const outputWindow = event.sender
    const parentWinId = outputWindow.parentWinId
    const parentWindow = window.windows[parentWinId]
    parentWindow.webContents.send('outputWinFocused')
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

  console.log(`Length of windows array after creating window ${Object.keys(window.windows).length}`)
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

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
