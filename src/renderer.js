import * as Blockly from "blockly/core";

class CustomConstantProvider extends Blockly.blockRendering.ConstantProvider {
  constructor() {
    // Set up all of the constants from the base provider.
    super();

    // Override a few properties.
    /**
     * The width of the notch used for previous and next connections.
     * @type {number}
     * @override
     */
    this.NOTCH_WIDTH = 20;

    /**
     * The height of the notch used for previous and next connections.
     * @type {number}
     * @override
     */
    this.NOTCH_HEIGHT = 10;

    /**
     * Rounded corner radius.
     * @type {number}
     * @override
     */
    this.CORNER_RADIUS = 2;

    /**
     * The height of the puzzle tab used for input and output connections.
     * @type {number}
     * @override
     */
    this.TAB_HEIGHT = 20;
  }

  /**
   * @returns Rectangular notch for use with previous and next connections.
   */
  makeRectangularPreviousConn() {
    const width = this.NOTCH_WIDTH;
    const height = this.NOTCH_HEIGHT;

    /**
     * Since previous and next connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the horizontal direction of the path (-1 or 1)
     * @returns SVGPath line for use with previous and next connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(0, height),
        Blockly.utils.svgPaths.point(dir * width, 0),
        Blockly.utils.svgPaths.point(0, -height),
      ]);
    }
    const pathLeft = makeMainPath(1);
    const pathRight = makeMainPath(-1);

    return {
      width: width,
      height: height,
      pathLeft: pathLeft,
      pathRight: pathRight,
    };
  }

  /**
   * @returns Rectangular puzzle tab for use with input and output connections.
   */
  makeRectangularInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, dir * height),
        Blockly.utils.svgPaths.point(width, 0),
      ]);
    }
    const pathUp = makeMainPath(-1);
    const pathDown = makeMainPath(1);

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }

  /**
   * @returns Triangular puzzle tab for use with input and output connections.
   */
  makeTriangularInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-width, (dir * height) / 2),
        Blockly.utils.svgPaths.point(width, (dir * height) / 2),
      ]);
    }
    const pathUp = makeMainPath(-1);
    const pathDown = makeMainPath(1);

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }

  /**
   * @returns Circular puzzle tab for use with input and output connections.
   */
  makeCircularInputConn() {
    const width = this.NOTCH_WIDTH;
    const height = this.NOTCH_HEIGHT;
    const radius = Math.min(width, height) / 2;

    return {
      width: width,
      height: height,
      pathUp: `a 1 1 0 0 1 0 -${height}`,
      pathDown: `a 1 1 0 0 0 0 ${height}`,
    };
  }

  /**
   * @override
   */
  init() {
    // First, call init() in the base provider to store the default objects.
    super.init();

    // Add calls to create shape objects for the new connection shapes.
    this.RECT_PREV_NEXT = this.makeRectangularPreviousConn();
    this.RECT_INPUT_OUTPUT = this.makeRectangularInputConn();
    this.TRIG_INPUT_OUTPUT = this.makeTriangularInputConn();
    this.CIRC_INPUT_OUTPUT = this.makeCircularInputConn();
  }

  /**
   * @override
   */
  shapeFor(connection) {
    var checks = connection.getCheck();
    switch (connection.type) {
      case Blockly.INPUT_VALUE:
      case Blockly.OUTPUT_VALUE:
        if (
          checks &&
          (checks.includes("Number") || checks.includes("rect-meta"))
        ) {
          return this.RECT_INPUT_OUTPUT;
        }
        if (
          checks &&
          (checks.includes("String") || checks.includes("trig-meta"))
        ) {
          return this.TRIG_INPUT_OUTPUT;
        }
        if (checks && checks.includes("circ-meta")) {
          return this.CIRC_INPUT_OUTPUT;
        }
        return this.PUZZLE_TAB;
      case Blockly.PREVIOUS_STATEMENT:
      case Blockly.NEXT_STATEMENT:
        return this.NOTCH;
      default:
        S;
        throw Error("Unknown connection type");
    }
  }
}

class CustomRenderer extends Blockly.blockRendering.Renderer {
  constructor() {
    super();
  }
  /**
   * @override
   */
  makeConstants_() {
    return new CustomConstantProvider();
  }
}

Blockly.blockRendering.register("custom_renderer", CustomRenderer);
