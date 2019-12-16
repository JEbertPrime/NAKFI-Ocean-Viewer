


var data, savedData = {
                name: [],
                data: [],
                params: []
            },
            views = {
                name: [],
                view: []
            },
            dataUnfiltered, data1 = {},
            depthData = {
                long: [],
                lat: [],
                depth: []
            },
            depthDataArray, speciesOneYear = 1861,
            speciesTwoYear = 1861,
            relayoutBool = false;
        var tempSlider = document.getElementById('tempSlider'),
            oxySlider = document.getElementById('oxySlider'),
            saltSlider = document.getElementById('saltSlider'),
            yearSlider = document.getElementById('yearSlider'),
            opacitySlider = document.getElementById('opacitySlider'),
            depthSlider = document.getElementById('depthSlider'),
            allSliderValues = [];
        var filterData = [],
            isOpen = false,
            isUpdate = false,
            excludedBool = false;
        var speciesOne, speciesTwo, overlap = {
                depth: [],
                lon: [],
                lat: [],
                year: []
            },
            speciesOneUrlPrevious, speciesTwoUrlPrevious, previousUrl, basinIdPrevious = 0;
        var checkboxSalt = document.getElementById('checkboxSalt'),
            checkboxTemp = document.getElementById('checkboxTemp'),
            checkboxOxy = document.getElementById('checkboxOxy');
        var saveList = document.getElementById("saveList"),
            speciesList1 = document.getElementById("speciesList1"),
            speciesList2 = document.getElementById("speciesList2"),
            viewsList = document.getElementById('viewsList'),
            camLayout, oxyUnitConversion = 1, maxOxyValue = 400, oxyStep = 5, oxyDecimals = 0;
        /*d3.csv("http://temp.justinebert.com/depths.csv", function(rows) {
            depthData.push(rows);
            });*/
        getBath();
        if (Cookies.get('savedData')) {
            savedData = JSON.parse(Cookies.get('savedData'))
        }
        if (Cookies.get('views')) {
            views = JSON.parse(Cookies.get('views'))
        }
        cloudSpeciesList()
        dataList(savedData, saveList)
        dataList(savedData, speciesList1)
        dataList(savedData, speciesList2)
        dataList(views, viewsList)


        noUiSlider.create(tempSlider, {
            start: [20, 25],
            connect: true,
            tooltips: [wNumb({
                decimals: 0
            }), wNumb({
                decimals: 0
            })],

            range: {
                'min': -5,
                'max': 35,
            },
            step: 1,
            pips: {
                mode: 'positions',
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
            start: [200, 220],
            connect: true,
            tooltips: [wNumb({
                decimals: oxyDecimals
            }), wNumb({
                decimals: oxyDecimals
            })],
            step: 1,
            range: {
                'min': 0,
                'max': 400,
            },
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 4
            },
            format: wNumb({
                decimals: oxyDecimals
            })
            
        });
        var oxySnapValues = [
            document.getElementById('oxy-slider-value-lower'),
            document.getElementById('oxy-slider-value-upper')
        ];
        var oxyMenu = document.getElementById("oxygen-menu");
        oxyMenu.addEventListener('change', (event)=>{
            console.log('click')
                oxySliderUnits()
            console.log(maxOxyValue,oxyStep,oxyDecimals)
            oxySlider.noUiSlider.destroy()
                noUiSlider.create(oxySlider, {
            start: [200, 220],
            connect: true,
            tooltips: [wNumb({
                decimals: oxyDecimals
            }), wNumb({
                decimals: oxyDecimals
            })],
            step: oxyStep,
            range: {
                'min': 0,
                'max': maxOxyValue,
            },
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 4,
                format: wNumb({
                    decimals: oxyDecimals
                })
            },
            
        });
            })
        //Salt Slider
        noUiSlider.create(saltSlider, {
            start: [33, 35],
            tooltips: [wNumb({
                decimals: 0
            }), wNumb({
                decimals: 0
            })],
            connect: true,
            range: {
                'min': 0,
                'max': 50,
            },
            step: 1,
            pips: {
                mode: 'positions',
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
            tooltips: wNumb({
                decimals: 0
            }),
            connect: true,
            step: 1,
            range: {
                'min': 1861,
                'max': 2100,
            },
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 4
            }
        });
        noUiSlider.create(opacitySlider, {
            start: [100],
            tooltips: wNumb({
                decimals: 0
            }),
            connect: true,
            step: 1,
            range: {
                'min': 0,
                'max': 100,
            },
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 4
            }
        });
        noUiSlider.create(depthSlider, {
            start: [0, 3000],
            connect: true,
            tooltips: [wNumb({
                decimals: 0
            }), wNumb({
                decimals: 0
            })],

            range: {
                'min': [0, 10],
                '30': [100, 25],
                '60%': [1000, 50],
                'max': 5000,
            },
            step: 10,
            pips: {
                mode: 'positions',
                values: [0, 30, 60, 100],
                density: 4
            }
        });
        var tempSnapValues = [
            document.getElementById('temp-slider-value-lower'),
            document.getElementById('temp-slider-value-upper')
        ];
        opacitySlider.noUiSlider.on('set', updateOpacity)
        function getBath() {
            d3.csv("bathymetry_60min.csv", function(d) {
                depthData.lat.push(parseFloat(d.lat))
                if (d.long >= 0) {
                    depthData.long.push(parseFloat(d.long))
                } //+ 180)
                if (d.long < 0) {
                    depthData.long.push(parseFloat(d.long) + 360)
                }
                depthData.depth.push(d.ocean_depth)

            })
            /*const Http = new XMLHttpRequest();
                  const url='https://cors-anywhere.herokuapp.com/http://temp.justinebert.com/depths.json'
                  Http.open("GET", url);
                  Http.send();
                  Http.onreadystatechange=(e)=>{
                      if(Http.readyState == 2 ){
                        document.getElementById('ready').innerHTML = 'Data status: downloading';  
                      }
                      if (Http.readyState == 4 && Http.status == 200){
                      document.getElementById('ready').innerHTML = 'Data status: ready';
                      console.log(url);
                      depthDataArray = JSON.parse(Http.responseText);
                      
                      for(i in depthDataArray){
                          depthData.long[i] = depthDataArray[i].long-180;
                          if(depthData.long[i]<-180){
                              depthData.long[i] = depthDataArray[i].long + 180;
                          }
                          depthData.lat[i] = depthDataArray[i].lat;
                          depthData.depth[i] = depthDataArray[i].depth;

                          
                      }*/
        }; //{{;
        async function buttonClick() {
            var basinMenu = document.getElementById("basin-menu");
            var basinValue = basinMenu.options[basinMenu.selectedIndex].value;
            console.log(basinValue);
            var tempValues = tempSlider.noUiSlider.get(),
                oxyValues = oxySlider.noUiSlider.get(),
                saltValues = saltSlider.noUiSlider.get(),
                selectYear = yearSlider.noUiSlider.get();
            oxyValues[0] = parseFloat(oxyValues[0])*oxyUnitConversion
            oxyValues[1] = parseFloat(oxyValues[1])*oxyUnitConversion
            console.log(oxyValues)
            if(!allSliderValues[1]){
                allSliderValues[1] = 0
            }
            
            allSliderValues[0] = {
                'temp': tempValues,
                'salt': saltValues,
                'oxy': oxyValues
            }
            if(!isEquivalent(allSliderValues[0],allSliderValues[1])){
                data = await downloadData(allSliderValues[0],selectYear)
                allSliderValues[1] = allSliderValues[0]
                buttonPlot()
                
            }
            else if(isEquivalent(allSliderValues[0],allSliderValues[1])){
                buttonPlot()
            }
        };




        


        function makePlotly(lat, long, depth, year) {
            var longDepth = depthData.long,
                latDepth = depthData.lat,
                oceanDepth = depthData.depth
            var basinMenu = document.getElementById("basin-menu");
            var basinValue = basinMenu.options[basinMenu.selectedIndex].value;
            console.log(relayoutBool)
            var basinId = basinMenu.options[basinMenu.selectedIndex].id, xSize, ySize

            var opacDepth = true,
                depthOpac = depth.map(function(x) {
                    return -x / 1000;
                });
            console.log(depthOpac);

            var opacityValue = (opacitySlider.noUiSlider.get()) / 100
            console.log(opacityValue, lat)
            switch (basinId) {
                case 'world':
                    var bound1 = 0,
                        bound2 = 359.5,
                        bound3 = -89,
                        bound4 = 89;
                    xSize = 4
                    ySize = 2
                    var newLong = long,
                        newLongDepth = depthData.long
                    break;
                case 'northPacific':
                    var bound1 = 90,
                        bound2 = 294,
                        bound3 = -10,
                        bound4 = 67;
                    xSize = 2.267
                    ySize = .865
                    var newLong = long,
                        newLongDepth = depthData.long
                    break;
                case 'southPacific':
                    var bound1 = 90,
                        bound2 = 294,
                        bound3 = -90,
                        bound4 = 10;
                    xSize = 2.267
                    ySize = 1.124
                    var newLong = long,
                        newLongDepth = depthData.long
                    break;
                case 'atlantic':
                    var bound1 = -100,
                        bound2 = 20,
                        bound3 = -80,
                        bound4 = 80;
                    xSize = 1.333
                    ySize = 1.8
                    var newLong = switchOcean(long)
                    var newLongDepth = switchOcean(longDepth)
                    break;
                case 'indian':
                    var bound1 = 20,
                        bound2 = 120,
                        bound3 = -80,
                        bound4 = 30
                    xSize = 1.111
                    ySize = 1.236
                    var newLong = long,
                        newLongDepth = depthData.long
                    break;
                case 'arctic':
                    var bound1 = 50,
                        bound2 = -50,
                        bound3 = 50,
                        bound4 = -50
                    xSize = 4
                    ySize = 4
                    var coords = toPolar(long, lat,'arctic'),
                        coordsDepth = toPolar(longDepth, latDepth,'arctic')
                    
                    
                    var newLong = coords[0]
                    lat = coords[1]
                    var newLongDepth = coordsDepth[0]
                    latDepth = coordsDepth[1]
                    break;
                case 'antarctic':
                    var bound1 = 40,
                        bound2 = -40,
                        bound3 = 40,
                        bound4 = -40
                    xSize = 4
                    ySize = 4
                    var coords = toPolar(long, lat,'antarctic'),
                        coordsDepth = toPolar(longDepth, latDepth,'antarctic')
                    
                    
                    var newLong = coords[0]
                    lat = coords[1]
                    var newLongDepth = coordsDepth[0]
                    latDepth = coordsDepth[1]
                    break;
            }
            var plotDiv = document.getElementById("plot");

            var layout = {
                autosize: true,
                font: {
                    family: 'Heebo',
                    size: 11,
                    color: '#4A4A4A'
                },
                scene: {
                    aspectmode: "manual",
                    aspectratio: {
                        x: xSize,
                        y: ySize,
                        z: 1,
                    },
                    xaxis: {
                        nticks: 9,
                        range: [bound1, bound2],
                        title: 'Longitude',
                    },
                    yaxis: {
                        nticks: 7,
                        range: [bound3, bound4],
                        title: 'Latitude',
                    },
                    zaxis: {
                        nticks: 3,
                        range: [-6000, 1],
                        title: 'Depth',
                    },
                    camera: {
                        eye: {
                            x: 0,
                            y: -3,
                            z: 4
                        }
                    }
                }
            };
            console.log(layout,"poop")
            var dataset = [{
                    type: 'scatter3d',
                    mode: 'markers',
                    x: newLong,
                    y: lat,
                    z: depth,
                    opacity: 1,
                    group: depthOpac,
                    marker: {
                        opacity: 1,
                        size: 3,
                        cmin: -1000,
                        cmax: 0,
                        colorscale: [
                            ['0.0', 'rgb(165,0,38)'],
                            ['0.555555555556', 'rgb(255,191,0)'],
                            ['1.0', 'rgb(35,136,35)']
                        ],
                        color: depth
                    },
                    hovertext: year

                },
                {
                    opacity: opacityValue,
                    type: 'mesh3d',
                    x: newLongDepth,
                    y: latDepth,
                    z: oceanDepth,
                    showscale: false,
                    cmin: -6000,
                    cmax: 100,
                    hoverinfo: "none",
                    color: oceanDepth,
                    intensity: oceanDepth,
                    colorscale: [
                        ['0', 'rgb(10,10,140)'],
                        ['.96', 'rgb(100,180,240)'],
                        ['.97', 'rgb(210,180,140)'],
                        ['1', 'rgb(210,180,140)']
                    ],
                }
            ];

            if (isUpdate && relayoutBool) {
                console.log("update layout", dataset, long)
                Plotly.update('myDiv', {
                    x: [newLong, newLongDepth],
                    y: [lat,latDepth],
                    z: [depth,oceanDepth],
                    opacity: [1,opacityValue],
                    group: [depthOpac,undefined],
                    
                    hovertext: year

                }, {
                    'scene.xaxis.range': [bound1, bound2],
                    'scene.yaxis.range': [bound3, bound4],
                    'scene.aspectratio.x': xSize,
                    'scene.aspectratio.y': ySize
                }, [0,1])
            }
            if (isUpdate && !relayoutBool) {
                console.log("update data", dataset, long)
                Plotly.update('myDiv', {
                    x: [newLong,newLongDepth],
                    y: [lat, undefined],
                    z: [depth,undefined],
                    opacity: [1,undefined],
                    group: [depthOpac,undefined],
                    marker: {
                        opacity: 1,
                        size: 3,
                        cmin: -1000,
                        cmax: 0,
                        colorscale: [
                            ['0.0', 'rgb(165,0,38)'],
                            ['0.555555555556', 'rgb(255,191,0)'],
                            ['1.0', 'rgb(35,136,35)']
                        ],
                        color: depth
                    },
                    hovertext: year

                },{}, [0,1])
            }
            if (!isUpdate) {
                Plotly.newPlot('myDiv', dataset, layout, {
                    responsive:true,
                    editable:true,
                    displayModeBar: false
                   
                });


            }
            isUpdate = true
            basinIdprevious = basinId
            relayoutBool = false
            document.body.style.cursor = "auto"
        };
        

        
        var rangeMap = new selectMap("rangeMap");
