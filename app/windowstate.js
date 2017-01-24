var fs = nodeRequire('fs');

module.exports.load = function(callback) {
  var windows = localStorage.windows ? JSON.parse(localStorage.windows) : [];
  localStorage.windows = JSON.stringify([]);

  var windowsToOpen = windows.filter(function(w){
    return w.path && fs.existsSync(w.path);
  });

  if (windowsToOpen.length > 0) {
    var openedWindows = 0;
    windowsToOpen.forEach(function(w){
      var win = gui.Window.open('index.html',{
        x: w.x,
        y: w.y,
        width: w.width,
        height: w.height-55,
        toolbar: false,
        focus: true,
        show: false
      });
      win.on('document-start', function(){
        win.window.PATH = w.path;
        win.window.FILEPATH = w.filePath;
        win.window.UNSAVED = w.temp;
        openedWindows ++;
        if (openedWindows === windows.length) {
          callback(false);
        }
      });
    });

  } else {
    callback(true);
  }
};

module.exports.save = function(app, win) {
  var state = {
    x: win.x,
    y: win.y,
    width: win.width,
    height: win.height,
    temp: app.temp,
    path: app.projectPath,
    filePath: app.currentFile && app.currentFile.path ? app.currentFile.path : null
  };
  var windows = JSON.parse(localStorage.windows);
  windows.push(state);
  localStorage.windows = JSON.stringify(windows);
};



module.exports.totalWindows = function() {
  if (!localStorage.openWindows) localStorage.openWindows = 0;
  return +localStorage.openWindows;
};


module.exports.incrementWindows = function() {
  if (!localStorage.openWindows || +localStorage.openWindows < 0) localStorage.openWindows = 0;
  localStorage.openWindows ++;
};

module.exports.decrementWindows = function() {
  if (!localStorage.openWindows || +localStorage.openWindows < 1) localStorage.openWindows = 1;
  localStorage.openWindows --;
};
