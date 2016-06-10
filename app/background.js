// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, BrowserWindow } from 'electron'
import Path from 'path'
// import fs from 'fs'

var winSettings = {
  x: 50,
  y: 50,
  width: 1024,
  height: 768,
  show: false
}

console.log(`platform is ${process.platform}`)

// platform
let isWin = process.platform === 'win32'
let isMac = process.platform === 'darwin'
let isLinux = process.platform === 'linux'

let vueApp = null
global.sharedObj = {windows: [], isWin, isMac, isLinux, vueApp}

// Load the HTML file directly from the webpack dev server if
// hot reload is enabled, otherwise load the local file.
const mainURL = process.env.HOT
  ? `http://localhost:${process.env.PORT}/main.html`
  : 'file://' + Path.join(__dirname, 'main.html')

function createWindow () {
  console.log('called create window')
  let win = new BrowserWindow(winSettings)

  win.loadURL(mainURL)

  if (process.env.NODE_ENV !== 'production') {
    win.openDevTools()
  }

  win.on('closed', () => {
    global.sharedObj.windows.pop(global.sharedObj.windows.indexOf(this))
  })

  global.sharedObj.windows.push(win)

  win.show()
}

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
