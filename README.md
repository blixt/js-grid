# Flippin' grid library

A JavaScript library that lets you create a grid of tiles that can be flipped
individually or in groups (as one) using CSS 3D animations.

## Example

For a full example, have a look at example.html.

    // Set up a new grid.
    var grid = new Grid(10, 10, 50);
    // Add it to the document.
    document.body.appendChild(grid.node);
    // Flip an image onto a random position on the grid, taking up 2x2 tiles.
    grid.flipRandom(2, 2, '/image.jpg');

## Notes

This library is currently in a very early stage and *only works with WebKit
right now*. Watch this repository for updates and feel free to submit pull
requests!

## MIT license

This project is licensed under an MIT license.  
<http://www.opensource.org/licenses/mit-license.php>

Copyright © 2012 Blixt <me@blixt.org>
