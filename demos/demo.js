// The grid manages tiles using ids, which you can define. For our
// examples we'll just use the tile number as the unique id.
var TILE_IDS = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
];

// SAMPLE #1
$(function() {

    // create the grid and an event which will update the grid
    // when either tile count or window size changes
    var el = document.getElementById('sample1-grid'),
        grid = new Tiles.Grid(el),
        updateGrid = function(event, ui) {

            // update the set of tiles and redraw the grid
            grid.updateTiles(TILE_IDS.slice(0, ui.value));
            grid.redraw(true /* animate tile movements */);

            // update the tile count label
            $('#tileCount').text('(' + ui.value + ')');
        };

    // use a jQuery slider to update the number of tiles
    $('#sample1-tiles')
        .slider({
            min: 1,
            max: 25,
            step: 1,
            create: updateGrid,
            slide: updateGrid,
            change: updateGrid
        })
        .slider('value', 8);

    // wait until user finishes resizing the browser
    var debouncedResize = debounce(function() {
        grid.resize();
        grid.redraw(true);
    }, 200);

    // when the window resizes, redraw the grid
    $(window).resize(debouncedResize);
});

// templates in JSON matching the predefined selections you can
// choose on the demo page
var DemoTemplateRows = [
    [
        " A A B B C C ",
        " A A B B C C ",
        " . . . . . . ",
        " D D E E F F "
    ], [
        " A A A A A A ",
        " B B C C D D ",
        " B B C C D D ",
        " B B C C D D "
    ], [
        " A A B B . ",
        " A A B B . ",
        " A A C C . ",
        " . . . . ."
    ], [
        " A A . . ",
        " A A . . ",
        " B B . . ",
        " C C . ."
    ], [
        " A A A B B B ",
        " A A A B B B ",
        " A A A C C . ",
        " . . . . . ."
    ]
];

// SAMPLE #2
$(function() {

    var el = document.getElementById('sample2-grid'),
        grid = new Tiles.Grid(el);

    // template is selected by user, not generated so just
    // return the number of columns in the current template
    grid.resizeColumns = function() {
        return this.template.numCols;
    };

    // by default, each tile is an empty div, we'll override creation
    // to add a tile number to each div
    grid.createTile = function(tileId) {
        var tile = new Tiles.Tile(tileId);
        tile.$el.append('<div class="dev-tile-number">' + tileId + '</div>');
        return tile;
    };

    // update the template selection
    var $templateButtons = $('#sample2-templates .dev-template').on('click', function(e) {

        // unselect all templates
        $templateButtons.removeClass("selected");
        
        // select the template we clicked on
        $(e.target).addClass("selected");
        
        // get the JSON rows for the selection
        var index = $(e.target).index(),
            rows = DemoTemplateRows[index];

        // set the new template and resize the grid
        grid.template = Tiles.Template.fromJSON(rows);  
        grid.isDirty = true;
        grid.resize();

        // adjust number of tiles to match selected template
        var ids = TILE_IDS.slice(0, grid.template.rects.length);
        grid.updateTiles(ids);
        grid.redraw(true);
    });

    // make the initial selection
    $('#sample2-t1').trigger('click');
    
    // wait until users finishes resizing the browser
    var debouncedResize = debounce(function() {
        grid.resize();
        grid.redraw(true);
    }, 200);

    // when the window resizes, redraw the grid
    $(window).resize(debouncedResize);
});

// SAMPLE #3
$(function() {

    // create a custom Tile which customizes the resize behavior
    function CustomTile(tileId, element) {
        // initialize base
        Tiles.Tile.call(this, tileId, element);
    }

    CustomTile.prototype = new Tiles.Tile();
    
    CustomTile.prototype.resize = function(cellRect, pixelRect, animate, duration, onComplete) {

        // set the text inside the tile to the dimensions
        var cellDimensions = cellRect.width + ' x ' + cellRect.height;
        this.$el.find('.dev-tile-size').text(cellDimensions);

        // call the base to perform the resize
        Tiles.Tile.prototype.resize.call(
            this, cellRect, pixelRect, animate, duration, onComplete);
    };


    var el = document.getElementById('sample3-grid'),
        grid = new Tiles.Grid(el);

    // template is selected by user, not generated so just
    // return the number of columns in the current template
    grid.resizeColumns = function() {
        return this.template.numCols;
    };

    // we'll override creation to use our custom tile
    grid.createTile = function(tileId) {
        var tile = new CustomTile(tileId);
        tile.$el.append('<div class="dev-tile-size"></div>');
        return tile;
    };

    // update the template selection
    var $templateButtons = $('#sample3-templates .dev-template').on('click', function(e) {

        // unselect all templates
        $templateButtons.removeClass("selected");
        
        // select the template we clicked on
        $(e.target).addClass("selected");
        
        // get the JSON rows for the selection
        var index = $(e.target).index(),
            rows = DemoTemplateRows[index];

        // set the new template and resize the grid
        grid.template = Tiles.Template.fromJSON(rows);  
        grid.isDirty = true;
        grid.resize();

        // adjust number of tiles to match selected template
        var ids = TILE_IDS.slice(0, grid.template.rects.length);
        grid.updateTiles(ids);
        grid.redraw(true);
    });

    // make the initial selection
    $('#sample3-t1').trigger('click');
    
    // wait until users finishes resizing the browser
    var debouncedResize = debounce(function() {
        grid.resize();
        grid.redraw(true);
    }, 200);

    // when the window resizes, redraw the grid
    $(window).resize(debouncedResize);
});
