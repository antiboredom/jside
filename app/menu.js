var Path = nodeRequire('path');
var $ = require('jquery');
var _ = require('underscore');
var menubar = new gui.Menu({ type: 'menubar' });
menubar.createMacBuiltin("p5");
var fileMenu = new gui.Menu();
var help = new gui.Menu();
var win = gui.Window.get();
var recentFilesMenu = new gui.Menu();
var openRecent;


module.exports.setup = function(app) {
  fileMenu.append(new gui.MenuItem({ label: 'New Project', modifiers: 'shift-cmd', key: 'n', click: function(){
    app.newWindow(app.windowURL);
  }}));
  
  fileMenu.append(new gui.MenuItem({ label: 'New File', modifiers: 'cmd', key: 'n', click: function(){
    app.newFile();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'New Folder', click: function(){
    app.newFolder();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Open', modifiers: 'cmd', key: 'o', click: function(){
    $('#openFile').trigger('click');
  }}));

  openRecent = new gui.MenuItem({label: 'Open Recent'});
  openRecent.submenu = recentFilesMenu;
  fileMenu.append(openRecent);

  fileMenu.append(new gui.MenuItem({ label: 'Close', modifiers: 'cmd', key: 'w', click: function(){
    app.closeProject();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save', modifiers: 'cmd', key: 's', click: function(){
    app.saveFile();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save File As...', modifiers: 'shift-cmd', key: 's', click: function(){
    app.saveFileAs(app.currentFile.path);
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save Project As...', modifiers: 'alt-shift-cmd', key: 's', click: function(){
    $('#saveProject').trigger('click');
    
  }}));

  fileMenu.append(new gui.MenuItem({ type: 'separator' }));

  //fileMenu.append(new gui.MenuItem({ label: 'Export \t\t\t\u2318E', click: function(){
    //app.export();
  //}}));

  fileMenu.append(new gui.MenuItem({ label: 'Run', modifiers: 'cmd', key: 'r', click: function(){
    app.run();
  }}));

  help.append(new gui.MenuItem({ label: 'Reference', click: function(){
    app.showHelp();
  }}));

  menubar.insert(new gui.MenuItem({ label: 'File', submenu: fileMenu}),1);
  menubar.append(new gui.MenuItem({ label: 'Help', submenu: help}));
  win.menu = menubar;

};

module.exports.resetMenu = function() {
  win.menu = menubar;
};

module.exports.updateRecentFiles = function(app, path) {
  var recentFiles = JSON.parse(localStorage.recentFiles || '[]');

  if (typeof path !== 'undefined' && !app.temp) {
    recentFiles.unshift(path);
  }

  recentFiles = _.unique(recentFiles);

  if (recentFiles.length > 10) recentFiles.pop();

  localStorage.recentFiles = JSON.stringify(recentFiles);

  // clear the recentFilesMenu because we're going to repopulate it
  recentFilesMenu = new gui.Menu();
  openRecent.submenu = recentFilesMenu;

  // iterate through the recentFiles and append to the openRecent submenu
  recentFiles.forEach(function(p) {
    var m = new gui.MenuItem({ label: Path.basename(p), click: function() {
      app.openProject(p);
    }});
    recentFilesMenu.append(m);
  });
  if (recentFiles.length > 0) {
    recentFilesMenu.append(new gui.MenuItem({type: 'separator'}));
    recentFilesMenu.append(new gui.MenuItem({label: 'Clear Recent Projects', click: function(){
      localStorage.recentFiles = [];
      module.exports.updateRecentFiles(app);
    }}));
  }

  openRecent.enabled = (recentFiles.length !== 0);
};
