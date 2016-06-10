<template>
  <div id="settingsPane">
    <div id="titleBar">
      <p>Preferences</p>
      <img id="close" class="button" src="../assets/images/close-button.svg" @click="$root.toggleSettingsPane()">
    </div>
    <div id="optionsZone">
      <!-- Text size -->
      <div class="section">
        <p class="label">Text size</p>
        <span class="adjustButtonContainer">
          <img class="adjustButton button" src="../assets/images/minus-button.svg" @click="decreaseFontSize">
          <label>Decrease</label>
        </span>
        <input id="textAdjustInput" type="text" v-model="fontSize" number size=3>
        <span class="adjustButtonContainer">
          <img class="adjustButton button" src="../assets/images/plus-button.svg" @click="increaseFontSize">
          <label>Increase</label>
        </span>
      </div>

      <!-- Indentation amount -->
      <div id="indentation" class="section">
        <p class="label">Indentation amount</p>
        <span class="adjustButtonContainer">
          <img class="adjustButton button" src="../assets/images/minus-button.svg" @click="decreaseTabSize">
          <label>Decrease</label>
        </span>
        <input id="tabSize" type="text"  v-model="tabSize" number size=3 @change="updateTabSize">
        <span class="adjustButtonContainer">
          <img class="adjustButton button" src="../assets/images/plus-button.svg" @click="increaseTabSize">
          <label>Increase</label>
        </span>

        <div id="indentOptions" class="hiddenRadio radioOptions">
          <input type="radio" value="spaces" id="tabTypeS" v-model="tabType">
          <label class="radioSelection" for="tabTypeS">Spaces</label>
          <input type="radio" value="tabs" id="tabTypeT" v-model="tabType">
          <label class="radioSelection" for="tabTypeT">Tabs</label>
        </div>
      </div>

      <!-- Word wrap -->
      <div id="ww" class="section">
        <p class="label">Word wrap</p>
        <div id="wwOptions" class="hiddenRadio radioOptions">
          <input type="radio" value="true" id="wordWrapOn" v-model="wordWrap">
          <label class="radioSelection" for="wordWrapOn">On</label>
          <input type="radio" value="false" id="wordWrapOff" v-model="wordWrap">
          <label class="radioSelection" for="wordWrapOff">Off</label>
        </div>
      </div>

      <!-- Run in browser -->
      <div id="rib" class="section">
        <p class="label">Run in browser</p>
        <div id="ribOptions" class="hiddenRadio radioOptions">
          <input type="radio" value="true" id="runInBrowserOn" v-model="runInBrowser">
          <label class="radioSelection" for="runInBrowserOn">On</label>
          <input type="radio" value="false" id="runInBrowserOff" v-model="runInBrowser">
          <label class="radioSelection" for="runInBrowserOff">Off</label>
        </div>
      </div>

      <!-- Console orientation -->
      <div class="section hiddenRadio">
        <p id="consoleText" class="label">Console orientation</p>

        <input type="radio" name="consoleOrientation" id="consoleH" v-model="consoleOrientation" value="horizontal" >
        <label for="consoleH" class="left">
          <img id="browserIcon" src="../assets/images/consoleH.svg">
        </label>

        <input type="radio" name="consoleOrientation" id="consoleV" v-model="consoleOrientation" value="vertical" >
        <label for="consoleV" class="right">
          <img id="browserIcon" src="../assets/images/consoleV.svg">
        </label>
      </div>

      <!-- Show sidebar -->
      <div id="ss" class="section">
        <p class="label">Show sidebar</p>
        <div id="ssOptions" class="hiddenRadio radioOptions">
          <input type="radio" value="true" id="showSidebarOn" v-model="showSidebar">
          <label class="radioSelection" for="showSidebarOn">On</label>
          <input type="radio" value="false" id="showSidebarOff" v-model="showSidebar">
          <label class="radioSelection" for="showSidebarOff">Off</label>
        </div>
      </div>



    </div>
  </div>

</template>

<script>
  export default {
    name: 'Settings',
    props: [
      'fontSize',
      'tabSize',
      'tabType',
      'wordWrap',
      'runInBrowser',
      'consoleOrientation',
      'showSidebar'
    ],

    methods: {
      updateTabSize: function(e) {
        var parsed = typeof e === 'number' ? e : parseInt(e.target.value)
        this.tabSize = parsed >= 1 ? parsed : 1
        // ace.getSession().setTabSize(this.tabSize) // TODO get ace ref
      },
      decreaseTabSize: function(e) {
        this.updateTabSize(this.tabSize-1)
      },
      increaseTabSize: function(e) {
        this.updateTabSize(this.tabSize+1)
      },
      decreaseFontSize: function(e) {
        this.fontSize--
      },
      increaseFontSize: function(e) {
        this.fontSize++
      }
    }
  }
