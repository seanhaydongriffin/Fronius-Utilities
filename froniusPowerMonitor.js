let html = `
<!DOCTYPE html>
<html>
<head>
<style>
html, body {
    overscroll-behavior-y: none;
}
table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
}
td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
}
.centered {
	width: 300;
    margin: auto;
    display: block;
	text-align: center;
}
</style>
</head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.1.0/chart.js"></script>
<div><input type="text" id="inverterAddress" value="192.168.0.109"><span id="inverterStatus"></span>
<div style="height: 300px; width: 100%;"><canvas id="inverterChart"></canvas></div>
<table style="height: 300px; width: 100%;">
<tr>
    <td><canvas class="centered" id="consumptionGauge" width="400" height="300"></canvas></td>
    <td><canvas class="centered" id="productionGauge" width="400" height="300"></canvas></td>
</tr>
</table>
<script src="https://unpkg.com/chartjs-gauge-v3/dist/index.js"></script>
</body>
</html>`;

let script = `


const canvas = document.getElementById('inverterChart');
const labels = [];



Chart.defaults.font.size = 20;


const data = {
  labels: labels,
  datasets: [{
    label: 'Consumed in full',
    backgroundColor: 'Teal',
    borderColor: 'Teal',
    fill: false,
    order: 1,
    pointRadius: 0,
    pointHoverRadius: 0
  },{
    label: 'Consumed from grid',
    backgroundColor: 'Red',
    borderColor: 'Red',
    fill: true,
    order: 2,
	stack: 'Stack 1',
    pointRadius: 0,
    pointHoverRadius: 0
  },{
    label: 'Consumed from solar',
    backgroundColor: 'Yellow',
    borderColor: 'Yellow',
    fill: true,
    order: 3,
	stack: 'Stack 1',
    pointRadius: 0,
    pointHoverRadius: 0
  },{
    label: 'Sent to grid',
    backgroundColor: 'Grey',
    borderColor: 'Grey',
    fill: true,
    order: 4,
	stack: 'Stack 1',
    pointRadius: 0,
    pointHoverRadius: 0
  }]
};

const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0, easing: 'linear' },
        scales: {
            y: {
                beginAtZero: true,
                position: 'right',
                title: { display: true, text: 'Watts' },
                gridLines: { drawOnChartArea: true },
                grid: { z: 1 },
                ticks: { stepSize: 100 }
            }
        }
    }
};

const inverterChart = new Chart(canvas, config);





function addData(chart, label, p_load_data, p_grid_from_grid_data, p_from_solar, p_grid_to_grid_data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(p_load_data);
    chart.data.datasets[1].data.push(p_grid_from_grid_data);
    chart.data.datasets[2].data.push(p_from_solar);
    chart.data.datasets[3].data.push(p_grid_to_grid_data);

    if (chart.data.labels.length > 120)
    {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.datasets[2].data.shift();
        chart.data.datasets[3].data.shift();
    }

    chart.update();
}`;

let script2 = `

var consumptionCanvas;
var consumptionGauge;
var productionCanvas;
var productionGauge;

function addGaugeData(chart, newdata) {
    chart.data.datasets[0].value = newdata;
    chart.update();
}    

setTimeout(function() {

    const CHART_COLORS = {
        // red: 'rgb(255, 99, 132)',
        // orange: 'rgb(255, 159, 64)',
        // yellow: 'rgb(255, 205, 86)',
        // green: 'rgb(75, 192, 192)',
        // blue: 'rgb(54, 162, 235)',
        // purple: 'rgb(153, 102, 255)',
        // grey: 'rgb(201, 203, 207)',
        red: "#ff6384",
        orange: "#ff9f40",
        yellow: "#ffcd56",
        green: "#4bc0c0",
        blue: "#36a2eb",
        purple: "#9966ff",
        grey: "#c9cbcf",
        black: '#404244',
      };

    var config2 = {
        type: 'gauge',
        data: {
          //labels: ['Success', 'Warning', 'Warning', 'Fail'],
          datasets: [{
            data: [300, 1000, 4000, 8000],
            value: 1,
            backgroundColor: [CHART_COLORS.green, CHART_COLORS.yellow, CHART_COLORS.orange, CHART_COLORS.red],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          title: {
            display: true,
            text: 'Gauge chart'
          },
          layout: {
            padding: {
                top: 0,
                bottom: 0
            }
          },
          valueLabel: {
            formatter: Math.round,
          }
        }
      };
  




    consumptionCanvas = document.getElementById('consumptionGauge').getContext('2d');
    consumptionGauge = new Chart(consumptionCanvas, config2);

    productionCanvas = document.getElementById('productionGauge').getContext('2d');
    productionGauge = new Chart(productionCanvas, config2);




  
}, 1000);



`;




let wv = new WebView();
await wv.loadHTML(html);
await wv.evaluateJavaScript(script, false);
await wv.evaluateJavaScript(script2, false);
wv.present();

const timer = new Timer();
timer.repeats = true;
timer.timeInterval = 1000;
timer.schedule(async () => {

    var inverterAddress = await wv.evaluateJavaScript(`document.getElementById('inverterAddress').value;`, false);
    var request = new Request('http://' + inverterAddress + '/solar_api/v1/GetPowerFlowRealtimeData.fcgi');
    var result;

    try {
        result = await request.loadJSON();
        await wv.evaluateJavaScript("document.getElementById('inverterStatus').textContent = 'good';", false);

        var d = new Date();
        var newLabel = d.toLocaleTimeString();
    
        var p_load = Math.abs(result.Body.Data.Site.P_Load);            // Consumed in full
        var p_grid_from_grid = 0;                                       // Comsumed from grid
        var p_grid_to_grid = 0;                                         // Sent to grid
    
        if (result.Body.Data.Site.P_Grid < 0)
            p_grid_to_grid = Math.abs(result.Body.Data.Site.P_Grid);
        else
            p_grid_from_grid = Math.abs(result.Body.Data.Site.P_Grid);

        var p_from_solar = p_load - p_grid_from_grid;                   // Consumed from solar (not from the grid)

        await wv.evaluateJavaScript('addData(inverterChart, "' + newLabel + '", ' + p_load + ', ' + p_grid_from_grid + ', ' + p_from_solar + ', ' + p_grid_to_grid + ');', false);
        //await wv.evaluateJavaScript('addGaugeData(consumptionGauge, ' + p_grid_from_grid + ');', false);
        await wv.evaluateJavaScript('addGaugeData(consumptionGauge, ' + p_load + ');', false);
    } catch (err)
    {
        await wv.evaluateJavaScript("document.getElementById('inverterStatus').textContent = 'bad';", false);
    }

    /*
    let alert = new Alert();
    alert.title = "Debug";
    alert.message = result;
    alert.present();
*/
});
