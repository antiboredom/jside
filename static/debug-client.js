/*eslint-disable*/
(function() {
  console.log('window.opener is')
  console.log(window.opener)
  
  const JSON2 = require('JSON2');
  var original = window.console;
  window.console = {};
  window._isNodeWebkit = true;

  ["log", "warn", "error"].forEach(function(func) {
    window.console[func] = function(msg) {
      var style = null;
      if (arguments[2] && arguments[0].indexOf('%c') > -1) {
        style = arguments[1];
      }
      var data = {
        msg: JSON2.stringify(JSON2.decycle(msg, true), null, '  '),
        style: style,
        type: func
      };

      window.opener.postMessage(JSON2.stringify({ console: data}), 'file://');

      original[func].apply(original, arguments);
    };
  });


  window.onerror = function(msg, url, num, column, errorObj) {
    var data = {
      num: num,
      // msg: JSON2.stringify(JSON2.decycle(msg, true), null, '  '),
      msg: msg,
      type: 'error'
    };

    window.opener.postMessage(JSON2.stringify({ console: data}), 'file://');

    return false;
  };

  function downloadFile() {
    window.opener.postMessage(JSON2.stringify({ downloadFile: arguments }), 'file://');
  }

  var booted = false;
  var interval = setInterval(function() {
    if (typeof p5 !== 'undefined' && !booted) {
      p5.prototype.downloadFile = downloadFile;
      booted = true;
      clearInterval(interval);
    }
  }, 10);

})();
/*eslint-disable*/
