var Path = require('path')
var fs = require('fs')

var _ = require('underscore')

var Files = {
  setup: function(path, options) {
    var name = Path.basename(path)
    var ext = Path.extname(path)
    var fileObject = {
      name: name,
      path: path,
      id: path,
      ext: ext,
      type: 'file',
      open: false,
      contents: undefined,
      lastSavedContents: undefined,
      originalContents: undefined
    }
    return _.extend(fileObject, options)
  },

  addToTree: function(fileObject, fileArray, projectRoot) {
    if (Path.dirname(fileObject.path) === projectRoot && !Files.contains(fileArray, fileObject)) {
      fileArray.push(fileObject)
      return true
    }
    fileArray.forEach(function(f) {
      if (f.type === 'folder') {
        if (f.path === Path.dirname(fileObject.path) && !Files.contains(f.children, fileObject)) {
          f.children.push(fileObject)
          return true
        }
        Files.addToTree(fileObject, f.children)
      }
    })
  },

  removeFromTree: function(path, fileArray) {
    var f = _.findWhere(fileArray, {
      path: path
    })
    if (f) {
      fileArray.splice(_.indexOf(fileArray, f), 1)
      return true
    }
    fileArray.forEach(function(fileObject) {
      if (fileObject.type === 'folder' && fileObject.children.length > 0) {
        Files.removeFromTree(path, fileObject.children)
      }
    })
  },

  contains: function(files, fileObject) {
    if (_.findWhere(files, {
        path: fileObject.path
      })) {
      return true
    } else {
      return false
    }
  },

  find: function(files, path) {
    var result = null
    _find(files, path)
    return result

    function _find(files, path) {
      if (result) return false
      var f = _.findWhere(files, {
        path: path
      })
      if (f) {
        result = f
        return true
      }
      files.forEach(function(f) {
        if (f.type === 'folder') {
          _find(f.children, path)
        }
      })
    }
  },

  list: function(dir, callback) {
    var results = []
    fs.readdir(dir, function(err, files) {
      var pending = files.length
      files.forEach(function(filepath) {
        var path = Path.join(dir, filepath)
        var fileObject = Files.setup(path)

        fs.lstat(path, function(err, stats) {
          if (stats.isDirectory()) {
            fileObject.type = 'folder'
            fileObject.children = []
          }
          results.push(fileObject)
          pending--
          if (pending === 0) {
            callback(results)
          }
        })
      })
    })
  },

  cleanExampleName: function(examplePath) {
    examplePath = Path.basename(examplePath)
    examplePath = examplePath.replace(/([0-9]+_)|(\.js)/g,'')
    examplePath = examplePath.replace(/_/g,' ')
    return examplePath
  },
}

module.exports = Files
