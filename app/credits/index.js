var manifest = nodeRequire('./package.json');
var $ = require('jquery');

var contributorsURL = 'https://api.github.com/repos/processing/p5.js-editor/contributors'

module.exports = {
  template: require('./template.html'),

  data: {
    version: '',
    contributors: ''
  },

  ready: function() {
    this.version = manifest.version;

    $.ajax({
      url: contributorsURL,
      success: getContributors,
      cache: false,
      dataType: 'json'
    });

    function getContributors( data ) {

      var listContributors = '';

      $(data).each(function(index, element){
        listContributors += '<a href="'+element.html_url+'" target="_blank"><img src="'+element.avatar_url+'" title="'+element.login+'"></a>';
      });

      $('#contributors').html(listContributors);
    }


  }

};
