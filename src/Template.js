               
/*
    A grid template specifies the layout of variably sized tiles. A single
    cell tile should use the period character. Larger tiles may be created
    using any character that is unused by a adjacent tile. Whitespace is
    ignored when parsing the rows. 

    Examples:

    var simpleTemplate = [
        '    A  A  .  B    ',
        '    A  A  .  B    ',
        '    .  C  C  .    ',
    ]

    var complexTemplate = [
        '    J  J  .  .  E  E    ',
        '    .  A  A  .  E  E    ',
        '    B  A  A  F  F  .    ',
        '    B  .  D  D  .  H    ',
        '    C  C  D  D  G  H    ',
        '    C  C  .  .  G  .    ',
    ];
*/

(function($) {

    // remove whitespace and create 2d array
    var parseCells = function(rows) {
        var cells = [],
            numRows = rows.length,
            x, y, row, rowLength, cell;

        // parse each row
        for(y = 0; y < numRows; y++) {
            
            row = rows[y];
            cells[y] = [];

            // parse the cells in a single row
            for (x = 0, rowLength = row.length; x < rowLength; x++) {
                cell = row[x];
                if (cell !== ' ') {
                    cells[y].push(cell);
                }
            }
        }

        // TODO: check to make sure the array isn't jagged

        return cells;
    };

    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    Rectangle.prototype.copy = function() {
        return new Rectangle(this.x, this.y, this.width, this.height);
    };

    Tiles.Rectangle = Rectangle;

    // convert a 2d array of cell ids to a list of tile rects
    var parseRects = function(cells) {
        var rects = [],
            numRows = cells.length,
            numCols = numRows === 0 ? 0 : cells[0].length,
            cell, height, width, x, y, rectX, rectY;

        // make a copy of the cells that we can modify
        cells = cells.slice();
        for (y = 0; y < numRows; y++) {
            cells[y] = cells[y].slice();
        }

        // iterate through every cell and find rectangles
        for (y = 0; y < numRows; y++) {
            for(x = 0; x < numCols; x++) {
                cell = cells[y][x];

                // skip cells that are null
                if (cell == null) {
                    continue;
                }

                width = 1;    
                height = 1;

                if (cell !== Tiles.Template.SINGLE_CELL) {

                    // find the width by going right until cell id no longer matches 
                    while(width + x < numCols &&
                          cell === cells[y][x + width]) {
                        width++;
                    }

                    // now find height by going down
                    while (height + y < numRows &&
                           cell === cells[y + height][x]) {
                        height++;
                    }
                }

                // null out all cells for the rect
                for(rectY = 0; rectY < height; rectY++) {
                    for(rectX = 0; rectX < width; rectX++) {
                        cells[y + rectY][x + rectX] = null;
                    }
                }

                // add the rect
                rects.push(new Rectangle(x, y, width, height));
            }
        }

        return rects;
    };

    Tiles.Template = function(rects, numCols, numRows) {
        this.rects = rects;
        this.numTiles = this.rects.length;
        this.numRows = numRows;
        this.numCols = numCols;
    };

    Tiles.Template.prototype.copy = function() {

        var copyRects = [],
            len, i;
        for (i = 0, len = this.rects.length; i < len; i++) {
            copyRects.push(this.rects[i].copy());
        }

        return new Tiles.Template(copyRects, this.numCols, this.numRows);
    };

    // appends another template (assumes both are full rectangular grids)
    Tiles.Template.prototype.append = function(other) {

        if (this.numCols !== other.numCols) {
            throw 'Appended templates must have the same number of columns';
        }
        
        // new rects begin after the last current row
        var startY = this.numRows,
            i, len, rect;

        // copy rects from the other template
        for (i = 0, len = other.rects.length; i < len; i++) {
            rect = other.rects[i];
            this.rects.push(
                new Rectangle(rect.x, startY + rect.y, rect.width, rect.height));
        }

        this.numRows += other.numRows;
        this.numTiles += other.numTiles;
    };

    Tiles.Template.fromJSON = function(rows) {
        // convert rows to cells and then to rects
        var cells = parseCells(rows),
            rects = parseRects(cells);
        return new Tiles.Template(
            rects,
            cells.length > 0 ? cells[0].length : 0,
            cells.length);
    };

    Tiles.Template.prototype.toJSON = function() {
        // for now we'll assume 26 chars is enough (we don't solve graph coloring)
        var LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            NUM_LABELS = LABELS.length,
            labelIndex = 0,
            rows = [],
            i, len, rect, x, y, label;

        // fill in single tiles for each cell
        for (y = 0; y < this.numRows; y++) {
            rows[y] = [];
            for (x = 0; x < this.numCols; x++) {
                rows[y][x] = Tiles.Template.SINGLE_CELL;
            }
        }

        // now fill in bigger tiles
        for (i = 0, len = this.rects.length; i < len; i++) {
            rect = this.rects[i];
            if (rect.width > 1 || rect.height > 1) {

                // mark the tile position with a label
                label = LABELS[labelIndex];
                for(y = 0; y < rect.height; y++) {
                    for(x = 0; x < rect.width; x++) {
                        rows[rect.y + y][rect.x + x] = label;
                    }
                }

                // advance the label index
                labelIndex = (labelIndex + 1) % NUM_LABELS;
            }
        }

        // turn the rows into strings
        for (y = 0; y < this.numRows; y++) {
            rows[y] = rows[y].join('');
        }

        return rows;
    };
    
    // period used to designate a single 1x1 cell tile
    Tiles.Template.SINGLE_CELL = '.';

})(jQuery);
