/**
 * @license MIT © 2012 @blixt
 */

/**
 * A grid of tiles that can be flipped individually or in groups (as one).
 * @param {number} cols Number of columns in the grid.
 * @param {number} rows Number of rows in the grid.
 * @param {number} size The width and height, in pixels, of each tile.
 * @constructor
 */
function Grid(cols, rows, size) {
  var n = document.createElement('div');
  n.className = 'grid';

  var foreground = [], background = [];
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      var tile1 = Grid.tileTemplate_.cloneNode();
      tile1.style.height = size + 'px';
      tile1.style.left = (x * size) + 'px';
      tile1.style.top = (y * size) + 'px';
      tile1.style.width = size + 'px';
      var tile2 = tile1.cloneNode();

      Grid.setBack_(tile1);
      n.appendChild(tile1);
      background.push(tile1);

      Grid.setFace_(tile2);
      n.appendChild(tile2);
      foreground.push(tile2);
    }
  }

  /**
   * The number of columns in this grid.
   * @type {number}
   */
  this.cols = cols;

  /**
   * The number of rows in this grid.
   * @type {number}
   */
  this.rows = rows;

  /**
   * The width and height, in pixels, of tiles in this grid.
   * @type {number}
   */
  this.size = size;

  /**
   * The element that represents this grid.
   * @type {Element}
   */
  this.node = n;

  /**
   * A lookup for all tiles in the background layer (not currently shown).
   * @type {Array.<Element>}
   */
  this.background = background;

  /**
   * A lookup for all tiles in the foreground layer (currently shown).
   * @type {Array.<Element>}
   */
  this.foreground = foreground;
}

/**
 * A template for creating tile elements.
 * @type {Element}
 * @private
 */
Grid.tileTemplate_ = document.createElement('div');
Grid.tileTemplate_.className = 'tile';
Grid.tileTemplate_.style.backgroundPosition = '50% 50%';
Grid.tileTemplate_.style.backgroundSize = 'cover';
Grid.tileTemplate_.style.position = 'absolute';
Grid.tileTemplate_.style.webkitBackfaceVisibility = 'hidden';
Grid.tileTemplate_.dataset.cols = '1';
Grid.tileTemplate_.dataset.rows = '1';

/**
 * Animates a flip to the background on a tile.
 * @param {Element} tile The tile to flip.
 * @private
 */
Grid.setBack_ = function (tile) {
  tile.style.webkitAnimation = 'grid-flip-back 1s';
  tile.style.webkitTransform = 'rotateY(180deg)';
};

/**
 * Animates a flip to the foreground on a tile.
 * @param {Element} tile The tile to flip.
 * @private
 */
Grid.setFace_ = function (tile) {
  tile.style.webkitAnimation = 'grid-flip-face 1s';
  tile.style.webkitTransform = '';
};

/**
 * Gets the available coordinates that a group of X by Y tiles could be flipped
 * into.
 * @param {number} sx The number of tiles horizontally in the group.
 * @param {number} sy The number of tiles vertically in the group.
 * @param {number} limit The max number of coordinates to return.
 * @param {boolean=} opt_unoccupiedOnly Whether to only return coordinates that
 *     are not currently set to an image.
 * @return {Array.<Array.<number>>} Returns an array of coordinate pairs.
 */
Grid.prototype.getAvailable = function(sx, sy, limit, unoccupiedOnly) {
  var tiles = this.foreground;
  var w = this.cols, h = this.rows;

  var result = [];
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      if (this.isAvailable(x, y, sx, sy, unoccupiedOnly)) {
        result.push([x, y]);
        if (result.length == limit) return result;
      }
    }
  }

  return result;
};

/**
 * Flips a group of tiles at the specified coordinates. It is not valid to
 * specify coordinates that would break up an existing tile group.
 * @param {number} x The X coordinate.
 * @param {number} y The Y coordinate.
 * @param {number} sx The number of tiles to flip horizontally.
 * @param {number} sy The number of tiles to flip vertically.
 * @param {string=} opt_to An image URL to flip the tiles to. If not specified,
 *     the tiles will flip into being empty.
 */
