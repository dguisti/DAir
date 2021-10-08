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
    if (aqi < 50) {
        return [0, (50 - aqi) / 50 * 255, 0];
    }
    else {
        return [aqi / 300 * 255, 0, 0];
    }
}

function Point(x, y, aqi, outer_aqi, weight) {
    this.x = x;
    this.y = y;
    this.aqi = aqi;
    this.inner_color = getColor(aqi);
    this.outer_color = 'rgba(255, 255, 255, 0)'//getColor(outer_aqi);
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
    console.log(`x: ${p.x}, y: ${p.y}, aqi: ${p.aqi}, inner_color: ${p.inner_color}, outer_color: ${p.outer_color}, width: ${p.weight}`)
    var radgrad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.weight);
    radgrad.addColorStop(0, `rgb(${point.inner_color[0]}, ${point.inner_color[1]}, ${point.inner_color[2]})`);
    radgrad.addColorStop(1, p.outer_color);
    ctx.fillStyle = radgrad;
    ctx.fillRect(0, 0, c.width, c.height);
}

// window.addEventListener("resize", resizeCanvas); This is an important feature for the future, but I'm not sure how to do it without clearing the canvas

resizeCanvas();

var points = [];

var point_count = 50;
var point_radius = 20;

for (let i = 0; i < point_count; i++) {
    let p = new Point(randint(0, c.width), randint(0, c.height), randint(0, 300), 0, 1);
    points.push(p);
}

for (point of points) {
    newDrawPoint(point);
}