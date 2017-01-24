(function() {

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
        msg: JSON.stringify(JSON.decycle(msg, true), null, '  '),
        style: style,
        type: func
      };

      window.opener.postMessage(JSON.stringify({ console: data}), 'file://');

      original[func].apply(original, arguments);
    };
  });


  window.onerror = function(msg, url, num, column, errorObj) {
    var data = {
      num: num,
      // msg: JSON.stringify(JSON.decycle(msg, true), null, '  '),
      msg: msg,
      type: 'error'
    };

    window.opener.postMessage(JSON.stringify({ console: data}), 'file://');

    return false;
  };

  function downloadFile() {
    window.opener.postMessage(JSON.stringify({ downloadFile: arguments }), 'file://');
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

