Tiles.js
=====

###Goal###
Make it easy to create grid based layouts which can adapt to various screen sizes and changing content.

###How###
The Tiles.js library provides a grid control and a simple template language for defining layouts. It uses jQuery to animate tiles when either the content or resolution changes.

###Demo###
See the tiles in action on [Pulse for the Web](http://www.pulse.me/)!

Once you sign-in to Pulse, check out the [Behind the Scenes](http://www.pulse.me/app/dev) page which includes more info about the tiles and a live editor to experiment with templates.

###Install###

    npm install tilesjs


Or you can download binaries from the dist folder

Compiled size: 6 KB (just over 2 KB gzipped).

###Sample Code###
There are 2 samples in the demos directory. A proper site with documentation and additional samples is coming soon...

###Tile###
A tile is a rectangular element that covers one or more cells in a grid. Each tile has a unique identifier and maintains its current position in the grid (top, left, width, height).

The tile handles several events during its lifecycle:

* appendTo: tile should be appended to the parent grid element. 
* remove: tile should be removed from the parent grid
* resize: tile is resized (or moved) within the parent grid

###Template###
A template specifies the layout of variably sized tiles in a grid. We provide a simple JSON based template language for defining templates. A single cell tile should use the period character. Larger tiles may be created using any character that is unused by a adjacent tile. Whitespace is ignored when parsing the rows.

Examples:

    var simpleTemplate = [
        '    A  A  .  B    ',
        '    A  A  .  B    ',
        '    .  C  C  .    ',
    ];

    var complexTemplate = [
        '    J  J  .  .  E  E    ',
        '    .  A  A  .  E  E    ',
        '    B  A  A  F  F  .    ',
        '    B  .  D  D  .  H    ',
        '    C  C  D  D  G  H    ',
        '    C  C  .  .  G  .    ',
    ];

In addition to creating templates using JSON, you can also programmatically build templates. The library includes a simple UniformTemplate factory which creates 1x1 templates for a given number of columns and tiles. Custom template factories can be created to generate content aware layouts.

###Grid###
The grid control renders a set of tiles into a template. The grid was designed to fill available screen area by either scaling the size of a cell or by requesting a new template with a different number of columns. 

It was also designed for a changing set of content. When tiles or template change, the grid will instruct the tiles to either fade in, animate, or fade out to their new location.

Updates and Redraw are separate processes, so a series of updates may be made to the content followed by a single redraw to trigger the animation when appropriate. During the redraw phase, the grid has a prioritization extensibility point. Custom grid controls can be created to order the content prior to assigning each tile a spot in the grid.


## The MIT License ##

Copyright (c) 2012 Pixel Lab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.