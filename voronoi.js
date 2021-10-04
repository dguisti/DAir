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

function Point(x, y, aqi) {
    this.x = x;
    this.y = y;
    this.aqi = aqi;
    this.color = getColor(aqi);
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

// window.addEventListener("resize", resizeCanvas); This is an important feature for the future, but I'm not sure how to do it without clearing the canvas

resizeCanvas();

var points = [];

var point_count = 50;
var point_radius = 20;

for (let i = 0; i < point_count; i++) {
    let p = new Point(randint(0, c.width), randint(0, c.height), randint(0, 300));
    points.push(p);
}

for (point of points) {
    drawPoint(point);
}