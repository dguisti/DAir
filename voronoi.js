c = document.getElementById("weather_canvas");
ctx = c.getContext("2d");

function resizeCanvas() {
    c.width = innerWidth;
    c.height = innerHeight;
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getColor(aqi) {
    return [randint(0,255), randint(0,255), randint(0,255)]
    if (aqi < 50) {
        return [0, Math.floor((50 - aqi) / 50 * 255), 0];
    } else {
        return [Math.floor(aqi / 300 * 255), 0, 0];
    }
}

function Point(x, y, aqi, outer_aqi, weight) {
    this.x = x;
    this.y = y;
    this.aqi = aqi;
    color_rgb = getColor(aqi);
    this.c = '#' + paddingleft0(color_rgb[0].toString(16),2) + paddingleft0(color_rgb[1].toString(16),2) + paddingleft0(color_rgb[2].toString(16),2);
    this.outer_color = 'rgba(255, 255, 255, 0)';//getColor(outer_aqi);
    this.weight = weight;
}

function drawPoint(point) {
    ctx.beginPath();
    ctx.ellipse(point.x, point.y, point_radius, point_radius, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${point.color[0]}, ${point.color[1]}, ${point.color[2]})`;
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${point_radius / 2 * 3} px sans-serif`;
    ctx.fillText(point.aqi, point.x, point.y, point_radius);
}

function newDrawPoint(p) {
    //console.log(`x: ${p.x}, y: ${p.y}, aqi: ${p.aqi}, inner_color: ${p.inner_color}, outer_color: ${p.outer_color}, weight: ${p.weight}`)
    var radgrad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.weight);
    radgrad.addColorStop(0, `rgb(${point.inner_color[0]}, ${point.inner_color[1]}, ${point.inner_color[2]})`);
    radgrad.addColorStop(1, p.outer_color);
    ctx.fillStyle = radgrad;
    ctx.fillRect(0, 0, c.width, c.height);
}

// window.addEventListener("resize", resizeCanvas); This is an important feature for the future, but I'm not sure how to do it without clearing the canvas

/* Useful links:
https://stackoverflow.com/questions/22356012/multiple-points-colors-gradient-on-html5-canvas
https://codepen.io/tculda/pen/pogwpOw
*/

function putCross( ctx, p){
    for ([i,point] of p.entries()){
        ctx.beginPath()
        ctx.moveTo(point.x-5, point.y-5);
        ctx.lineTo(point.x+5, point.y+5);
        ctx.moveTo(point.x-5, point.y+5);
        ctx.lineTo(point.x+5, point.y-5);
        ctx.stroke();
        ctx.fillText(i,point.x+7,point.y+7);
    }
}

function getProjectionDistance(a, b, c){
    const k2 = b.x*b.x - b.x*a.x + b.y*b.y -b.y*a.y;
    const k1 = a.x*a.x - b.x*a.x + a.y*a.y -b.y*a.y;
    const ab2 = (a.x - b.x)*(a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    const kcom = (c.x*(a.x - b.x) + c.y*(a.y-b.y));
    const d1 = (k1 - kcom) / ab2;
    const d2 = (k2 + kcom) / ab2;
    return {d1, d2};
}

function limit01(value){
    if(value < 0){
        return 0;
    }
    if(value > 1){
        return 1;
    }
    return value;
}

function paddingleft0(v, v_length){
    while( v.length < v_length){
        v = '0' + v;
    }
    return v;
}

function getWeightedColorMix(points, ratios){
    let r = 0;
    let g = 0;
    let b = 0;
    for( [ind, point] of points.entries()){
        r += Math.round(parseInt(point.c.substring(1,3), 16) * ratios[ind]);
        g += Math.round(parseInt(point.c.substring(3,5), 16) * ratios[ind]);
        b += Math.round(parseInt(point.c.substring(5,7), 16) * ratios[ind]);
    }
        
    let result = '#' + paddingleft0(r.toString(16),2) + paddingleft0(g.toString(16),2) + paddingleft0(b.toString(16),2);

    return result;
}

/**
 * Given some points with color attached, calculate the color for a new point
 * @param  p The new point position {x: number, y: number}
 * @param  points The array of given colored points [{x: nember, y: number, c: hexColor}]
 * @return hex color string -- The weighted color mix
 */
function getGeometricColorMix( p, points ){
    let colorRatios = new Array(points.length);
    colorRatios.fill(1);
    for ( [ind1, point1] of points.entries()){
        for ( [ind2, point2] of points.entries()){
            if( ind1 != ind2){
                d  = getProjectionDistance(point1, point2, p);
                colorRatios[ind1] *= limit01(d.d2);
            }
        }

    }
      let totalRatiosSum = 0;
      colorRatios.forEach(c => totalRatiosSum += c);
      colorRatios.forEach((c,i) => colorRatios[i] /= totalRatiosSum);
    c = getWeightedColorMix(points, colorRatios);
    return c;
}


resizeCanvas();

var points = [];

var point_count = 62;
var point_radius = 20;

for (let i = 0; i < point_count; i++) {
    let p = new Point(randint(0, c.width), randint(0, c.height), randint(0, 300), 0, point_radius);
    points.push(p);
    //console.log(p);
}



putCross(ctx, points); // optional, only to show the original point position
ctx.globalCompositeOperation = 'destination-over'; // to show the cross points over the gradient
let xcs = points.map( p => p.x);
let ycs = points.map( p => p.y);
let xmin = 0; //Math.min(...xcs);
let xmax = c.width; //Math.max(...xcs);
let ymin = 0; //Math.min(...ycs);
let ymax = c.height; //Math.max(...ycs);
let x, y;
let mixColor;

// iterate all the pixels between the given points
for (x = xmin; x < xmax; x++ ) {
    for (y = ymin; y < ymax; y++) {
        mixColor = getGeometricColorMix({x:x, y:y}, points);
        ctx.fillStyle = mixColor;
        ctx.fillRect(x, y, 1, 1);
    }
}