//function for determining equivalence of parameter sets
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
//function for downloading data. Returns SpeciesData object, and warns user if data contains too many points. In future updates, may include option for scaling down resolution of data?
async function downloadData(parameters, year) {
    let basinCoords = {
        minLong: 0,
        minLat: 0,
        maxLong: 0,
        maxLat: 0
    };
    switch (basinId) {
        case 'world':
            basinCoords.minLong = 0,
                basinCoords.maxLong = 360,
                basinCoords.minLat = -89,
                basinCoords.maxLat = 89;
            break;
        case 'northPacific':
            basinCoords.minLong = 90,
                basinCoords.maxLong = 294,
                basinCoords.minLat = -90,
                basinCoords.maxLat = 67;
            break;
        case 'southPacific':
            basinCoords.minLong = 90,
                basinCoords.maxLong = 294,
                basinCoords.minLat = -90,
                basinCoords.maxLat = 67;
            break;
        case 'atlantic':
            basinCoords.minLong = 80,
                basinCoords.maxLong = 20,
                basinCoords.minLat = -80,
                basinCoords.maxLat = 80;
            break;
        case 'indian':
            basinCoords.minLong = 20,
                basinCoords.maxLong = 120,
                basinCoords.minLat = -80,
                basinCoords.maxLat = 30
            break;
        case 'arctic':
            basinCoords.minLong = 0,
                basinCoords.maxLong = 360,
                basinCoords.minLat = 50,
                basinCoords.maxLat = 90
            break;
        case 'antarctic':
            basinCoords.minLong = 0,
                basinCoords.maxLong = 360,
                basinCoords.minLat = -90,
                basinCoords.maxLat = -40
            break;
    }
    var url = './php/test3.php?min_temp=' + parameters.temp[0] + '&max_temp=' + parameters.temp[1] + '&min_salt=' + parameters.salt[0] + '&max_salt=' + parameters.salt[1] + '&min_o2=' + parameters.oxy[0] + '&max_o2=' + parameters.oxy[1] + '&min_year=' + year + '&max_year=' + year + "&min_lon=" + basinCoords.minLong + "&max_lon=" + basinCoords.maxLong + "&min_lat=" + basinCoords.minLat + "&max_lat=" + basinCoords.maxLat;
    console.log(url)
    var downloadedData = await d3.json(url).then(function (d) {
        let data = d
        data.depth = data.depth.map(x => -x)
        if (data.depth.length > 250000) {
            if (!confirm("CAUTION: This dataset contains " + data.depth.length + " points. Datasets with this many points can cause your browser to crash. Data resolution will be scaled down. Proceed?")) {
                document.body.style.cursor = "auto"
                return;
            }
            data.lon = data.lon.map(x => Math.round(x / 4) * 4)
            data.lat = data.lat.map(x => Math.round(x / 4) * 4)
        }
        console.log(d)
        return data
    })

    console.log(downloadedData)
    return new SpeciesData(downloadedData)
}

function reduceDataRes(data, factor) {

}

function updateOpacity() {
    if (isUpdate) {
        var opacityValue = (opacitySlider.noUiSlider.get()) / 100;
        Plotly.restyle(myDiv, {
            opacity: opacityValue
        }, 1)
    }
}

