
var i2s = Img2SVG();
var img = document.getElementById('image1');
i2s.convertImgSRCToSVG(img.src, function(str) {
    var svgel = document.getElementById('svg1');
    svgel.innerHTML = str;
});
