let html = `
<!DOCTYPE html>
<html>
<body>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<div>
    <canvas id="myChart"></canvas>
</div>
</body>
</html>
`;

let js2 = `

const canvas = document.getElementById('myChart');
canvas.height = 75;

const labels = [
  //'dju32'
];

const data = {
  labels: labels,
  datasets: [{
    label: 'Consumed from solar',
    backgroundColor: 'Green',
    borderColor: 'Green',
    fill: true,
    order: 1,
	stack: 'Stack 1'
  },{
    label: 'Consumed from grid',
    backgroundColor: 'Red',
    borderColor: 'Red',
    fill: true,
    order: 2,
	stack: 'Stack 1'
  },{
    label: 'Produced to grid',
    backgroundColor: 'LightGreen',
    borderColor: 'LightGreen',
    fill: true,
    order: 3,
	stack: 'Stack 1'
  },{
    label: 'Produced from grid',
    backgroundColor: 'Orange',
    borderColor: 'Orange',
    fill: true,
    order: 4,
	stack: 'Stack 1'
  }]
};

const config = {
  type: 'line',
  data: data,
  options: {
    animation: {
        duration: 0,
        easing: 'linear'
    },
    scales: {
        y: {
            title: {
                display: true,
                text: 'Watts'
            }
        }
    }
  }
};

const myChart = new Chart(
  canvas,
  config
);

// function to update the chart 
function addData(chart, label, p_load_consumer_data, p_load_generator_data, p_grid_to_grid_data, p_grid_from_grid_data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(p_load_consumer_data);
    chart.data.datasets[1].data.push(p_load_generator_data);
    chart.data.datasets[2].data.push(p_grid_to_grid_data);
    chart.data.datasets[3].data.push(p_grid_from_grid_data);

    if (chart.data.labels.length > 120)
    {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.datasets[2].data.shift();
        chart.data.datasets[3].data.shift();
    }

    chart.update();
}

`

let js3 = `

var d = new Date();
const newLabel = d.toLocaleTimeString();
var p_load_consumer_data = <p_load_consumer_data>;
var p_load_generator_data = <p_load_generator_data>;
var p_grid_to_grid = <p_grid_to_grid>;
var p_grid_from_grid = <p_grid_from_grid>;

//if (data.Body.Data.Site.P_Load < 0)
//    p_load_consumer_data = Math.abs(data.Body.Data.Site.P_Load);
//else
//    p_load_generator_data = Math.abs(data.Body.Data.Site.P_Load);

//if (data.Body.Data.Site.P_Grid < 0)
//    p_grid_to_grid = Math.abs(data.Body.Data.Site.P_Grid);
//else
//    p_grid_from_grid = Math.abs(data.Body.Data.Site.P_Grid);

addData(myChart, newLabel, p_load_consumer_data, p_load_generator_data, p_grid_to_grid, p_grid_from_grid);

`

let wv = new WebView();
await wv.loadHTML(html);
wv.evaluateJavaScript(js2, false) ;
wv.present();

const timer = new Timer();
timer.repeats = true;
timer.timeInterval = 1000;
timer.schedule(async () => {


  var request = new Request("http://192.168.0.109/solar_api/v1/GetPowerFlowRealtimeData.fcgi")
  var result = await request.loadJSON()
  //console.log(result)




  var d = new Date();
  var newLabel = d.toLocaleTimeString();

  var p_load_consumer_data = 0;
  var p_load_generator_data = 0;
  var p_grid_to_grid = 0;
  var p_grid_from_grid = 0;

  if (result.Body.Data.Site.P_Load < 0)
      p_load_consumer_data = Math.abs(result.Body.Data.Site.P_Load);
  else
      p_load_generator_data = Math.abs(result.Body.Data.Site.P_Load);

  if (result.Body.Data.Site.P_Grid < 0)
      p_grid_to_grid = Math.abs(result.Body.Data.Site.P_Grid);
  else
      p_grid_from_grid = Math.abs(result.Body.Data.Site.P_Grid);

  wv.evaluateJavaScript('addData(myChart, "'+newLabel+'", '+p_load_consumer_data+', '+p_load_generator_data+', '+p_grid_to_grid+', '+p_grid_from_grid+');', false) ;
});

