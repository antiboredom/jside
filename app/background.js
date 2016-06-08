// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, BrowserWindow } from 'electron'
import Path from 'path'
import fs from 'fs'

var winSettings = {
  x: 50,
  y: 50,
  width: 1024,
  height: 768,
  show: false
}

/* localStorage.openWindows = 0

var windows = localStorage.windows ? JSON.parse(localStorage.windows) : []
localStorage.windows = JSON.stringify([])

var windowsToOpen = windows.filter(function(w){
  return w.path && fs.existsSync(w.path)
}) */

let mainWindow

function openProject (path) {
  if (typeof path === 'string' && fs.lstatSync(path).isDirectory()) {
    var sketchPath = Path.join(path, 'sketch.js')
    if (fs.existsSync(sketchPath)) path = sketchPath
  }

  mainWindow = new BrowserWindow(winSettings)

  // Load the HTML file directly from the webpack dev server if
  // hot reload is enabled, otherwise load the local file.
  const mainURL = process.env.HOT
    ? `http://localhost:${process.env.PORT}/main.html`
    : 'file://' + Path.join(__dirname, 'main.html')

  mainWindow.loadURL(mainURL)

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  openProject()
})

app.on('window-all-closed', () => {
  app.quit()
})
