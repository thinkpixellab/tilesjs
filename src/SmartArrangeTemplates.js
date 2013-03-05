// template provider which returns simple templates with 1x1 tiles
Tiles.SmartArrangeTemplates = {
    get: function (numCols, targetTiles, tiles) {
        var LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            i, j, iLen, jLen, regExp, d, dx, match, strReplace, tileSegmentStr, strBuilder, templateArr, matchIndex,
            DEFAULT_TILE_SIZE = { x: 1, y: 1 };

        //helper function to build new line of template.
        var buildTemplateLineSegment = function (n) {
            strBuilder = [];
            for (i = 0; i < n; i++) {
                strBuilder.push('.');
            }
            strBuilder.push('*');
            return strBuilder.join('');
        };

        //Fall back to uniform templates factory if tiles is null or empty.
        if (!tiles || tiles.length === 0) {
            return Tiles.UniformTemplates.get(numCols, targetTiles);
        }

        //Initialize template string.
        var templateString = buildTemplateLineSegment(numCols);

        for (var index = 0, tile; tile = tiles[index]; index++) {

            d = tile.id.size || DEFAULT_TILE_SIZE;
            dx = numCols < d.x ? numCols : d.x;

            //Regular Expression use to see if current tile can fit within the current template.
            regExp = new RegExp('(\\.{' + dx + '}.{' + (numCols - dx + 1) + '}){' + d.y + '}', 'g');

            match = null;
            //Append to template until we can fit the current tile.
            while (!(match = templateString.match(regExp))) {
                templateString += buildTemplateLineSegment(numCols);
            }

            //Once we find the section of the template that can fit the tile, insert the tile into template.
            strReplace = match[0].split('');
            tileSegmentStr = '';
            strBuilder = [];
            
            //Building the tile horizontal segment.
            for (i = 0; i < dx; i++) {
                strBuilder.push(LABELS[index % 26]);
            }
            tileSegmentStr = strBuilder.join('');

            //Replace the empty space in template with tile segments.
            for (i = 0, iLen = strReplace.length; i < iLen; i += numCols + 1) {
                for (j = 0, jLen = tileSegmentStr.length; j < jLen; j++) {
                    strReplace[i + j] = tileSegmentStr[j];
                }
            }

            //Rebuilding the template
            templateArr = [];
            matchIndex = templateString.indexOf(match[0]);
            
            //Assure that no following small tiles can fit within this space to avoid tiles to be out of order.
            templateArr.push(templateString.substring(0, matchIndex).replace(/\./g, '~'));
            
            templateArr.push(strReplace.join(''));
            templateArr.push(templateString.substring(matchIndex + match[0].length));

            templateString = templateArr.join('');
        }
        templateString = templateString.replace(/\*/ig, '').replace(/(\.)/ig, '~');
        //Convert template into json object.
        var templateJson = [];
        for (i = 0, iLen = templateString.length; i < iLen; i += numCols) {
            templateJson.push(templateString.slice(i, i + numCols));
        }

        return Tiles.Template.fromJSON(templateJson);
    }
};