<template>
  <head>
    <meta charset="utf-8">
    <title>p5 - {{$root.title}} {{$root.currentFile.contents !== $root.currentFile.lastSavedContents ? '*' : ''}}</title>

    <script src="static/electron_boilerplate/context_menu.js"></script>
    <script src="static/electron_boilerplate/external_links.js"></script>
  </head>
  <body :class="[$root.orientation]">
    <div id="header-container">
      <img id="logo" src="./assets/images/p5-logo.png">
      <button class="button" id="play" :class="{'running': $root.running}" @click="$root.toggleRun()"></button>
      <h1 id="project-name" v-text="$root.projectName"></h1>
      <div id="toolbar">
        <div id="actions">
          <img id="settings" class="button" title="Preferences" src="./assets/images/settings-button.svg" @click="$root.toggleSettingsPane()">
        </div>
      </div>
    </div>
    <div id="flex-container">
      <div id="side-container">
        <sidebar v-ref:sidebar :files="$root.files"></sidebar>
      </div>
      <div id="main-container">
        <tabs v-ref:tabs :tabs="$root.tabs" id="tab-container"></tabs>
        <div id = "editor-container">
          <editor v-ref:editor id="main"></editor>
          <debug v-ref:debug id="debug-container"></debug>
        </div>
      </div>
    </div>

    <div id="settingsContainer" v-show="$root.showSettings">
      <settings
      :font-size.sync="$root.settings.fontSize"
      :tab-size.sync="$root.settings.tabSize"
      :tab-type.sync="$root.settings.tabType"
      :word-wrap.sync="$root.settings.wordWrap"
      :run-in-browser.sync="$root.settings.runInBrowser"
      :console-orientation.sync="$root.settings.consoleOrientation"
      :show-sidebar.sync="$root.settings.showSidebar"></settings>
    </div>
  </body>
</template>

<script>
  import editor from './components/Editor'
  import sidebar from './components/Sidebar'
  import settings from './components/Settings'
  import debug from './components/Debug'
  import tabs from './components/Tabs'
  export default {
    components: {
      editor,
      sidebar,
      settings,
      debug,
      tabs
    }
  }
</script>

<style lang="scss">
  @font-face {
    font-family: inconsolata;
    src: url('assets/fonts/Inconsolata.otf');
  }

  @font-face {
    font-family: montserrat-bold;
    src: url('assets/fonts/Montserrat-Bold.ttf');
  }

  @font-face {
    font-family: montserrat;
    src: url('assets/fonts/Montserrat-Regular.ttf');
  }

  body, html {
    background: #fbfbfb;
    color: #231f20;
    height: 100%;
    margin: 0;
    padding: 0;
    font: 14px montserrat, sans-serif;
  }

  body {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow: hidden;
    height: 100%;
  }

  #flex-container {
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  .file-handler {
    display: none;
  }

  ::-webkit-scrollbar-track {
    background: rgba(153, 153, 153, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background-color: #d8d8d8;
    border: 4px solid transparent;
    border-radius: 8px;
    background-clip: content-box;
  }
  ::-webkit-scrollbar {
      width: 16px;
  }


  .button {
    cursor: pointer;
  }

  .button:hover {
    opacity: 0.6;
  }

  #header-container {
    height: 44px;
    margin-top: 30px;
    margin-left: 102px;
  }

  #logo {
    height: 43px;
    float: left;
    margin-right: 25px;
  }

  #play {
    background: none;
    background-image: url('assets/images/play-button.svg');
    border: 0;
    width: 44px;
    height: 44px;
    font-size: 25px;
    display: inline;
    outline: 0;
    float: left;

    &.running {
      background-image: url('assets/images/stop-button.svg');
    }
  }

  #settings {
    width: 44px;
    height: 44px;
  }

  #project-name {
    font-size: 12px;
    padding-left: 20px;
    color: #b5b5b5;
    margin-top: 14px;
    margin-bottom: 10px;
    cursor: default;
    float:left;
  }


  #toolbar {
    height: 60px;
    width: 100%;
  }

  #actions {
    #add, #export {
      float: left;
    }

    #settings {
      float: right;
      margin-right: 15px;
    }
  }
</style>
