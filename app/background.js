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

  if (preloadArgs) {
    win.showURL(url, preloadArgs)
  } else {
    win.showURL(url)
  }

  if (process.env.NODE_ENV !== 'production') {
    win.openDevTools()
  }
}

ipcMain.on('createWindow', (event, url, settings, preloadArgs) => {
  console.log(settings)
  if (settings.injectDebug === true) {
    delete settings.injectDebug
    if (!settings.webPreferences) {
      settings.webPreferences = {}
    }
    settings.webPreferences.preload = debugInjectJSURL
  }
  createWindow(url, settings, preloadArgs)
})

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
