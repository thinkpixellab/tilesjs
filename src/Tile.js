
// single namespace export
var Tiles = {};

(function($) {

    var Tile = Tiles.Tile = function(tileId, element) {

        this.id = tileId;

        // position and dimensions of tile inside the parent panel
        this.top = 0;
        this.left = 0;
        this.width = 0;
        this.height = 0;

        // cache the tile container element
        this.$el = $(element || document.createElement('div'));
    };

    Tile.prototype.appendTo = function($parent, fadeIn, delay, duration) {
        this.$el
            .hide()
            .appendTo($parent);

        if (fadeIn) {
            this.$el.delay(delay).fadeIn(duration);
        }
        else {
            this.$el.show();
        }
    };

    Tile.prototype.remove = function(animate, duration) {
        if (animate) {
            this.$el.fadeOut({
                complete: function() {
                    $(this).remove();
                }
            });
        }
        else {
            this.$el.remove();
        }
    };

    // updates the tile layout with optional animation
    Tile.prototype.resize = function(cellRect, pixelRect, animate, duration, onComplete) {
       
        // store the list of needed changes
        var cssChanges = {},
            changed = false;

        // update position and dimensions
        if (this.left !== pixelRect.x) {
            cssChanges.left = pixelRect.x;
            this.left = pixelRect.x;
            changed = true;
        }
        if (this.top !== pixelRect.y) {
            cssChanges.top = pixelRect.y;
            this.top = pixelRect.y;
            changed = true;
        }
        if (this.width !== pixelRect.width) {
            cssChanges.width = pixelRect.width;
            this.width = pixelRect.width;
            changed = true;
        }
        if (this.height !== pixelRect.height) {
            cssChanges.height = pixelRect.height;
            this.height = pixelRect.height;
            changed = true;
        }

        // Sometimes animation fails to set the css top and left correctly
        // in webkit. We'll validate upon completion of the animation and
        // set the properties again if they don't match the expected values.
        var tile = this,
            validateChangesAndComplete = function() {
                var el = tile.$el[0];
                if (tile.left !== el.offsetLeft) {
                    //console.log ('mismatch left:' + tile.left + ' actual:' + el.offsetLeft + ' id:' + tile.id);
                    tile.$el.css('left', tile.left);
                }
                if (tile.top !== el.offsetTop) {
                    //console.log ('mismatch top:' + tile.top + ' actual:' + el.offsetTop + ' id:' + tile.id);
                    tile.$el.css('top', tile.top);
                }

                if (onComplete) {
                    onComplete();
                }
            };


        // make css changes with animation when requested
        if (animate && changed) {

            this.$el.animate(cssChanges, {
                duration: duration,
                easing: 'swing',
                complete: validateChangesAndComplete
            });
        }
        else {

            if (changed) {
                this.$el.css(cssChanges);
            }

            setTimeout(validateChangesAndComplete, duration);
        }
    };

})(jQuery);
