/*
 * @norender
 * @name Instance Container
 * @description Optionally, you can specify a default container for the canvas
 * and any other elements to append to with a second argument. You can give the
 * ID of an element in your html, or an html node itself.
 *
 * Here are three different options for selecting a container
 * DOM element. All DOM elements (canvas, buttons, divs, etc) created by p5
 * will be attached to the DOM element specified as the second argument to the
 * p5() call.
 */
<!-- pass in the ID of the container element -->
<!DOCTYPE html>
<head>
  <script src='p5.js'></script>
</head>
<body>
  <div id='container'></div>
  <script>
  var sketch = function(p) {
    p.setup = function(){
      p.createCanvas(100, 100);
      p.background(0);
    }
  };
  new p5(sketch, 'container');
  </script>
</body>
</html>


<!-- pass in a pointer to the container element -->
<!DOCTYPE html>
<head>
  <script src='p5.js'></script>
</head>
<body>
  <div id='container'></div>
  <script>
  var sketch = function(p) {
    p.setup = function(){
      p.createCanvas(100, 100);
      p.background(0);
    }
  };
  new p5(sketch, window.document.getElementById('container'));
  </script>
</body>
</html>


<!-- create an element, attach it to the body,
and pass in a pointer -->
<!DOCTYPE html>
<head>
  <script src='p5.js'></script>
</head>
<body>
  <script>
  var sketch = function(p) {
    p.setup = function(){
      p.createCanvas(100, 100);
      p.background(0);
    }
  };
  var node = document.createElement('div');
  window.document.getElementsByTagName('body')[0].appendChild(node);
  new p5(sketch, node);
  </script>
</body>
</html>


<!-- create an element, pass in a pointer,
and attach it to the body -->
<!DOCTYPE html>
<head>
  <script src='p5.js'></script>
</head>
<body>
  <script>
  var sketch = function(p) {
    p.setup = function(){
      p.createCanvas(100, 100);
      p.background(0);
    }
  };
  var node = document.createElement('div');
  new p5(sketch, node);
  window.document.getElementsByTagName('body')[0].appendChild(node);
  </script>
</body>
</html>