function saveView() {
    let name = prompt("Enter a name for your camera view")
    if (name != null) {
        let camLayout = myDiv.layout.scene.camera
        if (camLayout.up) {
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
        if (!camLayout.up) {
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
async function cloudSpeciesList() {
    function removeOptions(selectbox) {
        var i;
        for (i = selectbox.options.length - 1; i >= 0; i--) {
            selectbox.remove(i);
        }
    }

    cloudSpecies = await d3.json("php/test2.php", function (data) {
        return data
    })

    let list = document.getElementById("cloudSaveList")
    removeOptions(list)
    console.log(cloudSpecies, list)
    let options = []
    for (i in cloudSpecies) {
        var opt = cloudSpecies[i].name
        var el = document.createElement("option")
        el.textContent = opt
        el.value = i;
        el.id = cloudSpecies[i].id
        list.add(el)
        options[i] = cloudSpecies[i].name
    }
    cloudSpeciesSelect = new CustomSelect({id:'select-box', list:options, clickEvent:updateFishInfo})

}

function loadCloudDataset() {

    let list = document.getElementById("cloudSaveList")
    var cloudSaveSelect = list.options[list.selectedIndex].id;
    let selectedSpecies
    for (i in cloudSpecies) {
        if (cloudSpecies[i].id == cloudSaveSelect) {
            selectedSpecies = cloudSpecies[i]
        }
    }
    console.log(selectedSpecies)
    saltSlider.noUiSlider.set([selectedSpecies.salt_min, selectedSpecies.salt_max])
    tempSlider.noUiSlider.set([selectedSpecies.temp_min, selectedSpecies.temp_max])
    oxySlider.noUiSlider.set([selectedSpecies.oxygen_min, selectedSpecies.oxygen_max])

}

function loadDataset() {
    var saveSelect = saveList.options[saveList.selectedIndex].value;
    let params = JSON.parse(JSON.stringify(savedData.params[saveSelect]))
    console.log(params)
    params.oxy[0] = params.oxy[0] / oxyUnitConversion
    params.oxy[1] = params.oxy[1] / oxyUnitConversion
    saltSlider.noUiSlider.set(params.salt)
    tempSlider.noUiSlider.set(params.temp)
    oxySlider.noUiSlider.set(params.oxy)

}

function getAllParameters() {
    let tempValues = tempSlider.noUiSlider.get(),
        oxyValues = oxySlider.noUiSlider.get(),
        saltValues = saltSlider.noUiSlider.get(),
        selectYear = yearSlider.noUiSlider.get()
    oxyValues[0] = parseFloat(oxyValues[0]) * oxyUnitConversion
    oxyValues[1] = parseFloat(oxyValues[1]) * oxyUnitConversion
    let allSliderValues = {
        'temp': tempValues,
        'salt': saltValues,
        'oxy': oxyValues
    }
    return [allSliderValues, selectYear];
}

function openSaveForm() {
    document.getElementById("testbox").style.display = "flex"
}

function closeSaveForm() {
    document.getElementById("testbox").style.display = "none"
}

function saveToDatabase() {
    let [allParams, year] = getAllParameters()
    let commonName = document.getElementById("common-name").value,
        sciName = document.getElementById("scientific-name").value,
        givenName = document.getElementById("given-name").value,
        familyName = document.getElementById("family-name").value,
        referenceDoi = document.getElementById("reference-doi").value,
        referenceDoiUrl = document.getElementById("reference-doi-url").value,
        checkboxes = document.getElementById("checkboxes"),
        speciesType
    let url = "./php/test.php";

    for (let i = 0; i < checkboxes.children.length; i++) {
        console.log(checkboxes.children[i])
        if (checkboxes.children[i].type == 'checkbox') {
            if (checkboxes.children[i].checked) {
                speciesType = checkboxes.children[i].value
            }
        }
    }

    let params = "name=" + commonName + "&sci_name=" + sciName + "&species_type=" + speciesType + "&oxy_min=" + allParams.oxy[0] + "&oxy_max=" + allParams.oxy[1] + "&salt_min=" + allParams.salt[0] + "&salt_max=" + allParams.salt[1] + "&temp_min=" + allParams.temp[0] + "&temp_max=" + allParams.temp[1] + "&given_name=" + givenName + "&family_name=" + familyName + "&reference_doi=" + referenceDoi + "&reference_doi_url=" + encodeURIComponent(referenceDoiUrl);
    console.log(params)
    let http = new XMLHttpRequest();


    http.open("GET", url + "?" + params, true);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
        }
    }
    http.send(null);
    document.getElementById("testbox").style.display = "none"
    setTimeout(function () {

        cloudSpeciesList()

    }, 2000);

}

function switchOcean(long) {
    let longTemp = []
    for (i in long) {
        longTemp[i] = long[i]
    }
    for (i in longTemp) {
        if (longTemp[i] <= 180) {
            longTemp[i] = longTemp[i]
        } else if (longTemp[i] > 180) {
            longTemp[i] = longTemp[i] - 360
        }
    }
    console.log(longTemp)
    return longTemp
}

function oxySliderUnits() {
    var oxyMenu = document.getElementById("oxygen-menu");
    var oxyUnits = oxyMenu.options[oxyMenu.selectedIndex].id;
    switch (oxyUnits) {
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

function toPolar(long, lat, ocean) {
    let x = [],
        y = []
    if (ocean == 'antarctic') {
        for (i in long) {
            if (lat[i] < 0) {
                x[i] = Math.cos((long[i] * Math.PI) / 180) * (lat[i] + 90)
                y[i] = Math.sin((long[i] * Math.PI) / 180) * (lat[i] + 90)

            }
            if (lat[i] >= 0) {
                x[i] = 800
                y[i] = 800

            }
        }
    }
    if (ocean == 'arctic') {
        for (i in long) {
            if (lat[i] > 0) {
                x[i] = Math.cos((long[i] * Math.PI) / 180) * (Math.abs(lat[i] - 90))
                y[i] = Math.sin((long[i] * Math.PI) / 180) * (Math.abs(lat[i] - 90))

            }
            if (lat[i] <= 0) {
                x[i] = 800
                y[i] = 800

            }
        }
    }
    console.log(x, y)
    return [x, y]
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
    oxyValues[0] = parseFloat(oxyValues[0]) * oxyUnitConversion
    oxyValues[1] = parseFloat(oxyValues[1]) * oxyUnitConversion
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
        if (parseFloat(species1[i][0]) >= parseFloat(species2[i][0])) {
            speciesOverlap[i][0] = species1[i][0]
            console.log('work it')
        } else {
            speciesOverlap[i][0] = species2[i][0]
            console.log(species1[i][0], species2[i][0])
        }
        if (parseFloat(species1[i][1]) <= parseFloat(species2[i][1])) {
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
    for (i in speciesOverlap) {
        if (speciesOverlap[i][0] >= speciesOverlap[i][1]) {
            alert("These parameters have no overlap")
            return
        }
    }

    console.log(speciesOverlap)
    savedData.name.push(species1Name + ' and ' + species2Name + ' overlap')
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



function resetView() {
    var viewSelect = viewsList.options[viewsList.selectedIndex].value
    Plotly.relayout(myDiv, views.view[viewSelect])
}
function cursorWaiting() {
    document.body.style.cursor = 'wait';
    console.log('done')
}

function showSpecies(panel) {
    cursorWaiting()
    setTimeout(function () {
        buttonClick(panel)
    }, 100);
}
async function buttonClick(panel) {
    var tempValues = tempSlider.noUiSlider.get(),
        oxyValues = oxySlider.noUiSlider.get(),
        saltValues = saltSlider.noUiSlider.get()
    if (panel == 0) {
        var selectYear = yearSliderSpecies.noUiSlider.get();
        var title = cloudSpeciesSelect.getSelectedItem()[0] + " in " + selectYear
    }
    if (panel == 1) {
        var selectYear = yearSliderCustom.noUiSlider.get();
        var title = "Custom Parameters in " + selectYear
    }
    var basinCoords;
    setBasinId(panel)

    oxyValues[0] = parseFloat(oxyValues[0]) * oxyUnitConversion
    oxyValues[1] = parseFloat(oxyValues[1]) * oxyUnitConversion
    console.log(oxyValues)
    if (!allSliderValues[1]) {
        allSliderValues[1] = 0
    }

    allSliderValues[0] = {
        'temp': tempValues,
        'salt': saltValues,
        'oxy': oxyValues
    }
    if (!isEquivalent(allSliderValues[0], allSliderValues[1])) {
        data = await downloadData(allSliderValues[0], selectYear)
        allSliderValues[1] = allSliderValues[0]
        buttonPlot(title)

    } else if (isEquivalent(allSliderValues[0], allSliderValues[1])) {
        buttonPlot(title)
    }
};

function buttonPlot(title) {
    console.log(data)
    let dataFiltered = filterByDepth(data);

    makePlotly(dataFiltered.lat, dataFiltered.lon, dataFiltered.depth, dataFiltered.year, title);


}

function overlapPlot() {
    let overlapSelectList = document.getElementById("overlapSelect")
    cursorWaiting()

    setTimeout(function () {
        setSpeciesOne()
    }, 100);
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
async function setSpeciesOne() {
    var saveSelect = speciesList1.options[speciesList1.selectedIndex].value,
        speciesOneParams = [];

    speciesOneYear = document.getElementById("speciesOneYear").value
    if (!speciesOneParams[1]) {
        speciesOneParams[1] = 0
    }
    speciesOneParams[0] = JSON.parse(JSON.stringify(savedData.params[saveSelect]));
    setBasinId(basin = 'world')
    if (!isEquivalent(speciesOneParams[0], speciesOneParams[1])) {
        speciesOne = await downloadData(speciesOneParams[0], speciesOneYear)
        speciesOneParams[1] = speciesOneParams[0]
        setSpeciesTwo()
    } else if (isEquivalent(speciesOneParams[0], speciesOneParams[1])) {
        console.log('it worked')
        setSpeciesTwo()
    }
}
async function setSpeciesTwo() {
    speciesTwoYear = document.getElementById("speciesTwoYear").value
    var saveSelect = speciesList2.options[speciesList2.selectedIndex].value,
        speciesTwoParams = [];
    speciesTwoYear = document.getElementById("speciesTwoYear").value
    setBasinId(basin = 'world')

    if (!speciesTwoParams[1]) {
        speciesTwoParams[1] = 0
    }
    speciesTwoParams[0] = JSON.parse(JSON.stringify(savedData.params[saveSelect]));

    if (!isEquivalent(speciesTwoParams[0], speciesTwoParams[1])) {
        speciesTwo = await downloadData(speciesTwoParams[0], speciesTwoYear)
        speciesTwoParams[1] = speciesTwoParams[0]
        compareSpecies(speciesOne, speciesTwo)
    } else if (isEquivalent(speciesTwoParams[0], speciesTwoParams[1])) {
        console.log('it worked')
        compareSpecies(speciesOne, speciesTwo)
    }
}

function compareSpecies(species1, species2) {

    lookup1 = {}
    lookup2 = {}
    //overlap = compareDatasets(array1, array2)
    overlap = []
    excluded1 = []
    excluded2 = []
    for (j in species2.stringArray) {
        lookup1[species2.stringArray[j]] = species2.stringArray[j]
    }
    for (i in species1.stringArray) {
        if (typeof lookup1[species1.stringArray[i]] != 'undefined') {
            overlap.push(species1.stringArray[i])
        } else {
            excluded1.push(species1.stringArray[i])
        }
    }
    for (j in species1.stringArray) {
        lookup2[species1.stringArray[j]] = species1.stringArray[j]
    }
    for (i in species2.stringArray) {

        if (typeof lookup2[species2.stringArray[i]] == 'undefined') {
            excluded2.push(species2.stringArray[i])
        }
    }
    //convert strings back to arrays
    overlap = stringsToJson(overlap)
    excluded1 = stringsToJson(excluded1)
    excluded2 = stringsToJson(excluded2)
    var excluded = {
        lon: excluded1.lon.concat(excluded2.lon),
        lat: excluded1.lat.concat(excluded2.lat),
        depth: excluded1.depth.concat(excluded2.depth)
    }
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

function switchSpeciesPanel(type) {
    if (type == 'custom') {
        d3.select('#species-select').style("display", "none")
        d3.select('#sidebar').style("display", "block")
    }
    if (type == 'species') {
        d3.select('#sidebar').style("display", "none")
        d3.select('#species-select').style("display", "block")
    }

}

function tabClick(d) {
    console.log(d.classList)
    if (d.classList.contains('active')) {
        return;
    } else {
        d3.select('.active').attr('class', 'tab inactive')
        d.className = 'active tab'
    }
}

function updateFishInfo(selectObject) {
    console.log(selectObject.getSelectedItem()[1])
    let speciesName = d3.select('#display-common-name')
    let scienceName = d3.select('#display-sci-name')
    let doi = d3.select("#doi")
    let selection = selectObject.getSelectedItem()[1]
    let iconSvg = d3.select('#category-svg')
    let critter = cloudSpecies[selection]

    console.log(critter)
    let iconUrl = "./ui-assets/fish-icons/" + critter.species_type + ".svg"
    iconSvg.attr('src', iconUrl)
    console.log(iconSvg)
    speciesName.html(critter.name)
    scienceName.html(critter.scientific_name)
    doi.html("Reference DOI: " + critter.reference_doi)
    saltSlider.noUiSlider.set([critter.salt_min, critter.salt_max])
    tempSlider.noUiSlider.set([critter.temp_min, critter.temp_max])
    oxySlider.noUiSlider.set([critter.oxygen_min, critter.oxygen_max])

}

function setBasinId(panel, basin = null) {
    let index
    if (!basin) {
        switch (panel) {
            case 0:
                index = speciesBasinList.getSelectedItem()[1]
                basinId = basinIds[index]
                setLayoutBool()
                break;
            case 1:
                index = customBasinList.getSelectedItem()[1]
                basinId = basinIds[index]
                setLayoutBool()
                break;
        }
    } else if (basin) {
        basinId = basin
    }
}

function setLayoutBool() {

    relayoutBool = true;
    console.log(relayoutBool)
}
function getTitle(){
}
function customBasin(){
    console.log('write this')
}
function svgExport() {

}
class SpeciesData {
    constructor(data) {
        this.lon = data.lon
        this.lat = data.lat
        this.depth = data.depth
        this.o2 = data.o2
        this.salt = data.salt
        this.temp = data.temp
        this.year = data.year
        this.stringArray = []
        for (let i in this.lon) {
            this.stringArray[i] = this.lon[i] + ", " + this.lat[i] + ", " + this.depth[i]
        }
    }
    removeDuplicates() {
        for (let i in this.stringArray) {
            if (this.stringArray.indexOf(this.stringArray[i]) !== i) {
                delete this.lon[i]
                delete this.lat[i]
                delete this.depth[i]
                delete this.o2[i]
                delete this.salt[i]
                delete this.temp[i]
                delete this.year[i]
                console.log('dupe')
            }
        }
    }
}
class CustomSelect {
    constructor(options = {}) {
        console.log(options)
        for(let i in options){
            this[i] = options[i]
        }
        console.log(this)
        this.element = d3.select("#" + this.id)
        this.element.attr('class', 'custom-select')
        this.wrapper = this.element.append('div').attr('class', 'select-wrapper')
        console.log(this.element)
        let self = this
        this.open = false
        this.selected = ''
        this.defaultText = 'Select'
        if (this.defaultSelected) {
            this.defaultText = this.defaultSelected
            this.selected = this.defaultSelected
        }

        this.selectedItem = this.wrapper.append('div').attr('class', 'list-item selected')
            .attr('id', 'default')
            .on('click', function () {
                self.clickHandler(this)
            })

        this.selectedItemText = this.selectedItem.append('p')
            .html(this.defaultText)

        this.arrow = this.wrapper.append('i').attr('class', 'arrow left')

        this.optionsWrapper = this.wrapper.append('div').attr('class', 'options-wrapper').style('display', 'none').style('pointer-events', 'none')

        if (this.list) {
            this.fillSelect()
        }
        console.log(this)
    }

    fillSelected() {

        this.selectedItemText.html(this.selected)
    }
    fillSelect() {
        let self = this
        for (let i in this.list) {
            this.optionsWrapper.append('div').attr('class', 'list-item')
                .attr('id', this.list[i])
                .on('click', function () {
                    self.clickHandler(this)
                    if (self.clickEvent) {
                        self.clickEvent(self)
                    }
                    if(this.id == self.eventTrigger){
                        self.triggeredEvent()
                }
                    
                })
                .append('p')
                .attr('id', this.list[i])
                .html(this.list[i])


        }
    }
    clickHandler(element) {
        this.selected = element.id
        console.log(this)
        if (element.classList.contains('selected') && !this.open) {
            this.optionsWrapper.style('display', 'block').style('pointer-events', 'auto')
            this.arrow.attr('class', 'down')
            this.selectedItem.style('border-radius', '5px 5px 0px 0px')
            this.open = true
        } else if (element.classList.contains('selected') && this.open) {
            this.optionsWrapper.style('display', 'none').style('pointer-events', 'none')
            this.arrow.attr('class', 'left')
            this.selectedItem.style('border-radius', '5px')
            this.open = false

        } else if (!element.classList.contains('selected')) {
            this.optionsWrapper.style('display', 'none').style('pointer-events', 'none')
            this.arrow.attr('class', 'left')
            this.selectedItem.style('display', 'block')
            this.selectedItem.style('border-radius', '5px')
            this.open = false
            this.fillSelected()
        }
    }
    getSelectedItem() {
        return [this.selected, this.list.indexOf(this.selected)]
    }
}
