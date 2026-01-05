window.onload = function () {
    const canvas = document.getElementById("chartCanvas");
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    const valueStep = 20;
    const points = Math.floor(width / valueStep);

    let data1 = [], data2 = [], data3 = [];

    let running = true;
    let interval = 1000;
    let timer;

    const tooltip = document.getElementById("tooltip");

    // get all DOM element references at the start
    const toggle = document.getElementById("toggle");
    const speed = document.getElementById("speed");
    const reset = document.getElementById("reset");
    const exportBtn = document.getElementById("export");
    const theme = document.getElementById("theme");
    const grid = document.getElementById("grid");
    const smoothChk = document.getElementById("smooth");
    const chartType = document.getElementById("chartType");
    const minVal = document.getElementById("minVal");
    const maxVal = document.getElementById("maxVal");

    function rand() {
        const min = +minVal.value;
        const max = +maxVal.value;
        return Math.random() * (max - min) + min;
    }

    function init(data) {
        data.length = 0;
        for (let i = 0; i < points; i++) data.push(rand());
    }

    // applies a moving average filter with a window of 5 points (±2 neighbors)
    // this reduces noise and makes the chart smoother by averaging nearby values
    function smooth(data) {
        let out = [];
        for (let i = 0; i < data.length; i++) {
            let sum = 0, c = 0;
            // iterate through neighboring points within range
            for (let j = i - 2; j <= i + 2; j++) {
                if (j >= 0 && j < data.length) {
                    sum += data[j];
                    c++;
                }
            }
            out.push(sum / c);
        }
        return out;
    }

    function drawGrid() {
        ctx.strokeStyle = "gray";
        for (let x = 0; x < width; x += 150) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += 100) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // draws a continuous line by creating a path through all data points
    // canvas y-axis goes down, so we subtract from height to flip it
    function drawLine(data, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, height - data[0]);
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(i * valueStep, height - data[i]);
        }
        ctx.stroke();
    }

    function drawBar(data, color) {
        ctx.fillStyle = color;
        for (let i = 0; i < data.length; i++) {
            ctx.fillRect(i * valueStep, height - data[i], valueStep - 2, data[i]);
        }
    }

    function drawScatter(data, color) {
        ctx.fillStyle = color;
        for (let i = 0; i < data.length; i++) {
            ctx.beginPath();
            ctx.arc(i * valueStep, height - data[i], 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // fills the area under the curve by creating a closed path from baseline to data points
    // uses globalAlpha for transparency to allow overlapping areas to be visible
    function drawArea(data, color) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3; // 30% opacity for semi-transparent fill
        ctx.beginPath();
        ctx.moveTo(0, height); // start at bottom-left
        for (let i = 0; i < data.length; i++) {
            ctx.lineTo(i * valueStep, height - data[i]);
        }
        ctx.lineTo(width, height); // close path at bottom-right
        ctx.fill();
        ctx.globalAlpha = 1; // reset to full opacity
    }

    function updateStats(data) {
        const cur = data[data.length - 1];
        // spread operator (...) unpacks array elements as individual arguments
        const min = Math.min(...data);
        const max = Math.max(...data);
        // reduce iterates through array, accumulating sum starting from 0
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const prev = data[data.length - 2];
        document.getElementById("cur").textContent = cur.toFixed(1);
        document.getElementById("min").textContent = min.toFixed(1);
        document.getElementById("max").textContent = max.toFixed(1);
        document.getElementById("avg").textContent = avg.toFixed(1);
        // nested ternary: compares current value with previous to show trend direction
        document.getElementById("trend").textContent =
            cur > prev ? "↑" : cur < prev ? "↓" : "→";
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        if (grid.checked) drawGrid();

        // conditionally apply smoothing filter based on checkbox state
        let d1 = smoothChk.checked ? smooth(data1) : data1;
        let d2 = smoothChk.checked ? smooth(data2) : data2;
        let d3 = smoothChk.checked ? smooth(data3) : data3;

        if (chartType.value === "line") {
            drawLine(d1, "green");
            drawLine(d2, "red");
            drawLine(d3, "blue");
        } else if (chartType.value === "bar") {
            drawBar(d1, "green");
            drawBar(d2, "red");
            drawBar(d3, "blue");
        } else if (chartType.value === "area") {
            drawArea(d1, "green");
            drawArea(d2, "red");
            drawArea(d3, "blue");
        } else {
            drawScatter(d1, "green");
            drawScatter(d2, "red");
            drawScatter(d3, "blue");
        }

        updateStats(d1);
    }

    // push adds to end, shift removes from start - creates a sliding window effect
    // maintaining constant array length while data scrolls left
    function tick() {
        data1.push(rand()); data1.shift();
        data2.push(rand()); data2.shift();
        data3.push(rand()); data3.shift();
        draw();
    }

    function start() {
        clearInterval(timer); // prevent multiple timers from running simultaneously
        // short-circuit evaluation: tick() only executes if running is true
        timer = setInterval(() => running && tick(), interval);
    }

    //controls
    toggle.onclick = () => running = !running;
    speed.oninput = () => { interval = speed.value; start(); };
    reset.onclick = () => { init(data1); init(data2); init(data3); draw(); };
    exportBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = canvas.toDataURL();
        a.download = "chart.png";
        a.click();
    };

    theme.onchange = () => {
        document.body.className = theme.value === "light" ? "" : theme.value;
    };

    // Tooltip
    canvas.onmousemove = e => {
        // getBoundingClientRect() returns canvas position relative to viewport
        // necessary to convert mouse coordinates to canvas coordinates
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const i = Math.round(x / valueStep); // map x position to data point index
        if (i >= 0 && i < data1.length) {
            tooltip.style.display = "block";
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY + 10 + "px";
            tooltip.textContent = data1[i].toFixed(1);
        }
    };
    canvas.onmouseleave = () => tooltip.style.display = "none";

    init(data1); init(data2); init(data3);
    draw();
    start();
};
