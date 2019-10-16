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
            camLayout;
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
        dataList(savedData, saveList)
        dataList(savedData, speciesList1)
        dataList(savedData, speciesList2)
        dataList(views, viewsList)
        //utility functions
        function isEquivalent(a, b) {
            // Create arrays of property names
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);

            // If number of properties is different,
            // objects are not equivalent
            if (aProps.length != bProps.length) {
                return false;
            }

            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];

                // If values of same property are not equal,
                // objects are not equivalent
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }

            // If we made it this far, objects
            // are considered equivalent
            return true;
        }
        async function downloadData(parameters, year){
            
            var url = 'https://cors-anywhere.herokuapp.com/http://jetsam.ocean.washington.edu/NAKFI5?min_temp=' + parameters.temp[0] + '&max_temp=' + parameters.temp[1] + '&min_salt=' + parameters.salt[0] + '&max_salt=' + parameters.salt[1] + '&min_o2=' + parameters.oxy[0] + '&max_o2=' + parameters.oxy[1] + '&min_year=' + year + '&max_year=' + year;
            var downloadedData =  await d3.json(url).then(function(d){
                let data = d
                data.depth = data.depth.map(x => -x)
                if(data.depth.length > 250000){
                            if(!confirm("CAUTION: This dataset contains " + data.depth.length + " points. Datasets with this many points can cause your browser to crash. Proceed?")){
                                document.body.style.cursor = "auto"
                                return;
                            }
                        }
                return data
            })
            
            return downloadedData
        }
        function setLayoutBool() {

            relayoutBool = true;
            console.log(relayoutBool)
        }
        function updateOpacity(){
            if(isUpdate){
            var opacityValue = (opacitySlider.noUiSlider.get()) / 100;
            Plotly.restyle(myDiv, {opacity:opacityValue}, 1)
            }
        }
        function saveView(){
            let name = prompt("Enter a name for your camera view")
            let camLayout = myDiv.layout.scene.camera
            if(camLayout.up){
                camLayoutUpdate = {
                                    'scene.camera.up.x': camLayout.up.x,
                                    'scene.camera.up.y': camLayout.up.y,
                                    'scene.camera.up.z': camLayout.up.z,
                                    'scene.camera.eye.x': camLayout.eye.x,
                                    'scene.camera.eye.y': camLayout.eye.y,
                                    'scene.camera.eye.z': camLayout.eye.z,
                                    'scene.camera.center.x': camLayout.center.x,
                                    'scene.camera.center.y': camLayout.center.y,
                                    'scene.camera.center.z': camLayout.center.z
                                }
            }
            if(!camLayout.up){
                camLayoutUpdate = {
                                    'scene.camera.up.x': 0,
                                    'scene.camera.up.y': 0,
                                    'scene.camera.up.z': 1,
                                    'scene.camera.eye.x': camLayout.eye.x,
                                    'scene.camera.eye.y': camLayout.eye.y,
                                    'scene.camera.eye.z': camLayout.eye.z,
                                    'scene.camera.center.x': 0,
                                    'scene.camera.center.y': 0,
                                    'scene.camera.center.z': 0
                                }
            }
            
            views.view.push(camLayoutUpdate)
            views.name.push(name)
            var el = document.createElement("option");
            el.textContent = name;
            el.value = views.name.length - 1;
            viewsList.add(el)
            Cookies.set('views', views)
        }
        function w3_open(id) {
            var i = 0;
            if (!isOpen && i == 0) {
                document.getElementById(id).className = "viewer-menu show";
                isOpen = true;
                i++;
            }
            if (isOpen && i == 0) {
                document.getElementById(id).className = 'viewer-menu';
                isOpen = false;
                i++;
            }
        }
        function switchOcean(long){
            for(i in long){
                if(long[i] <= 180){
                    long[i] = long[i]
                }
                else if (long[i] > 180){
                    long[i] = long[i] - 360
                }
            }
            console.log(long)
            return long
        }

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
                decimals: 0
            }), wNumb({
                decimals: 0
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
            }
        });
        var oxySnapValues = [
            document.getElementById('oxy-slider-value-lower'),
            document.getElementById('oxy-slider-value-upper')
        ];


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
            d3.csv("https://cors-anywhere.herokuapp.com/http://temp.justinebert.com/bathymetry_60min.csv", function(d) {
                depthData.lat.push(d.lat)
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
        function relayoutPlot() {
            var longDepth = depthData.long,
                latDepth = depthData.lat,
                oceanDepth = depthData.depth,
                switchOceanBool = false
            var basinMenu = document.getElementById("basin-menu");
            var basinValue = basinMenu.options[basinMenu.selectedIndex].value;
            var basinId = basinMenu.options[basinMenu.selectedIndex].id;
            var opacDepth = true,
                depthOpac = depth.map(function(x) {
                    return -x / 1000;
                });
            console.log(depthOpac);


            var opacityValue = (opacitySlider.noUiSlider.get()) / 100;
            console.log(opacityValue, lat);

            if (basinValue == "0") {
                var bound1 = 0,
                    bound2 = 359.5,
                    bound3 = -89,
                    bound4 = 89;
                xSize = 4
            }
            if (basinId == "northPacific") {
                var bound1 = 90,
                    bound2 = 294,
                    bound3 = -10,
                    bound4 = 67;
                xSize = 2
            }
            if (basinId == "southPacific") {
                var bound1 = 90,
                    bound2 = 294,
                    bound3 = -90,
                    bound4 = 10;
                xSize = 2
            }
            if (basinId == 'Atlantic') {
                var bound1 = -100,
                    bound2 = 20,
                    bound3 = -80,
                    bound4 = 80;
                xSize = 2
                switchOceanBool = true
            }
            var plotDiv = document.getElementById("plot");

            var layout = {
                autosize: true,
                margin:{
                    l:0,
                    r:0,
                    b:0,
                    t:0,
                    pad:0
                },
                scene: {
                    aspectmode: "manual",
                    aspectratio: {
                        x: xSize,
                        y: 2,
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

        }

        async function buttonClick() {
            var basinMenu = document.getElementById("basin-menu");
            var basinValue = basinMenu.options[basinMenu.selectedIndex].value;
            console.log(basinValue);
            document.getElementById('ready').innerHTML = 'Data status: ';
            var tempValues = tempSlider.noUiSlider.get(),
                oxyValues = oxySlider.noUiSlider.get(),
                saltValues = saltSlider.noUiSlider.get(),
                selectYear = yearSlider.noUiSlider.get();
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

        async function setSpeciesOne() {
            var saveSelect = speciesList1.options[speciesList1.selectedIndex].value, speciesOneParams = [];
            
            speciesOneYear = document.getElementById("speciesOneYear").value
            if(!speciesOneParams[1]){
                speciesOneParams[1] = 0
            }
            speciesOneParams[0] = JSON.parse(JSON.stringify(savedData.params[saveSelect]));
            
            if(!isEquivalent(speciesOneParams[0],speciesOneParams[1])){
                speciesOne = await downloadData(speciesOneParams[0], speciesOneYear)
                speciesOneParams[1] = speciesOneParams[0]
                setSpeciesTwo()
            }
            else if (isEquivalent(speciesOneParams[0],speciesOneParams[1])){
                console.log('it worked')
                setSpeciesTwo()
            }
        }
        async function setSpeciesTwo() {
            speciesTwoYear = document.getElementById("speciesTwoYear").value
            var saveSelect = speciesList2.options[speciesList2.selectedIndex].value, speciesTwoParams = [];
            speciesTwoYear = document.getElementById("speciesTwoYear").value
            if(!speciesTwoParams[1]){
                speciesTwoParams[1] = 0
            }
            speciesTwoParams[0] = JSON.parse(JSON.stringify(savedData.params[saveSelect]));
            
            if(!isEquivalent(speciesTwoParams[0],speciesTwoParams[1])){
                speciesTwo = await downloadData(speciesTwoParams[0],speciesTwoYear)
                speciesTwoParams[1] = speciesTwoParams[0]
                compareSpecies(speciesOne, speciesTwo)
            }
            else if (isEquivalent(speciesTwoParams[0],speciesTwoParams[1])){
                console.log('it worked')
                compareSpecies(speciesOne, speciesTwo)
            }
        }
        function toJson(arrayJson){
            var json = {
                lon : [],
                lat : [],
                depth : []
            }
            for(i in arrayJson){
                json.lon.push(arrayJson[i][0])
                json.lat.push(arrayJson[i][1])
                json.depth.push(arrayJson[i][2])
            }
            return json
        }
        function toArray(json){
            console.log(json)    
            var array1 = [];
                for(i in json.lon){
                    array1[i] = [json.lon[i]];
                    array1[i][1] = json.lat[i];
                    array1[i][2] = json.depth[i];
                }
                console.log(array1)
                return array1
        }
        function compareSpecies(json1, json2) {
            if (json1.depth.length >= json2.depth.length) {
                array1 = toArray(json1)
                array2 = toArray(json2)
            } else if (json2.depth.length > json1.depth.length) {
                array1 = toArray(json2)
                array2 = toArray(json1)
            }
            array1String = arrayToString(array1)
            array2String = arrayToString(array2)
            lookup1 = {}
            lookup2 = {}
            //overlap = compareDatasets(array1, array2)
            overlap = []
            excluded1 = []
            excluded2 = []
            for (j in array2String) {
                lookup1[array2String[j]] = array2String[j]
            }
            for (i in array1String) {
                if (typeof lookup1[array1String[i]] != 'undefined') {
                    overlap.push(array1String[i])
                } else {
                    excluded1.push(array1String[i])
                }
            }
            for (j in array1String) {
                lookup2[array1String[j]] = array1String[j]
            }
            for (i in array2String) {

                if (typeof lookup2[array2String[i]] == 'undefined') {
                    excluded2.push(array2String[i])
                }
            }

            overlap = stringsToJson(overlap)
            excluded1 = stringsToJson(excluded1)
            excluded2 = stringsToJson(excluded2)
            var excluded = {
                lon: excluded1.lon.concat(excluded2.lon),
                lat: excluded1.lat.concat(excluded2.lat),
                depth: excluded1.depth.concat(excluded2.depth)
            }
            console.log(overlap, excluded1)
            let overlapSelectList = document.getElementById("overlapSelect")
            let plotType = overlapSelectList.selectedIndex

            if (plotType == 0) {
                makePlotly(overlap.lat, overlap.lon, overlap.depth)
            }
            if (plotType == 3) {
                makePlotly(excluded.lat, excluded.lon, excluded.depth)
            }
            if (plotType == 1) {
                makePlotly(excluded1.lat, excluded1.lon, excluded1.depth)
            }
            if (plotType == 2) {
                makePlotly(excluded2.lat, excluded2.lon, excluded2.depth)
            }
        }

        function arrayToString(intArray) {
            let stringArray = []
            for (i in intArray) {
                stringArray[i] = intArray[i].toString()
            }
            return stringArray
        }

        function stringsToJson(stringArray) {
            let json1 = {
                lon: [],
                lat: [],
                depth: []
            }
            for (i in stringArray) {
                let element = JSON.parse("[" + stringArray[i] + "]")
                json1.lon.push(element[0])
                json1.lat.push(element[1])
                json1.depth.push(element[2])
            }
            return json1
        }
        


        function makePlotly(lat, long, depth, year) {
            var longDepth = depthData.long,
                latDepth = depthData.lat,
                oceanDepth = depthData.depth
            var basinMenu = document.getElementById("basin-menu");
            var basinValue = basinMenu.options[basinMenu.selectedIndex].value;
            console.log(relayoutBool)
            var basinId = basinMenu.options[basinMenu.selectedIndex].id

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
                    break;
                case 'northPacific':
                    var bound1 = 90,
                        bound2 = 294,
                        bound3 = -10,
                        bound4 = 67;
                    xSize = 3.5
                    break;
                case 'southPacific':
                    var bound1 = 90,
                        bound2 = 294,
                        bound3 = -90,
                        bound4 = 10;
                    xSize = 3.5
                    break;
                case 'atlantic':
                    var bound1 = -100,
                        bound2 = 20,
                        bound3 = -80,
                        bound4 = 80;
                    xSize = 1.7
                    long = switchOcean(long)
                    longDepth = switchOcean(longDepth)
                    break;
                case 'indian':
                    var bound1 = 
            }
            var plotDiv = document.getElementById("plot");

            var layout = {
                autosize: true,
                scene: {
                    aspectmode: "manual",
                    aspectratio: {
                        x: xSize,
                        y: 2,
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
            var dataset = [{
                    type: 'scatter3d',
                    mode: 'markers',
                    x: long,
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
                    x: longDepth,
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
                    x: [long],
                    y: [lat],
                    z: [depth],
                    opacity: [1],
                    group: [depthOpac],
                    marker: {
                        opacity: 1,
                        size: 3,
                        cmin: -1000,
                        cmax: 0,
                        colorscale: [
                            ['0.0', 'rgb(165,0,38)'],
                            ['0.111111111111', 'rgb(215,48,39)'],
                            ['0.222222222222', 'rgb(244,109,67)'],
                            ['0.333333333333', 'rgb(253,174,97)'],
                            ['0.444444444444', 'rgb(254,224,144)'],
                            ['0.555555555556', 'rgb(224,243,248)'],
                            ['0.666666666667', 'rgb(171,217,233)'],
                            ['0.777777777778', 'rgb(116,173,209)'],
                            ['0.888888888889', 'rgb(116,173,209)'],
                            ['1.0', 'rgb(69,117,180)']
                        ],
                        color: depth
                    },
                    hovertext: year

                }, {
                    'scene.xaxis.range': [bound1, bound2],
                    'scene.yaxis.range': [bound3, bound4],
                    'scene.aspectratio.x': xSize
                }, 0)
            }
            if (isUpdate && !relayoutBool) {
                console.log("update data", dataset, long)
                Plotly.restyle('myDiv', {
                    x: [long],
                    y: [lat],
                    z: [depth],
                    opacity: [1],
                    group: [depthOpac],
                    marker: {
                        opacity: 1,
                        size: 3,
                        cmin: -1000,
                        cmax: 0,
                        colorscale: [
                            ['0.0', 'rgb(165,0,38)'],
                            ['0.111111111111', 'rgb(215,48,39)'],
                            ['0.222222222222', 'rgb(244,109,67)'],
                            ['0.333333333333', 'rgb(253,174,97)'],
                            ['0.444444444444', 'rgb(254,224,144)'],
                            ['0.555555555556', 'rgb(224,243,248)'],
                            ['0.666666666667', 'rgb(171,217,233)'],
                            ['0.777777777778', 'rgb(116,173,209)'],
                            ['0.888888888889', 'rgb(116,173,209)'],
                            ['1.0', 'rgb(69,117,180)']
                        ],
                        color: depth
                    },
                    hovertext: year

                }, 0)
            }
            if (!isUpdate) {
                Plotly.newPlot('myDiv', dataset, layout, {
                    responsive:true
                   
                });


            }
            isUpdate = true
            basinIdprevious = basinId
            relayoutBool = false
            document.body.style.cursor = "auto"
        };
        function toggle(element) {

            // If the checkbox is checked, disabled the slider.
            // Otherwise, re-enable it.
            if (this.checked) {
                element.setAttribute('disabled', true);
            } else {
                element.removeAttribute('disabled');
            }
        }

        function filterByDepth() {
            var depthRange = depthSlider.noUiSlider.get();
            data1 = JSON.parse(JSON.stringify(data));
            console.log(dataUnfiltered);
            console.log(data1);
            for (var i = 1; i < data1.depth.length; i++) {
                if (data1.depth[i] > -depthRange[0] || data1.depth[i] < -depthRange[1]) {
                    data1.depth.splice(i, 1);
                    data1.lat.splice(i, 1);
                    data1.lon.splice(i, 1);
                    data1.o2.splice(i, 1);
                    data1.salt.splice(i, 1);
                    data1.temp.splice(i, 1);
                    data1.year.splice(i, 1);
                    i--;
                }
            }
            console.log(data1, dataUnfiltered);
        }

        function dataList(listItems, list) {
            let options = []
            for (i in listItems.name) {
                var opt = listItems.name[i]
                var el = document.createElement("option")
                el.textContent = opt
                el.value = i;
                list.add(el)
            }

        }

        function saveDataset(dataset) {
            var name = prompt("Please enter a name for this data");
            savedData.name.push(name);
            let tempValues = tempSlider.noUiSlider.get(),
                oxyValues = oxySlider.noUiSlider.get(),
                saltValues = saltSlider.noUiSlider.get(),
                selectYear = yearSlider.noUiSlider.get();
            allSliderValues = {
                'temp': tempValues,
                'salt': saltValues,
                'oxy': oxyValues
            }
            savedData.params.push(allSliderValues)
            Cookies.set('savedData', savedData)
            var opt = savedData.name[savedData.name.length - 1];
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = savedData.name.length - 1;
            var el1 = document.createElement("option");
            el1.textContent = opt;
            el1.value = savedData.name.length - 1;
            var el2 = document.createElement("option");
            el2.textContent = opt;
            el2.value = savedData.name.length - 1;
            saveList.add(el);
            speciesList1.add(el1);
            speciesList2.add(el2);
        }

        function predatorPreyOverlap() {
            var saveSelect1 = speciesList1.options[speciesList1.selectedIndex].value;
            var saveSelect2 = speciesList2.options[speciesList2.selectedIndex].value;
            var species1Name = speciesList1.options[speciesList1.selectedIndex].innerText;
            var species2Name = speciesList2.options[speciesList2.selectedIndex].innerText;
            let species1 = JSON.parse(JSON.stringify(savedData.params[saveSelect1]));
            let species2 = JSON.parse(JSON.stringify(savedData.params[saveSelect2]));
            let speciesOverlap = {
                temp: [],
                salt: [],
                oxy: []
            }
            for (i in species1) {
                if (parseFloat(species1[i][0]) >= parseFloat(species2[i][0]) ) {
                    speciesOverlap[i][0] = species1[i][0]
                    console.log('work it')
                } else {
                    speciesOverlap[i][0] = species2[i][0]
                    console.log(species1[i][0],species2[i][0])
                }
                if (parseFloat(species1[i][1]) <= parseFloat(species2[i][1]) ) {
                    speciesOverlap[i][1] = species1[i][1]
                } else {
                    speciesOverlap[i][1] = species2[i][1]
                }                

            }
            let noOverlap = {
                temp: false,
                salt: false,
                oxy: false
            }
            for(i in speciesOverlap){
                if(speciesOverlap[i][0]>=speciesOverlap[i][1]){
                    alert("These parameters have no overlap")
                    return
                }
            }
            
            console.log(speciesOverlap)
            savedData.name.push(species1Name + ' and ' + species2Name +' overlap')
            savedData.params.push(speciesOverlap)
            Cookies.set('savedData', savedData)
            var opt = savedData.name[savedData.name.length - 1];
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = savedData.name.length - 1;
            var el1 = document.createElement("option");
            el1.textContent = opt;
            el1.value = savedData.name.length - 1;
            var el2 = document.createElement("option");
            el2.textContent = opt;
            el2.value = savedData.name.length - 1;
            saveList.add(el);
            speciesList1.add(el1);
            speciesList2.add(el2);
        }

        function loadDataset() {
            var saveSelect = saveList.options[saveList.selectedIndex].value;
            let params = JSON.parse(JSON.stringify(savedData.params[saveSelect]))
            console.log(params)
            saltSlider.noUiSlider.set(params.salt)
            tempSlider.noUiSlider.set(params.temp)
            oxySlider.noUiSlider.set(params.oxy)

        }

        function resetView() {
            var viewSelect = viewsList.options[viewsList.selectedIndex].value
            Plotly.relayout(myDiv, views.view[viewSelect])
        }
        function cursorWaiting(){
                document.body.style.cursor = 'wait';
            console.log('done')
        }
        function showSpecies(){
            cursorWaiting()
            setTimeout(function(){buttonClick()},100);
        }
        function buttonPlot() {
            filterByDepth();
            document.getElementById('ready').innerHTML = "Data Status: Rendering"
        
            makePlotly(data.lat, data.lon, data.depth, data.year, depthData.long, depthData.lat, depthData.depth);
            
            
        }

        function overlapPlot() {
            let overlapSelectList = document.getElementById("overlapSelect")
            cursorWaiting()
        
            setTimeout(function(){setSpeciesOne()},100);
        }
        var rangeMap = new selectMap("rangeMap");
