import $ from 'jquery'
// import semver from 'semver'
import semver from 'semver'
import manifest from './package.json'

import {remote, shell} from 'electron'
const nodeGlobal = remote.getGlobal('sharedObj')
const isWin = nodeGlobal.isWin
const isMac = nodeGlobal.isMac
const isLinux = nodeGlobal.isLinux

let osType
if (isWin) {
  osType = 'win'
} else if (isMac) {
  osType = 'mac'
} else if (isLinux) {
  osType = 'linux'
} else {
  osType = 'unknown'
}

const packageURL = 'https://raw.githubusercontent.com/processing/p5.js-editor/master/package.json?v=' + new Date().getTime()
const downloadURL = 'https://github.com/processing/p5.js-editor/releases/download/'

module.exports.check = function () {
  // console.log('Manifest:')
  // console.log(manifest)
  if (nodeGlobal.checkedUpdate === true) return false
  nodeGlobal.checkedUpdate = true
  $.ajax({url: packageURL, success: update, cache: false, dataType: 'json'})
  function update (data) {
    // console.log(data)
    if (semver.gt(data.version, manifest.version)) {
      const choice = remote.dialog.showMessageBox({
        type: 'question',
        title: 'Update to newer version of editor?',
        message: 'A newer version of the P5.js Editor is available. Do you want to download it?',
        buttons: ['Yes', 'No'],
        cancelId: -1
      })
      const shouldDownload = choice === 0
      if (shouldDownload) {
        shell.openExternal(downloadURL + 'v' + data.version + '/p5-' + osType + '.zip')
      }
    }
  }
}
