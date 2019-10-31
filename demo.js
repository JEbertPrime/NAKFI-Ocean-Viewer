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
            console.log(url)
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
            if(name != null){
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
        }
        function save_species_to_cloud(species){
            http
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
            let longTemp = []
            for(i in long){
                longTemp[i] = long[i]
            }
            for(i in longTemp){
                if(longTemp[i] <= 180){
                     longTemp[i] = longTemp[i]
                }
                else if (longTemp[i] > 180){
                     longTemp[i] = longTemp[i] - 360
                }
            }
            console.log(longTemp)
            return longTemp
        }
        function oxySliderUnits(){
            var oxyMenu = document.getElementById("oxygen-menu");
            var oxyUnits = oxyMenu.options[oxyMenu.selectedIndex].id;
            switch(oxyUnits){
                case 'oxy1':
                    oxyUnitConversion = 1
                    maxOxyValue = 400
                    oxyStep = 5
                    oxyDecimals = 0
                    break;
                case 'oxy2':
                    oxyUnitConversion = 44.66
                    maxOxyValue = 10
                    oxyStep = .5
                    oxyDecimals = 1
                    break;
                case 'oxy3':
                    oxyUnitConversion = 31.25
                    maxOxyValue = 14
                    oxyStep = .5
                    oxyDecimals = 1
                    break;
                case 'oxy4':
                    oxyUnitConversion = 500.2
                    maxOxyValue = .9
                    oxyStep = .05
                    oxyDecimals = 2
                    break;
                    
            }
        }
        function toPolar(long, lat, ocean){
            let x = [], y = []
            if(ocean == 'antarctic'){
                for(i in long){
                    if(lat[i]<0){
                        x[i] = Math.cos((long[i]*Math.PI)/180) * (lat[i] + 90)
                        y[i] = Math.sin((long[i]*Math.PI)/180) * (lat[i] + 90)

                    }
                    if(lat[i]>=0){
                        x[i]= 800
                        y[i]= 800

                    }
                }
            }
            if(ocean == 'arctic'){
                for(i in long){
                    if(lat[i]>0){
                        x[i] = Math.cos((long[i]*Math.PI)/180) * (Math.abs(lat[i] - 90))
                        y[i] = Math.sin((long[i]*Math.PI)/180) * (Math.abs(lat[i] - 90))

                    }
                    if(lat[i]<=0){
                        x[i]= 800
                        y[i]= 800

                    }
                }
            }
            console.log(x,y)
            return [x,y]
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
            d3.csv("https://cors-anywhere.herokuapp.com/http://temp.justinebert.com/bathymetry_60min.csv", function(d) {
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
            document.getElementById('ready').innerHTML = 'Data status: ';
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

        function filterByDepth(data1) {
            var depthRange = depthSlider.noUiSlider.get();
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
            return data1;
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
            oxyValues[0] = parseFloat(oxyValues[0])*oxyUnitConversion
            oxyValues[1] = parseFloat(oxyValues[1])*oxyUnitConversion
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
            params.oxy[0] = params.oxy[0]/oxyUnitConversion
            params.oxy[1] = params.oxy[1]/oxyUnitConversion
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
            let dataFiltered = filterByDepth(data);
            document.getElementById('ready').innerHTML = "Data Status: Rendering"
        
            makePlotly(dataFiltered.lat, dataFiltered.lon, dataFiltered.depth, dataFiltered.year, depthData.long, depthData.lat, depthData.depth);
            
            
        }

        function overlapPlot() {
            let overlapSelectList = document.getElementById("overlapSelect")
            cursorWaiting()
        
            setTimeout(function(){setSpeciesOne()},100);
        }
        var rangeMap = new selectMap("rangeMap");
