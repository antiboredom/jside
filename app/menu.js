var Path = nodeRequire('path');
var $ = require('jquery');
var _ = require('underscore');
var Files = require('./files');

var menubar = new gui.Menu({ type: 'menubar' });
menubar.createMacBuiltin("p5");
var fileMenu = new gui.Menu();
var help = new gui.Menu();
//var edit = new gui.Menu();
var view = new gui.Menu();
var win = gui.Window.get();
var recentFilesMenu = new gui.Menu();
var exampleCategoryMenu = new gui.Menu();
var openRecent, examples;
var fs = nodeRequire('fs');


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

  // add menu option for loading example sketches
  examples = new gui.MenuItem({label: 'Examples'});
  // create submenu
  var exampleDir = 'mode_assets/p5/examples';
  // get latest example categories
  var files = fs.readdirSync(exampleDir);
  files.forEach(function(category) {
    var sketchMenu = new gui.Menu();
    var categoryLabel = new gui.MenuItem({label: category});
    // populate submenu with sketches for that category
    var categoryDir = Path.join(exampleDir, category);
    if (fs.lstatSync(categoryDir).isDirectory()) {
      var sketches = fs.readdirSync(categoryDir);
      sketches.forEach(function(fileName) {
        sketchMenu.append(new gui.MenuItem({label: Files.cleanExampleName(fileName), click: function(){
          app.modeFunction('launchExample', exampleDir.concat('/').concat(category).concat('/').concat(fileName));
        }}));
      });
      categoryLabel.submenu = sketchMenu;
      exampleCategoryMenu.append(categoryLabel);
    }
  });

  examples.submenu = exampleCategoryMenu;
  fileMenu.append(examples);

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

  view.append(new gui.MenuItem({ label: 'Reformat', modifiers: 'cmd', key: 't', click: function(){
    app.$.editor.reformat();
  }}));

  view.append(new gui.MenuItem({ type: 'separator' }));

  view.append(new gui.MenuItem({ label: 'Toggle Settings Panel', modifiers: 'cmd', key: ',', click: function(){
    app.toggleSettingsPane();
  }}))

  view.append(new gui.MenuItem({ label: 'Toggle Sidebar', modifiers: 'cmd', key: '.', click: function(){
    app.toggleSidebar();
  }}))

  view.append(new gui.MenuItem({ type: 'separator' }));

  view.append(new gui.MenuItem({ label: 'Increase Font Size', modifiers: 'cmd', key: '=', click: function(){
    app.changeFontSize(1);
  }}))

  view.append(new gui.MenuItem({ label: 'Decrease Font Size', modifiers: 'cmd', key: '-', click: function(){
    app.changeFontSize(-1);
  }}))

  menubar.insert(new gui.MenuItem({ label: 'File', submenu: fileMenu}),1);
  //menubar.insert(new gui.MenuItem({ label: 'Edit', submenu: edit}), 2);
  menubar.insert(new gui.MenuItem({ label: 'View', submenu: view}), 3);
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
