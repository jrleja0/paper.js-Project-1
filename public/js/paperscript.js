/* global Group, Path, Point, project, Raster, Symbol, Tool, view */
import paper, { Symbol } from '../../node_modules/paper/dist/paper-full.min.js';

// initializing program
window.onload = () => {
  paper.install(window);
  paper.setup('mainCanvas');
  console.log('running-- w:', view.size.width, '&& h:', view.size.height);

  // demo of basic circle
  //const circle = new Path.Circle(new Point(100, 100), 50);
  // circle.strokeColor = 'black';  // circle.fillColor = 'red';  // circle.fitBounds(view.bounds, true);

  // creating green background
  const greenBackground = new Raster('greenPattern');
  greenBackground.fitBounds(view.bounds, true);
  // greenBackground.position = view.center;  // greenBackground.scale(2.5);

  // creating yellow and blue symbols
  const createCircleSymbol = (color) => {
    const circle = new Path.Circle(new Point(100, 100), 50);
    const colorBackground = new Raster(color);
    colorBackground.scale(0.25);
    // masking colorBackground onto circle
    const colorCircleGroup = new Group({
      children: [circle, colorBackground],
      clipped: true
    });
    circle.fitBounds(colorBackground.bounds);
    return new Symbol(colorCircleGroup);
  };

  const yellowSymbol = createCircleSymbol('yellowPattern');
  const blueSymbol = createCircleSymbol('bluePattern');

  // populate symbol objects
  const seedSymbols = () => {
    yellowSymbol.place(view.size.multiply(Point.random()));
  };

  const tool = new Tool();
  tool.onMouseUp = (e) => {
    // replace selected symbol with different color symbol
    let hitResult = project.activeLayer.hitTest(e.point);
    console.log(hitResult.item._index);   // hitResult.item shows _id and _index (in layer)
    if (hitResult.item._index !== 0) {
      hitResult.item.remove();
      console.log(e.point);
    }
    blueSymbol.place(e.point);
    // let hitResult = project.hitTest(e.point, { match: yellowSymbol }); // does not work
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
        // console.log(symbol.newPointX);
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
