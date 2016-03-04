module.exports = {
  template: require('./template.html'),

  data: {
    tabSizeDisplay: 1
  },

  ready: function() {
    if (parseInt(this.tabSize) < 1) {
      this.tabSize = 1;
    }
    this.tabSizeDisplay = this.tabSize;
  },

  methods: {
    updateTabSize: function(e) {
      var parsed = typeof e === 'number' ? e : parseInt(e.target.value);
      this.tabSize = parsed >= 1 ? parsed : 1;
      this.tabSizeDisplay = this.tabSize;
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
