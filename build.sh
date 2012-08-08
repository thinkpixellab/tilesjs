# turn off output
set +v

# vars
JS_OUTPUT=tiles.js
SUCCESS=0

echo "Concatenating JS files"

# Create or overwrite existing file with header
echo "/*! Tiles.js | http://thinkpixellab.com/tilesjs | $(date +%Y-%m-%d) */" > $JS_OUTPUT

# combine files
cat src/Tile.js >> $JS_OUTPUT
cat src/Template.js >> $JS_OUTPUT
cat src/UniformTemplates.js >> $JS_OUTPUT
cat src/Grid.js >> $JS_OUTPUT

echo "Done"
echo ""
exit $SUCCESS