var long_min = -97.5 , long_max = 20.5, lat_min = -.5 , lat_max = 60.5 ;
var data, depthData = [];  
var tempSlider = document.getElementById('tempSlider'), oxySlider = document.getElementById('oxySlider'), saltSlider = document.getElementById('saltSlider'), yearSlider = document.getElementById('yearSlider');
var filterData = [];
var checkboxSalt = document.getElementById('checkboxSalt'),
    checkboxTemp = document.getElementById('checkboxTemp'),
    checkboxOxy = document.getElementById('checkboxOxy');
/*d3.csv("https://cors-anywhere.herokuapp.com/http://temp.justinebert.com/depths.csv", function(rows) {
    depthData.push(rows);
    });*/

noUiSlider.create(tempSlider, {
    start: [0, 1],
    connect: true,
        tooltips: [wNumb({decimals: 0}),wNumb({decimals: 0})],

    range: {
        'min': -5,
        'max': 35,
    },
    step: 1,
	pips: {
		mode:'positions',
		values: [0, 25, 50, 75, 100],
		density: 4
	}
});
          var tempSnapValues = [
    document.getElementById('temp-slider-value-lower'),
    document.getElementById('temp-slider-value-upper')
];


//Oxygen Slider
noUiSlider.create(oxySlider, {
    start: [200, 250],
    connect: true,
        tooltips: [wNumb({decimals: 0}),wNumb({decimals: 0})],
    step:1,
    range: {
        'min': 0,
        'max': 400,
    },
	pips: {
		mode:'positions',
		values: [0, 25, 50, 75, 100],
		density: 4
	}	
});
          var oxySnapValues = [
    document.getElementById('oxy-slider-value-lower'),
    document.getElementById('oxy-slider-value-upper')
];


//Salt Slider
noUiSlider.create(saltSlider, {
    start: [25, 26],
    tooltips: [wNumb({decimals: 0}),wNumb({decimals: 0})],
    connect: true,
    range: {
        'min': 0,
        'max': 50,
    },
    step: 1,
	pips: {
		mode:'positions',
		values: [0, 25, 50, 75, 100],
		density: 4
	}
});
          var saltSnapValues = [
    document.getElementById('salt-slider-value-lower'),
    document.getElementById('salt-slider-value-upper')
];

/*saltSlider.noUiSlider.on('update', function (values, handle) {
    saltSnapValues[handle].innerHTML = 'Salinity: ' + values[handle] + '';
});*/
    noUiSlider.create(yearSlider, {
    start: [26],
    tooltips: wNumb({decimals: 0}),
    connect: true,
    step: 1,
    range: {
        'min': 1861,
        'max': 2100,
    },
	pips: {
		mode:'positions',
		values: [0, 25, 50, 75, 100],
		density: 4
	}
});
          function buttonClick() {
              var basinMenu = document.getElementById("basin-menu");
              var basinValue = basinMenu.options[basinMenu.selectedIndex].value;
              console.log(basinValue);
              document.getElementById('ready').innerHTML = 'Data status: '; 
              var tempValues = tempSlider.noUiSlider.get(), oxyValues = oxySlider.noUiSlider.get(), saltValues = saltSlider.noUiSlider.get(), selectYear = yearSlider.noUiSlider.get();
                var Http = new XMLHttpRequest();
                    var url='https://cors-anywhere.herokuapp.com/http://jetsam.ocean.washington.edu/NAKFI5?min_temp=' + tempValues[0] + '&max_temp=' + tempValues[1] + '&min_salt=' + saltValues[0] + '&max_salt=' + saltValues[1] + '&min_o2=' + oxyValues[0] + '&max_o2=' + oxyValues[1] + '&min_year=' + selectYear + '&max_year=' + selectYear + '&basin='+ basinValue;
                    Http.open("GET", url);
                    Http.send();
                    Http.onreadystatechange=(e)=>{
                        if(Http.readyState == 2 ){
                          document.getElementById('ready').innerHTML = 'Data status: downloading';  
                        }
                        if (Http.readyState == 4 && Http.status == 200){
                        document.getElementById('ready').innerHTML = 'Data status: ready';
                        console.log(url);
                        data = JSON.parse(Http.responseText);
                        
                        
                        console.log(data, depthData);
                        }
                    }
          };

          function makePlotly( lat, long, depth, year, longDepth, latDepth, oceanDepth){
              var basinMenu = document.getElementById("basin-menu");
              var basinValue = basinMenu.options[basinMenu.selectedIndex].value;
              
              if(basinValue=="0"){
                  var bound1 = -180, bound2 = 180, bound3 = -90, bound4 = 90;
              }
              if(basinValue=="1"){
                  var bound1 = -90, bound2 = 114, bound3 = -90, bound4 = 67;
              }
              var plotDiv = document.getElementById("plot");

                var layout = {
                    autosize:true,
                    height: 700,
              scene:{
                 aspectmode: "manual",
               aspectratio: {
                 x: 2, y: 2, z: 1,
                },
               xaxis: {
                nticks: 9,
                range: [bound1, bound2],
                title:'Longitude',
              },
               yaxis: {
                nticks: 7,
                range: [bound3, bound4],
                title: 'Latitude',
              },
               zaxis: {
               nticks: 10,
               range: [-1000, 1],
               title: 'Depth',
              },
                    camera:{
                        eye:{
                            x:0,
                            y:-3,
                            z:4
                        }
                    }
            }};
            var dataset = [/*{
                opacity:1,
                type: 'mesh3d',
                x:longDepth, y:latDepth, z:oceanDepth,
                showscale:false,
                cmin:-6000,
                cmax:100,
                color: ocean_depth,
                intensity:ocean_depth,
                colorscale: [
                    ['0', 'rgb(10,10,140)'],
                    ['.96', 'rgb(100,180,240)'],
                    ['.97', 'rgb(210,180,140)'],
                    ['1', 'rgb(210,180,140)']
                    ],
                hoverinfo: 'none',
                },*/
               {opacity:1,
                type: 'scatter3d',
                mode: 'markers',
                x: long, y: lat, z:depth,
                
                marker: {
                    size:5,
                    cmin: -1000 ,
                    cmax: -10,
                    colorscale: 'rdBu',
                    intensity: depth,
               },
                hovertext: year
                
               },
              ];
  Plotly.newPlot('myDiv', dataset, layout);
};
function timeForward(){
    
}
function toggle(element) {

    // If the checkbox is checked, disabled the slider.
    // Otherwise, re-enable it.
    if (this.checked) {
        element.setAttribute('disabled', true);
    } else {
        element.removeAttribute('disabled');
    }
}
function buttonPlot(){
    for(i in data.depth) {
    data.depth[i] = -(data.depth[i]);
    data.lon[i] = data.lon[i] - 180;
}
    makePlotly(data.lat, data.lon, data.depth, data.year);
        console.log(data)
          }