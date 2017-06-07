/* global Group, Path, Point, project, Raster, Symbol, view */
import paper, { Symbol } from '../../node_modules/paper/dist/paper-full.min.js';

window.onload = () => {
  paper.install(window);
  paper.setup('mainCanvas');
  console.log('running');
  console.log('w:', view.size.width, '&& h:', view.size.height);

  const circle = new Path.Circle(new Point(100, 100), 50);
  circle.strokeColor = 'black';
  circle.fillColor = 'red';

  const greenBackground = new Raster('greenPattern');
  // greenBackground.position = view.center;
  // greenBackground.scale(2.5);
  greenBackground.fitBounds(view.bounds, true);

  const yellowBackground = new Raster('yellowPattern');

  yellowBackground.position = view.size.multiply(Point.random());
  yellowBackground.scale(0.25);
  // masking yellowBackground onto circle
  const group0 = new Group({
    children: [circle, yellowBackground],
    clipped: true
  });
  circle.fitBounds(yellowBackground.bounds);

  const yellowSymbol = new Symbol(group0);


  const seedSymbols = () => {
    yellowSymbol.place(view.size.multiply(Point.random()));
  };


  let fading = true;
  view.onFrame = (e) => {
    //** seed and move the yellow symbols **//
    if (e.count < 31) seedSymbols();
    if (e.count > 20) yellowSymbol.definition.rotate(1);
    if (e.count > 39 && e.count % 20 === 0) {
      for (let i = 4; i < project.activeLayer.children.length; i++) {  // forEach will not work properly.
        let symbol = project.activeLayer.children[i];
        symbol.newPointX = Math.random() * 10 - 5;
        symbol.newPointY = Math.random() * 10 - 5;
        console.log(symbol.newPointX);
      }
    }
    if (e.count > 39) {
      // idea: saving newPointX and newPointY to each symbol obj, so that symbol always goes in a particular direction...
      for (let i = 1; i < project.activeLayer.children.length; i++) {
        let symbol = project.activeLayer.children[i];
        symbol.position.x += symbol.newPointX;
        symbol.position.y += symbol.newPointY;
        // symbol.position.x += symbol.bounds.width / 20;
      }
    }
    //** green background fades in and out **//
    if (greenBackground.opacity < 0.05) fading = false;
    if (greenBackground.opacity > 0.95) fading = true;
    fading ? greenBackground.opacity -= 0.003 : greenBackground.opacity += 0.003;
  };
};
