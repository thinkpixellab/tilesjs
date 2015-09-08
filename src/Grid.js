(function($) {

    var Grid = Tiles.Grid = function(element) {

        this.$el = $(element);

        // animation lasts 500 ms by default
        this.animationDuration = 500;

        // the default set of factories used when creating templates
        this.templateFactory = Tiles.UniformTemplates;
        
        // defines the page size for prioritization of positions and tiles
        this.priorityPageSize = Number.MAX_VALUE;

        // spacing between tiles
        this.cellPadding = 10;

        // min width and height of a cell in the grid
        this.cellWidthMin = 150;
        this.cellHeightMin = 150;

        // actual width and height of a cell in the grid
        this.cellWidth = 0;
        this.cellHeight = 0;

        this.cellAspectRatio = 1;

        // number of tile cell columns
        this.numCols = 1;

        // cache the current template
        this.template = null;

        // flag that tracks whether a redraw is necessary
        this.isDirty = true;

        this.tiles = [];

        // keep track of added and removed tiles so we can update tiles
        // and the render the grid independently.
        this.tilesAdded = [];
        this.tilesRemoved = [];
    };

    Grid.prototype.getContentWidth = function() {
        // by default, the entire container width is used when drawing tiles
        return this.$el.width();
    };

    // gets the number of columns during a resize
    Grid.prototype.resizeColumns = function() {
        var panelWidth = this.getContentWidth();
        
        // ensure we have at least one column
        return Math.max(1, Math.floor((panelWidth + this.cellPadding) /
            (this.cellWidthMin + this.cellPadding)));
    };

    // gets the cell size during a grid resize
    Grid.prototype.resizeCellWidth = function() {
        var panelWidth = this.getContentWidth();
        return Math.ceil((panelWidth + this.cellPadding) / this.numCols) -
            this.cellPadding;
    };

    Grid.prototype.resize = function() {
        
        var newCols = this.resizeColumns();
        if (this.numCols !== newCols && newCols > 0) {
            this.numCols = newCols;
            this.isDirty = true;
        }

        var newCellWidth = this.resizeCellWidth();        
        if (this.cellWidth !== newCellWidth && newCellWidth > 0) {
            this.cellWidth = newCellWidth;
            this.cellHeight = this.cellWidth / this.cellAspectRatio;
            this.isDirty = true;    
        }
    };

    // refresh all tiles based on the current content
    Grid.prototype.updateTiles = function(newTileIds) {

        // ensure we dont have duplicate ids
        newTileIds = uniques(newTileIds);

        var numTiles = newTileIds.length,
            newTiles = [],
            i, tile, tileId, index;

        // retain existing tiles and queue remaining tiles for removal
        for (i = this.tiles.length - 1; i >= 0; i--) {
            tile = this.tiles[i];
            index = $.inArray(tile.id, newTileIds);
            if (index < 0) {
                this.tilesRemoved.push(tile);
                //console.log('Removing tile: ' + tile.id)
            }
            else {
                newTiles[index] = tile;
            }
        }

        // clear existing tiles
        this.tiles = [];

        // make sure we have tiles for new additions
        for (i = 0; i < numTiles; i++) {
            
            tile = newTiles[i];
            if (!tile) {

                tileId = newTileIds[i];
                
                // see if grid has a custom tile factory
                if (this.createTile) {
                    
                    tile = this.createTile(tileId);
    
                    // skip the tile if it couldn't be created
                    if (!tile) {
                        //console.log('Tile element could not be created, id: ' + tileId);
                        continue;
                    }

                } else {

                    tile = new Tiles.Tile(tileId);
                }
                
                // add tiles to queue (will be appended to DOM during redraw)
                this.tilesAdded.push(tile);
                //console.log('Adding tile: ' + tile.id);
            }

            this.tiles.push(tile);
        }
    };

    // helper to return unique items
    function uniques(items) {
        var results = [],
            numItems = items ? items.length : 0,
            i, item;

        for (i = 0; i < numItems; i++) {
            item = items[i];
            if ($.inArray(item, results) === -1) {
                results.push(item);
            }
        }

        return results;
    }

    // prepend new tiles
    Grid.prototype.insertTiles = function(newTileIds) {
        this.addTiles(newTileIds, true);
    };

    // append new tiles
    Grid.prototype.addTiles = function(newTileIds, prepend) {

        if (!newTileIds || newTileIds.length === 0) {
            return;
        }

        var prevTileIds = [],
            prevTileCount = this.tiles.length,
            i;

        // get the existing tile ids
        for (i = 0; i < prevTileCount; i++) {
            prevTileIds.push(this.tiles[i].id);
        }

        var tileIds = prepend ? newTileIds.concat(prevTileIds) 
            : prevTileIds.concat(newTileIds);
        this.updateTiles(tileIds);
    };

    Grid.prototype.removeTiles = function(removeTileIds) {

        if (!removeTileIds || removeTileIds.length === 0) {
            return;
        }

        var updateTileIds = [],
            i, len, id;

        // get the set of ids which have not been removed
        for (i = 0, len = this.tiles.length; i < len; i++) {
            id = this.tiles[i].id;
            if ($.inArray(id, removeTileIds) === -1) {
                updateTileIds.push(id);
            }
        }

        this.updateTiles(updateTileIds);
    };

    Grid.prototype.createTemplate = function(numCols, targetTiles) {
        
        // ensure that we have at least one column
        numCols = Math.max(1, numCols);

        var template = this.templateFactory.get(numCols, targetTiles);
        if (!template) {
            
            // fallback in case the default factory can't generate a good template
            template = Tiles.UniformTemplates.get(numCols, targetTiles);
        }
        
        return template;
    };

    // ensures we have a good template for the specified numbef of tiles
    Grid.prototype.ensureTemplate = function(numTiles) {

        // verfiy that the current template is still valid
        if (!this.template || this.template.numCols !== this.numCols) {
            this.template = this.createTemplate(this.numCols, numTiles);
            this.isDirty = true;
        } else {

            // append another template if we don't have enough rects
            var missingRects = numTiles - this.template.rects.length;
            if (missingRects > 0) {
                this.template.append(
                    this.createTemplate(this.numCols, missingRects));    
                this.isDirty = true;
            }

        }
    };

    // helper that returns true if a tile was in the viewport or will be given
    // the new pixel rect coordinates and dimensions
    function wasOrWillBeVisible(viewRect, tile, newRect) {

        var viewMaxY = viewRect.y + viewRect.height,
            viewMaxX = viewRect.x + viewRect.width;

        // note: y axis is the more common exclusion, so check that first

        // was the tile visible?
        if (tile) {
            if (!((tile.top > viewMaxY) || (tile.top + tile.height < viewRect.y) ||
                (tile.left > viewMaxX) || (tile.left + tile.width < viewRect.x))) {
                return true;
            }
        }
        
        if (newRect) {
            // will it be visible?
            if (!((newRect.y > viewMaxY) || (newRect.y + newRect.height < viewRect.y) ||
                (newRect.x > viewMaxX) || (newRect.x + newRect.width < viewRect.x))) {
                return true;
            }
        }
        
        return false;
    }

    Grid.prototype.shouldRedraw = function() {

        // see if we need to calculate the cell size
        if (this.cellWidth <= 0) {
            this.resize();
        }

        // verify that we have a template
        this.ensureTemplate(this.tiles.length);

        // only redraw when necessary
        var shouldRedraw = (this.isDirty ||
            this.tilesAdded.length > 0 ||
            this.tilesRemoved.length > 0);

        return shouldRedraw;
    };

    // converts cell rectangles to pixel rectangles. allows users
    // to override exact placement of the tiles.
    Grid.prototype.getPixelRectangle = function(cellRect) {

        var widthPlusPadding = this.cellWidth + this.cellPadding,
            heightPlusPadding = this.cellHeight + this.cellPadding;

        return new Tiles.Rectangle(                        
            cellRect.x * widthPlusPadding,
            cellRect.y * heightPlusPadding,
            (cellRect.width * widthPlusPadding) - this.cellPadding,
            (cellRect.height * heightPlusPadding) - this.cellPadding);
    };

    // redraws the grid after tile collection changes
    Grid.prototype.redraw = function(animate, onComplete) {

        // see if we should redraw
        if (!this.shouldRedraw()) {
            if (onComplete) {
                onComplete(false); // tell callback that we did not redraw
            }
            return;
        }        

        var numTiles = this.tiles.length,
            pageSize = this.priorityPageSize,
            duration = this.animationDuration,
            tileIndex = 0,
            appendDelay = 0,
            maxAppendDelay = 0,
            viewRect = new Tiles.Rectangle(
                this.$el.scrollLeft(),
                this.$el.scrollTop(),
                this.$el.width(),
                this.$el.height()),
            tile, added, pageRects, pageTiles, i, len, cellRect, pixelRect,
            animateTile, priorityRects, priorityTiles;

            
        // chunk tile layout by pages which are internally prioritized
        for (tileIndex = 0; tileIndex < numTiles; tileIndex += pageSize) {

            // get the next page of rects and tiles
            pageRects = this.template.rects.slice(tileIndex, tileIndex + pageSize);
            pageTiles = this.tiles.slice(tileIndex, tileIndex + pageSize);

            // create a copy that can be ordered
            priorityRects = pageRects.slice(0);
            priorityTiles = pageTiles.slice(0);

            // prioritize the page of rects and tiles
            if (this.prioritizePage) {
                this.prioritizePage(priorityRects, priorityTiles);
            }
                
            // place all the tiles for the current page
            for (i = 0, len = priorityTiles.length; i < len; i++) {
                tile = priorityTiles[i];
                added = $.inArray(tile, this.tilesAdded) >= 0;

                cellRect = priorityRects[i];
                pixelRect = this.getPixelRectangle(cellRect);

                tile.resize(
                    cellRect,
                    pixelRect,
                    animate && !added && wasOrWillBeVisible(viewRect, tile, pixelRect),
                    duration);

                if (added) {

                    // decide whether to animate (fadeIn) and get the duration
                    animateTile = animate && wasOrWillBeVisible(viewRect, null, pixelRect);
                    if (animateTile && this.getAppendDelay) {
                        appendDelay = this.getAppendDelay(
                            cellRect, pageRects, priorityRects, 
                            tile, pageTiles, priorityTiles);
                        maxAppendDelay = Math.max(maxAppendDelay, appendDelay) || 0;
                    } else {
                        appendDelay = 0;
                    }

                    tile.appendTo(this.$el, animateTile, appendDelay, duration);
                }
            }
        }

        // fade out all removed tiles
        for (i = 0, len = this.tilesRemoved.length; i < len; i++) {
            tile = this.tilesRemoved[i];
            animateTile = animate && wasOrWillBeVisible(viewRect, tile, null);
            tile.remove(animateTile, duration);
        }

        // clear pending queues for add / remove
        this.tilesRemoved = [];
        this.tilesAdded = [];
        this.isDirty = false;

        if (onComplete) {
            setTimeout(
                function() { onComplete(true); }, 
                Math.max(maxAppendDelay, duration) + 10
            );
        }
    };

})(jQuery);
