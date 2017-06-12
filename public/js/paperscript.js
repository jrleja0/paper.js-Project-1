/* global Group, Path, Point, project, Raster, Symbol, Tool, view */
import paper, { Symbol } from '../../node_modules/paper/dist/paper-full.min.js';

// initializing program ////
window.onload = () => {
  paper.install(window);
  paper.setup('mainCanvas');
  console.log('running-- w:', view.size.width, '&& h:', view.size.height);

  //// creating green background ////
  const greenBackground = new Raster('greenPattern');
  greenBackground.fitBounds(view.bounds, true);
  // greenBackground.position = view.center;  // greenBackground.scale(2.5);

  //// creating yellow and blue symbols ////
  const createCircleSymbol = (color) => {
    const circle = new Path.Circle(new Point(100, 100), 60);
    const colorBackground = new Raster(color);
    colorBackground.scale(0.25);
    //// cropping/masking colorBackground onto circle ////
    const colorCircleGroup = new Group({
      children: [circle, colorBackground],
      clipped: true
    });
    colorBackground.fitBounds(circle.bounds);
    return new Symbol(colorCircleGroup);
    // return new Symbol(colorBackground);  /// return for square symbol, not circular.
  };
  const yellowSymbol = createCircleSymbol('yellowPattern');
  const blueSymbol = createCircleSymbol('bluePattern');

  //// populate symbol objects ////
  const seedYellowSymbol = () => {
    yellowSymbol.place(view.size.multiply(Point.random()));
  };
  const seedBlueSymbol = () => {
    blueSymbol.place(view.size.multiply(Point.random()));
  };

//// basic onMouseDown tool ////
  const tool = new Tool();
  tool.onMouseDown = (e) => {
    //// replace selected symbol with different color symbol ////
    let hitResult = project.activeLayer.hitTest(e.point);
    console.log(hitResult.item._index);   // hitResult.item shows _id and _index (in layer)
    if (hitResult.item._index !== 0) {
      hitResult.item.remove();
    }
  };

  let fading = true;
  view.onFrame = (e) => {
    // console.log(e.count);
    //// seed the yellow and blue symbols ////
    if (e.count < 31) {
      e.count % 5 === 0 ? seedBlueSymbol() : seedYellowSymbol();
    }
    // symbols begin to rotate
    if (e.count > 20) {
      yellowSymbol.definition.rotate(1);
      blueSymbol.definition.rotate(-3);
    }
    // symbols begin to move in random directions
    // saving newPointX and newPointY to each symbol obj instance, so that symbol instance goes in a particular direction in each frame.
    // direction will be reassigned every 20 frames.
    if (e.count > 39 && e.count % 20 === 0) {
      for (let i = 4; i < project.activeLayer.children.length; i++) {  // forEach will not work properly.
        let symbol = project.activeLayer.children[i];
        // assign points between -5 and +5, every 20 frames:
        symbol.newPointX = Math.random() * 10 - 5;
        symbol.newPointY = Math.random() * 10 - 5;
      }
    }
    // change symbols' positions
    if (e.count > 39) {
      for (let i = 1; i < project.activeLayer.children.length; i++) {
        let symbol = project.activeLayer.children[i];
        symbol.position.x += symbol.newPointX;
        symbol.position.y += symbol.newPointY;
        // symbol.position.x += symbol.bounds.width / 20; // uncomment to have all symbols move to the right.
      }
    }
    //// green background fades in and out ////
    if (greenBackground.opacity < 0.05) fading = false;
    if (greenBackground.opacity > 0.95) fading = true;
    fading ? greenBackground.opacity -= 0.003 : greenBackground.opacity += 0.003;
  };
};
