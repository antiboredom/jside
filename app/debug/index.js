var $ = require('jquery');

module.exports = {

  template: require('./template.html'),

  data: {
    orientation: undefined,
    debugWidth: undefined
  },

  methods: {

    startDrag: function(e) {
      if ($('body').hasClass('horizontal')) {
        this.horizonatlDrag(e);
      } else {
        this.verticalDrag(e);
      }
    },

    horizonatlDrag: function(e) {
      var container = $('#debug-container');
      var startY = e.clientY;
      var startHeight = container.height();
      var self = this;
      $(document).on('mousemove', function(e) {
        container.css({
          height: startHeight - (e.clientY - startY)
        });
        self.debugWidth = startHeight - (e.clientY - startY);
        ace.resize();
      }).on('mouseup', function(e) {
        $(document).off('mouseup').off('mousemove');
      });
    },

    verticalDrag: function(e) {
      var container = $('#debug-container');
      var startX = e.clientX;
      var startWidth = container.width();
      var self = this;
      $(document).on('mousemove', function(e) {
        container.css({
          width: startWidth - (e.clientX - startX)
        });
        self.debugWidth = startWidth - (e.clientX - startX)
        ace.resize();
      }).on('mouseup', function(e) {
        $(document).off('mouseup').off('mousemove');
      });
    },

    checkSize: function(value) {
      if (this.orientation != value.consoleOrientation) {
        this.orientation = value.consoleOrientation;
        var container = $('#debug-container');
        if (this.orientation === 'vertical') {
          container.css({
            width: this.debugWidth.toString() + "px",
            height: 'auto'
          });

        } else {
          container.css({
            width: 'auto',
            height: this.debugWidth > $('#editor-container').height() ? "100px" : this.debugWidth.toString() + "px"
          });
        }
      }
    }

  },

  ready: function() {
    this.orientation = this.$root.settings.consoleOrientation;
    this.$on('settings-changed', this.checkSize);
    var container = $('#debug-container');
    this.debugWidth = container.width();
  }

}