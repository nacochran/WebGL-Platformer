
let scene = 'menu';

function play() {
  scene = 'game';
  levels[level - 1].create();
  refillBuffers();

  var menu = document.getElementById("menu");
  menu.style.display = "none";
}