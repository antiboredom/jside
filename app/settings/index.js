var $ = require('jquery');
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
    },
    showSidebarOn: function() {
      $('#showSidebarOn + label').addClass('labelSelected');
      $('#showSidebarOff + label').removeClass('labelSelected');
      $('#showSidebarOn').prop('checked', true);
      $('#showSidebarOff + label').click(function(){
        $('#showSidebarOn + label').removeClass('labelSelected');
      });
    },
    showSidebarOff: function() {
      $('#showSidebarOff + label').addClass('labelSelected');
      $('#showSidebarOn + label').removeClass('labelSelected');
      $('#showSidebarOff').prop('checked', true);
      $('#showSidebarOn + label').click(function(){
        $('#showSidebarOff + label').removeClass('labelSelected');
      });
    }
  }

};