Grid.prototype.flip = function(x, y, sx, sy, to) {
  if (!this.isAvailable(x, y, sx, sy)) {
    throw new Error('tried to flip partial tile');
  }

  var gridSize = this.size,
      cx = sx * gridSize / 2,
      cy = sy * gridSize / 2;

  var bg = this.background, fg = this.foreground;
  for (var dy = 0; dy < sy; dy++) {
    var rowIndex = (y + dy) * this.cols;
    for (var dx = 0; dx < sx; dx++) {
      var i = rowIndex + x + dx;
      var tile1 = fg[i], tile2 = bg[i];

      tile1.style.webkitTransformOrigin = (cx - dx * gridSize) + 'px ' + (cy - dy * gridSize) + 'px';
      Grid.setBack_(tile1);

      if (to) {
        if (dx == 0 && dy == 0) {
          tile2.dataset.cols = sx;
          tile2.dataset.rows = sy;
          tile2.dataset.occupied = 'yes';
          tile2.style.backgroundImage = 'url(' + to + ')';
          tile2.style.webkitTransformOrigin = cx + 'px ' + cy + 'px';
          tile2.style.height = sy * gridSize + 'px';
          tile2.style.width = sx * gridSize + 'px';
          Grid.setFace_(tile2);
        } else {
          tile2.dataset.cols = -dx;
          tile2.dataset.rows = -dy;
          tile2.dataset.occupied = 'yes';
        }
      } else {
        tile2.dataset.cols = 1;
        tile2.dataset.rows = 1;
        delete tile2.dataset.occupied;
        tile2.style.backgroundImage = '';
        tile2.style.webkitTransformOrigin = (cx - dx * gridSize) + 'px ' + (cy - dy * gridSize) + 'px';
        tile2.style.height = gridSize + 'px';
        tile2.style.width = gridSize + 'px';
        Grid.setFace_(tile2);
      }

      bg[i] = tile1;
      fg[i] = tile2;
    }
  }
};

/**
 * Flips a group of tiles at any available spot on the grid.
 * @param {number} sx The number of tiles horizontally to flip.
 * @param {number} sy The number of tiles vertically to flip.
 * @param {string=} opt_to An image URL to flip the tiles to. If not specified,
 *     the tiles will flip into being empty.
 * @param {boolean=} opt_unoccupiedOnly Whether to only consider coordinates
 *     that are not currently set to an image.
 * @return {boolean} Whether a flip occurred. A flip may not occur if there is
 *     no available space for the specified tile group.
 */
Grid.prototype.flipRandom = function(sx, sy, to, unoccupiedOnly) {
  var avail = this.getAvailable(sx, sy, 0, unoccupiedOnly);
  if (!avail.length) return false;
  var coords = avail[Math.round(Math.random() * (avail.length - 1))];
  this.flip(coords[0], coords[1], sx, sy, to);
  return true;
};

/**
 * Checks if the specified coordinates are available to be flipped.
 * @param {number} x The X coordinate.
 * @param {number} y The Y coordinate.
 * @param {number} sx The number of tiles horizontally.
 * @param {number} sy The number of tiles vertically.
 * @param {boolean=} opt_unoccupiedOnly Whether to only consider coordinates
 *     that are not currently set to an image.
 * @return {boolean} Whether the coordinates are available.
 */
Grid.prototype.isAvailable = function(x, y, sx, sy, unoccupiedOnly) {
  var w = this.cols, h = this.rows;
  if (x < 0 || y < 0 || x + sx > w || y + sy > h) return false;

  for (var dy = 0; dy < sy; dy++) {
    for (var dx = 0; dx < sx; dx++) {
      var tile = this.foreground[(y + dy) * w + x + dx];
      if (unoccupiedOnly && tile.dataset.occupied) return false;
      var cols = parseInt(tile.dataset.cols), rows = parseInt(tile.dataset.rows);
      if (dx + cols < 0 || dy + rows < 0 || dx + cols > sx || dy + rows > sy) {
        return false;
      }
    }
  }

  return true;
};

// Inject CSS animations.
addEventListener('DOMContentLoaded', function () {
  // Just a simple function that builds CSS out of a JS object structure.
  function css(def) {
    var pieces = [];
    for (var key in def) {
      var value = def[key];
      if (typeof value == 'string') {
        pieces.push(key + ':' + value + ';');
      } else {
        pieces.push(key + '{' + css(value) + '}');
      }
    }
    return pieces.join('');
  }

  // Animation definitions.
  var flipBack = {
    '@-webkit-keyframes grid-flip-back': {
      '0%': {
        '-webkit-transform': 'rotateY(0deg)'
      },
      '70%': {
        'opacity': '.5',
        '-webkit-transform': 'rotateY(180deg) scale(.8)'
      },
      '100%': {
        '-webkit-transform': 'rotateY(180deg)'
      }
    }
  };

  var flipFace = {
    '@-webkit-keyframes grid-flip-face': {
      '0%': {
        '-webkit-transform': 'rotateY(180deg)'
      },
      '70%': {
        'opacity': '.5',
        '-webkit-transform': 'rotateY(360deg) scale(.8)'
      },
      '100%': {
        '-webkit-transform': 'rotateY(360deg)'
      }
    }
  };

  // Try to add the CSS rules to an existing stylesheet. If one doesn't exist,
  // create a new <style> tag.
  if (document.styleSheets.length) {
    document.styleSheets[0].insertRule(css(flipBack), 0);
    document.styleSheets[0].insertRule(css(flipFace), 0);
  } else {
    var style = document.createElement('style');
    style.innerHTML = css(flipBack) + css(flipFace);
    document.getElementsByTagName('head')[0].appendChild(style);
  }
});
