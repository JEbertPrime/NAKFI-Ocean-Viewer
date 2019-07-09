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
    function compareDatasets(array1, array2){
        var uniqueLong1 = [], uniqueLong2 = [], uniqueLat1 = [], uniqueLat2 = [], uniqueDepth1 = [], uniqueDepth2 = [];
        for(i in array1){
            uniqueLong1.push(array1[i][0])
            uniqueLat1.push(array1[i][1])
            uniqueDepth1.push(array1[i][2])
        }
        uniqueLong1 = [...new Set(uniqueLong1)]
        uniqueLat1 = [...new Set(uniqueLat1)]
        uniqueDepth1 = [...new Set(uniqueDepth1)]
        for(i in array2){
            uniqueLong2.push(array2[i][0])
            uniqueLat2.push(array2[i][1])
            uniqueDepth2.push(array2[i][2])
        }
        uniqueLong2 = [...new Set(uniqueLong2)]
        uniqueLat2 = [...new Set(uniqueLat2)]
        uniqueDepth2 = [...new Set(uniqueDepth2)]        
        console.log(uniqueLong1, uniqueLong2)
        let intersectionLong = uniqueLong1.filter(x => uniqueLong2.includes(x));
        let intersectionLat = uniqueLat1.filter(x => uniqueLat2.includes(x));
        let intersectionDepth = uniqueDepth1.filter(x => uniqueDepth2.includes(x));
        console.log(intersectionDepth,intersectionLat,intersectionLong)
        let array1Filtered = array1.filter(x=> intersectionLong.includes(x[0]) && intersectionLat.includes(x[1]) && intersectionDepth.includes(x[2]))
        let array2Filtered = array2.filter(x=> intersectionLong.includes(x[0]) && intersectionLat.includes(x[1]) && intersectionDepth.includes(x[2]))
        console.log(array1Filtered,array2Filtered)
        let uniquePairs1 = []
        for(i in array1Filtered){
            let isUnique = false
            if(i==0){
                isUnique = true
            }
            else{
            for(j in uniquePairs1){
                if(array1Filtered[i][0]==uniquePairs1[j][0] && array1Filtered[i][1]==uniquePairs1[j][1]){
                    isUnique = false
                    break
                }
                else{
                    isUnique = true
                }
            }}
            if(isUnique){
                uniquePairs1.push(array1Filtered[i]);
            }
        }

        console.log(array1Filtered, uniquePairs1)
    let uniquePairs2 = []
            for(i in array2Filtered){
                let isUnique = false
                if(i==0){
                    isUnique = true
                }
                else{
                for(j in uniquePairs2){
                    if(array2Filtered[i][0]==uniquePairs2[j][0] && array2Filtered[i][1]==uniquePairs2[j][1]){
                        isUnique = false
                        break
                    }
                    else{
                        isUnique = true
                    }
                }}
                if(isUnique){
                    uniquePairs2.push(array2Filtered[i]);
                }
            }

            console.log(array2Filtered, uniquePairs2)
        let pairIntersection = []
        for(i in uniquePairs1){
            for(j in uniquePairs2){
                if(uniquePairs1[i][0] == uniquePairs2[j][0] &&uniquePairs1[i][1] == uniquePairs2[j][1] )
                    pairIntersection.push(uniquePairs1[i])
            }
        }
        console.log(pairIntersection)
        
        var array1SecondFilter = [], array2SecondFilter = [];
        for(i in array1Filtered){
            for(j in pairIntersection){
                if(array1Filtered[i][0] == pairIntersection[j][0] && array1Filtered[i][1] == pairIntersection[j][1]){
                    array1SecondFilter.push(array1Filtered[i])
                }
            }
        }
        for(i in array2Filtered){
            for(j in pairIntersection){
                if(array2Filtered[i][0] == pairIntersection[j][0] && array2Filtered[i][1] == pairIntersection[j][1]){
                    array2SecondFilter.push(array2Filtered[i])
                }
            }
        }
        var overlap = []
        for(i in array1SecondFilter){
            for(j in array2SecondFilter){
                if(array1SecondFilter[i][0] == array2SecondFilter[j][0] && array1SecondFilter[i][1] == array2SecondFilter[j][1] && array1SecondFilter[i][2] == array2SecondFilter[j][2]){
                    overlap.push(array1SecondFilter[i])
                }
            }
        }
        console.log(overlap)
        overlapJson = toJson(overlap)
        return overlapJson;
        }
    