<template>
  <div id="tabs">
    <ul id="tab-list">
      <li v-for="tab in tabs | orderBy 'name'">
        <tab :path="tab.path" :name="tab.name" :file="tab.file"></tab>
      </li>
      <li id="add">
        <div>
          <a href="#" @click="$root.newFile()">+</a>
        </div>
      </li>
    </ul>

  </div>
</template>

<script>
  var Path = require('path')
  var fs = require('fs')
  var trash = require('trash')

  var File = require('../files')
  var _ = require('underscore')
  var $ = require('jquery')

  export default {
    name: 'Tabs',
    props: ['tabs'],

    components: {
      tab: {
        name: 'Tab',
        template: require('./tab.html'),
        props: ['path', 'name', 'file'],
        computed: {
          hidden: function() {
            return this.name[0] === '.'
          },
          editing: function() {
            return this.file.contents !== this.file.lastSavedContents ? '*' : ''
          },
          selected: function() {
            return this.$root.currentFile === this.file
          }
        }
      }
    },

    methods: {
      closeFile: function(fileObject) {
        var tabs = this.$root.tabs
        var target_tabs = tabs.filter(function(tab) {
          return tab.name === fileObject.name
        })
        if (target_tabs[0]) {
          var newTarget
          var index = _.indexOf(tabs, target_tabs[0])

          switch (index) {
            case 0:
              newTarget = 0
              break
            case tabs.length - 1:
              newTarget = tabs.length - 2
              break
            default:
              newTarget = index - 1
              break
          }
            tabs.splice(index, 1)
            this.$root.openFile(tabs[newTarget].path)
        }
      },

      addTab: function(fileObject, tabs) {
        if (fileObject.open) {
          var tabObject = {
            name: fileObject.name,
            path: fileObject.path,
            id: fileObject.path,
            type: 'file',
            open: true,
            file: fileObject
          }

          tabs.push(tabObject)
        }
      }
    },

    events: {
      'add-tab': 'addTab',
      'close-file': 'closeFile'
    }
  }
</script>

<style lang="scss">
  #tab-container {
    font-size: 12px;
    display: flex;
    flex: 1;
    flex-direction: column;
    max-height: 30px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
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

  #tabs {
    margin-left: 53px;


    ul {
      list-style: none;
      padding:0;
      margin:0;
      white-space: nowrap;
    }

    li {
      margin: 0 0 0 0;
      display: inline-block;
    }
    
    div {
      display: inline-block;
      height: 30px;
      background-color: rgba(153, 153, 153, 0.1);
      width: 128px;
      text-align: center;
    }

    div.selected{
       background-color: rgba(153, 153, 153, 0.4);
    }

    li div {
      border-right: 1px solid rgba(153, 153, 153, 0.3);
    }

    li:first-child div {
      border-top-left-radius: 8px;
    }

    li:nth-last-child(2) div {
      border-top-right-radius: 8px;
      border-right: none;
    }

    li:nth-last-child(1) div {
      border-right: none;
    }

    a{
      display: inline-block;
      text-decoration: none;
      line-height: 2.4;
      text-align: center;
      color: #b5b5b5;
      outline: none;
    }
    a.delete{
      color: #aaa;
      float: right;
      padding-right: 18px;
      background: url('../assets/images/close-button.svg');
      background-repeat: no-repeat;
      margin-top: 10px;
      height: 10px;
    }
    .selected a{
      color: #333333;
    }
    a.delete:hover {
      opacity: 0.5;
    }
  }

  #add {

    div {
      width: 30px !important;
      background-color: #fbfbfb;;
    }
    a {
      width: 100%;
      display:block;
      color: #333333;
    }
    a:hover {
      opacity: 0.5;
    }
  }


</style>