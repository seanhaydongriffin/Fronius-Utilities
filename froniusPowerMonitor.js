const ipAddress = "192.168.0.109";

let html = `
<!DOCTYPE html>
<html>
<head>
<style>
html, body {
    overscroll-behavior-y: none;
}
.tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}
.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
  font-size: 17px;
}
.tab button:hover {
  background-color: #ddd;
}
.tab button.active {
  background-color: #ccc;
}
.tabcontent {
  display: none;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-top: none;
}
table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
}
td {
    white-space: nowrap;
}
.table-cell {
    position: relative;
    height: 100px;
}
.floating-text {
    position: absolute;
    top: 15%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    font-size: 20px;
}
.centered {
	width: 300;
    margin: auto;
    display: block;
	text-align: center;
}
.alert {
    padding: 20px;
    background-color: #f44336;
    color: white;
}
.alert.success {background-color: #04AA6D;}
.alert.info {background-color: #2196F3;}
.alert.warning {background-color: #ff9800;}
</style>
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.1.0/chart.js"></script>


<div class="tab">
  <button class="tablinks" onclick="openCity(event, 'London')" id="defaultOpen">Realtime Charts</button>
  <button class="tablinks" onclick="openCity(event, 'Paris')">Configuration</button>
  <button class="tablinks" onclick="openCity(event, 'Tokyo')">Events</button>
</div>


<div id="London" class="tabcontent">
    <div style="height: 300px; width: 100%;"><canvas id="inverterChart"></canvas></div>
    <table style="height: 300px; width: 100%;">
        <tr>
        <td class="table-cell"><div class="floating-text">From Solar (Watts)</div><canvas class="centered" id="fromSolarGauge" width="300" height="300"></canvas></td>
        <td class="table-cell"><div class="floating-text">From Grid (Watts)</div><canvas class="centered" id="fromGridGauge" width="300" height="300"></canvas></td>
        </tr>
    </table>

    <div class="alert warning" id="requestFailedAlert" style="display: none;">
        <strong>Warning!</strong> Cannot locate the inverter, check the IP Address in the Configuration tab.
    </div>
  

</div>

<div id="Paris" class="tabcontent">
    Inverter IP Address: <input type="text" id="inverterAddress" value="${ipAddress}"><span class="material-icons" id="inverterStatus"></span>

    <div class="alert warning" id="ipAddressFailedAlert" style="display: none;">
        <strong>Warning!</strong> Cannot reach the inverter, IP address may be incorrect, enter the correct address above.
    </div>
</div>

<div id="Tokyo" class="tabcontent">
  <h3>Tokyo</h3>
  <p>Tokyo is the capital of Japan.</p>
</div>

<script>
function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();
</script>
   


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
    backgroundColor: 'Orange',
    borderColor: 'Orange',
    fill: false,
    order: 1,
    pointRadius: 0,
    pointHoverRadius: 0
  },{
    label: 'Consumed from solar',
    backgroundColor: '#66cc00',
    borderColor: '#66cc00',
    fill: true,
    order: 2,
	stack: 'Stack 1',
    pointRadius: 0,
    pointHoverRadius: 0
  },{
    label: 'Consumed from grid',
    backgroundColor: '#ff0000',
    borderColor: '#ff0000',
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
            x: {
                ticks: { 
                    autoSkip: false,
                    maxRotation: 15,
                    minRotation: 15,
                },
                grid: {
                    drawTicks: true,
                    tickLength: 10,
                    tickWidth: 2,
                    tickColor: 'Black'
                },
                afterBuildTicks: function(scale) {
                    scale.ticks = scale.ticks.filter(function(value, index) {
                        return (index % 15 === 0);
                    });
                }                
            },
            y: {
                beginAtZero: true,
                position: 'right',
                title: { display: true, text: 'Watts' },
                gridLines: { drawOnChartArea: true },
                grid: { z: 1 },
                ticks: { stepSize: 100 }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Power Over Time'
            }
        }
    }
};

const inverterChart = new Chart(canvas, config);




function addData(chart, label, p_load_data, p_from_solar, p_grid_from_grid_data, p_grid_to_grid_data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(p_load_data);
    chart.data.datasets[1].data.push(p_from_solar);
    chart.data.datasets[2].data.push(p_grid_from_grid_data);
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

var fromGridCanvas;
var fromGridGauge;
var fromSolarCanvas;
var fromSolarGauge;

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

    var config1 = {
        type: 'gauge',
        data: {
            //labels: ['Success', 'Warning', 'Warning', 'Fail'],
            datasets: [{
                data: [300, 1000, 4000, 8000],
                value: 1,
                backgroundColor: ["#ff9999", "#ff0000", "#b81414", "#660000"],
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            layout: {
                padding: {
                    top: 0,
                    bottom: 0
                }
            },
            valueLabel: {
                backgroundColor: 'Black',
                formatter: Math.round,
                offsetY: '30%',
                font: {
                    size: 24
                }
            }
        }
    };

    var config2 = {
        type: 'gauge',
        data: {
            //labels: ['Success', 'Warning', 'Warning', 'Fail'],
            datasets: [{
                data: [300, 1000, 4000, 8000],
                value: 1,
                backgroundColor: ["#99ff33", "#66cc00", "#4d9900", "#336600"],
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            layout: {
                padding: {
                    top: 0,
                    bottom: 0
                }
            },
            valueLabel: {
                backgroundColor: 'Black',
                formatter: Math.round,
                offsetY: '30%',
                font: {
                    size: 24
                }
            }
        }
    };


  
    fromSolarCanvas = document.getElementById('fromSolarGauge').getContext('2d');
    fromSolarGauge = new Chart(fromSolarCanvas, config2);

    fromGridCanvas = document.getElementById('fromGridGauge').getContext('2d');
    fromGridGauge = new Chart(fromGridCanvas, config1);





  
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
        await wv.evaluateJavaScript("document.getElementById('requestFailedAlert').style.display = 'none';", false);
        await wv.evaluateJavaScript("document.getElementById('ipAddressFailedAlert').style.display = 'none';", false);
        await wv.evaluateJavaScript("document.getElementById('inverterStatus').innerHTML = '&#xe2e6;';", false);

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

        await wv.evaluateJavaScript('addData(inverterChart, "' + newLabel + '", ' + p_load + ', ' + p_from_solar + ', ' + p_grid_from_grid + ', ' + p_grid_to_grid + ');', false);
        await wv.evaluateJavaScript('addGaugeData(fromGridGauge, ' + p_grid_from_grid + ');', false);
        await wv.evaluateJavaScript('addGaugeData(fromSolarGauge, ' + (p_from_solar+p_grid_to_grid) + ');', false);
    } catch (err)
    {
        await wv.evaluateJavaScript("document.getElementById('requestFailedAlert').style.display = 'block';", false);
        await wv.evaluateJavaScript("document.getElementById('ipAddressFailedAlert').style.display = 'block';", false);
        await wv.evaluateJavaScript("document.getElementById('inverterStatus').innerHTML = '&#xe000;';", false);
    }

});
