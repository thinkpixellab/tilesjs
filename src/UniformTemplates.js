
// template provider which returns simple templates with 1x1 tiles
Tiles.UniformTemplates = {
    get: function(numCols, targetTiles) {
        var numRows = Math.ceil(targetTiles / numCols),
            rects = [],
            x, y;

        // create the rects for 1x1 tiles
        for (y = 0; y < numRows; y++) {
            for (x = 0; x < numCols; x++) {
                rects.push(new Tiles.Rectangle(x, y, 1, 1));
            }
        }

        return new Tiles.Template(rects, numCols, numRows);
    }
};