</script>

<style lang="scss">
  #settingsContainer {
    position: absolute;
    background-color: #f4f4f4;
    top: 20px;
    right: 30px;
    z-index: 999;
    box-shadow: 0px 12px 12px rgba(0, 0, 0, 0.16);
    color: #fff;
    width: 276px;
    padding: 14px 14px 8px 19px;
  }

  #settingsPane p {
    padding: 0;
    margin: 0;
  }

  #settingsPane {
    width: 100%;
    font-family: montserrat;
    font-size: 16px;
    margin: 0;
    padding: 0;

    #titleBar {
      font-family: montserrat-bold;
      font-size: 21px;
      color: rgba(51, 51, 51, 0.87);
      margin-bottom: 19px;
    }

    #optionsZone {

      div {
        clear: both;
      }
    }

    .label {
      color: #333333;
      font-size: 16px;
      margin-bottom: 7px;
    }

    .section {
      border-bottom: dashed 1px #b5b5b5;
      margin-bottom: 13.5px;
      padding-bottom: 13.5px;
    }

    .section:last-child {
      border: none;
      padding-bottom: 0;
      margin-bottom: 0;
    }

    input[type="text"] {
      width: 44px;
      height: 40px;
      border: 1px solid rgba(153, 153, 153, 0.4);
      color: #333333;
      background-color: #f4f4f4;
      font-size: 16px;
      font-family: inconsolata;
      text-align: center;
      margin: 0 22px;
      display: inline-block;
      vertical-align: top;
    }

    .adjustButtonContainer {
      width: 43px;
      text-align: center;
      display: inline-block;
      vertical-align: top;
    }

    .adjustButton {
      width: 32px;
      height: 32px;
      cursor: pointer;
    }

    .adjustButtonContainer label {
      font-size: 9px;
      color: #b5b5b5;
      margin-top: 8px;
    }

    input:focus {
      outline: 0;
    }

    .hiddenRadio {
      overflow: auto;

      input[type="radio"] {
        display:none;
      }
    }

    #selectable {
      &:hover {
        fill: #fff;
      }
    }

    .console {
      height: 40px;
      width: 70px;
      fill: #828384;
      transition: all 0.3s ease;


      &:hover {
        fill: #fff;
      }
    }

    #close {
      width: 24px;
      height: 24px;
      position: absolute;
      top: 15px;
      right: 14px;
    }

    #x {
      fill: #2F2F30;
      transition: all 0.1s ease;

      &:hover {
        fill: #fff;
        fill-opacity: 1;
      }
    }

    #consoleHorizontal {
      float: right;
    }

    #libraryIcon {
      width: 30px;
      float: left;
      position: relative;
    }


    #wordWrapIcon {
      width: 23px;
      float: left;
      position: relative;
      top: 10px;
      left: 5px;
    }

    #browserIcon {
      width: 44px;
      height: 44px;
      margin-right: 20px;
      cursor: pointer;
    }

    .fade {
      transition: all 0.3s ease;
    }

    .hiddenCheckbox {
      input[type="checkbox"] {
        display: none;
      }

      input[type="checkbox"] + label {
        background-color: #adacac;
        color: #828384;

          &:hover {
          background-color: #cdcccc;
        }
      }

      input[type="checkbox"]:checked + label {
        background-color: #e1dedc;
        color: #58585b;

          &:hover {
          background-color: #fefefc;
        }
      }
    }

    #tab {
      height: 10px;
      width: 15px;
      position: relative;
      top: 1px;
      left: -4px;
      fill: #828384;
      transition: all 0.3s ease;
    }

    #space {
      height: 10px;
      width: 15px;
      float: left;
      position: relative;
      top: 5px;
      left: 3px;
      fill: #828384;
      transition: all 0.3s ease;
    }


    #indentationAmount {
      width: 200px;
      display: inline;
    }

    #indentOptions {
      margin-left: 22px;
    }

    #indentOptions .radioSelection {
      margin-bottom: 10px;
      margin-right: 0px;
      display: block;
    }

    .radioOptions {

      display: inline-block;
      color: #b5b5b5;
      font-size: 12px;
      input[type="radio"]:checked + label {
        color: #333333;
      }

      input[type="radio"] + label:hover {
        color: #333333;
      }

      label {
        cursor: pointer !important;
      }

    }

    .radioSelection {
      color: #828384;
      border-radius: 4px;
      text-align: left;
      margin-right: 44px;
      transition: all 0.15s ease;
    }

  }

</style>