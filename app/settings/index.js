module.exports = {
  name: 'Settings',
  template: require('./template.html'),
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
      var parsed = typeof e === 'number' ? e : parseInt(e.target.value);
      this.tabSize = parsed >= 1 ? parsed : 1;
      ace.getSession().setTabSize(this.tabSize);
    },
    decreaseTabSize: function(e) {
      this.updateTabSize(this.tabSize-1);
    },
    increaseTabSize: function(e) {
      this.updateTabSize(this.tabSize+1);
    },
    decreaseFontSize: function(e) {
      this.fontSize--;
    },
    increaseFontSize: function(e) {
      this.fontSize++;
    }
  }

};
