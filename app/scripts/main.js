function loadCanvas(canvasId, done) {
    var canvas = document.getElementById(canvasId);
    var imgSrc = canvas.dataset.src;

    // make ajax call to get image data url
    var request = new XMLHttpRequest();
    request.open('GET', imgSrc, true);
    request.onreadystatechange = function(data) {
        // Makes sure the document is ready to parse.
        if (request.readyState == 4) {
            // Makes sure it's found the file.
            if (request.status == 200) {
                // load image from data url
                var imageObj = new Image();
                imageObj.onload = function() {
                    done(canvas, imageObj);
                };

                imageObj.src = imgSrc;
            }
        }
    };
    request.send(null);
}


loadCanvas("canvas1", function(canvas, img) {
    var context = canvas.getContext('2d');
    var imageX = 0;
    var imageY = 0;
    var imageWidth = img.width;
    var imageHeight = img.height;
    context.drawImage(img, 0, 0, imageWidth, imageHeight);

    var imageData = context.getImageData(imageX, imageY, imageWidth, imageHeight);
    var data = imageData.data;

    var imgObj = {
        width: imageWidth,
        height: imageHeight,
        data: data,
        /**
         * return a pixel object with RGBA attributes
         * @param  {[type]} img [description]
         * @param  {[type]} x   [description]
         * @param  {[type]} y   [description]
         * @return {[type]}     [description]
         */
        getPixelAt: function getPixel(x, y) {
            var width = this.width;
            var data = this.data;
            return {
                r: data[((width * y) + x) * 4],
                g: data[((width * y) + x) * 4 + 1],
                b: data[((width * y) + x) * 4 + 2],
                a: data[((width * y) + x) * 4 + 3],
                rgb: function() {
                    return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
                }
            };
        }
    };

    var svg = generateSVG(imgObj);

    svgel = document.getElementById('svg1');

    svgel.innerHTML = svg;


});


/**
 * Check if two colors are within the color tolerance as determined by
 * threshold.
 *
 * @param array $colorA     Color array in form [ red: int, green: int, blue: int ]
 * @param array $colorB     Color array in form [ red: int, green: int, blue: int ]
 * @param float $threshold  Optional. Tolerance to check within.
 * @return bool             True if the colours are within the tolerance,
 *                          false if they are outside the tolerance
 */
function checkThreshold($colorA, $colorB, threshold) {
    threshold = threshold || 0;
    var distance = Math.sqrt(
        Math.pow($colorB.r - $colorA.r, 2) +
        Math.pow($colorB.g - $colorA.g, 2) +
        Math.pow($colorB.b - $colorA.b, 2)
    );

    if (distance <= threshold) {
        return true;
    }

    return false;
}

/**
 * Generates svg from raster
 *
 * @param GDImageIdentifier $img Raster image to convert to svg
 * @return string                  SVG xml
 */
function generateSVG(imgObj, threshold) {
    threshold = threshold || 0;
    var width = imgObj.width; // image width
    var height = imgObj.height; // image height
    var x, y, numberOfConsecutivePixels, nextColor, color, alpha, fill;
    var svgv = '';
    numberOfConsecutivePixels = 1;
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y += numberOfConsecutivePixels) {
            color = imgObj.getPixelAt(x, y);

            numberOfConsecutivePixels = 1;

            while (y + numberOfConsecutivePixels < height) {

                nextColor = imgObj.getPixelAt(x, y + numberOfConsecutivePixels);

                if (checkThreshold(color, nextColor, threshold)) {
                    numberOfConsecutivePixels++;
                } else {
                    break;
                }
            }

            if (color.a && color.a > 0) {
                fill = color.rgb();
                if (color.a && (color.a < 128)) {
                    alpha = (128 - color.a) / 128;
                    fill += ' fill-opacity="' + alpha + '"';
                }
                svgv += '<rect x="' + x + '" y="' + y + '" width="' + 1 + '" height="' + numberOfConsecutivePixels + '" fill="' + fill + '"/>\n';
            }

        }
    }


    var svgh = '';
    numberOfConsecutivePixels = 1;
    for (y = 0; x < height; x++) {
        for (x = 0; x < width; x += numberOfConsecutivePixels) {
            color = imgObj.getPixelAt(x, y);

            numberOfConsecutivePixels = 1;

            while (x + numberOfConsecutivePixels < width) {

                nextColor = imgObj.getPixelAt(x + numberOfConsecutivePixels, y);

                if (checkThreshold(color, nextColor, threshold)) {
                    numberOfConsecutivePixels++;
                } else {
                    break;
                }
            }
            if (color.a && color.a > 0) {
                fill = color.rgb();
                if (color.a && (color.a < 128)) {
                    alpha = (128 - color.a) / 128;
                    fill += ' fill-opacity="' + alpha + '"';
                }
                svgh += '<rect x="' + x + '" y="' + y + '" width="' + numberOfConsecutivePixels + '" height="' + 1 + '" fill="' + fill + '"/>\n';
            }
        }
    }


    // return svgh.length > svgv.length ? svgv : svgh;
    return svgv;
}
