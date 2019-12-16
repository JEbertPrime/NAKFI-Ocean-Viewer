var b = true;
class selectionRect {
	constructor(newX, newY, svgId) {
        
        this.svg = d3.select('#' + svgId);
        if(document.getElementById("selection")){
            //removes old selection box
            var element = d3.select("#selection");
            element.remove();}
        this.rectElement = this.svg.append("rect")
		    .attrs({
		        rx      : 0,
		        ry      : 0,
		        x       : 0,
		        y       : 0,
		        width   : 0,
		        height  : 0
		    })
		    .classed("selection", true).attr("id","selection");
        this.element = this.rectElement;
        this.previousElement = null;
	    this.setElement(this.rectElement);
		this.originX = newX;
		this.originY = newY;
		this.update(newX, newY);
        


        
	}
	 setElement(ele) {
		/*this.prePreviousElement = this.previousElement;
        this.previousElement = this.element;*/
		//console.log(this.element);
         this.element = ele;
	}
	 getNewAttributes() {
		var x = this.currentX<this.originX?this.currentX:this.originX;
		var y = this.currentY<this.originY?this.currentY:this.originY;
		var width = Math.abs(this.currentX - this.originX);
		var height = Math.abs(this.currentY - this.originY);
		if(b){return {
	        x       : x,
	        y       : y,
	        width  	: width,
	        height  : height
		};}
	}
     getNewAttributes2() {
		var x = this.currentX<this.originX?this.currentX:this.originX;
		var y = this.currentY<this.originY?this.currentY:this.originY;
		var width = Math.abs(this.currentX - this.originX);
		var height = Math.abs(this.currentY - this.originY);
		if(b){return {
	        x       : x,
	        y       : y,
	        width  	: width,
	        height  : height
		};}
        if(!b){return {
            x : svgWidth,
            y : y
        }}
	}
	 getCurrentAttributes() {
		// use plus sign to convert string into number
		var x = +this.element.attr("x");
		var y = +this.element.attr("y");
		var width = +this.element.attr("width");
		var height = +this.element.attr("height");
		if(x + width <= svgWidth) {return {
			x1  : x,
	        y1	: y,
	        x2  : x + width,
	        y2  : y + height,
		};}
		if(x + width > svgWidth) {return {
			x1  : x,
	        y1	: y,
	        x2  : width - (svgWidth - x),
	        y2  : y + height,
		};}        
	}
    
	 getCurrentAttributesAsText() {
		var attrs = this.getCurrentAttributes();
		return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
	}
	 update(newX, newY) {
		this.currentX = newX;
		this.currentY = newY;
		this.element.attrs(this.getNewAttributes());
        if(!b){
            this.previousElement.attr(this.getNewAttributes);
        }
	}
	 focus() {
        this.element
            .style("stroke", "#DE695B")
            .style("stroke-width", "2.5");
    }
     remove() {
    	this.element.remove();
    	this.element = null;
    }
     removePrevious() {
    	if(this.previousElement) {
    		this.previousElement.remove();
    	}
    }
};
class selectMap {
    constructor(divId) {
        this.div = d3.select("#"+divId);
        
        
        this.svgId = divId + "svg";
        this.svg = this.div.append("svg")
            .attr("width", getComputedStyle(this.div.node()).width)
            .attr("height", getComputedStyle(this.div.node()).height)
            .attr("id", this.svgId);
//        console.log(this.svg);
        this.svgWidth = parseInt(getComputedStyle(this.svg.node()).width, 10);
        this.svgHeight = parseInt(getComputedStyle(this.svg.node()).height, 10);
        this.rect = null;
        this.overflow = null;
        this.startCoords = this.svg.on("mousedown.log", function() {
                              var startCoords = d3.geoEquirectangular().invert(d3.mouse(this));
                                console.log(startCoords);
                                return startCoords;
                            });
        this.endCoords =  this.svg.on("mouseup.log", function() {
                              var startCoords = d3.geoEquirectangular().invert(d3.mouse(this));
                                console.log(startCoords);
                                return startCoords;
                            });
        //console.log(this);
        this.drawMap();
    }
    drawMap(){
        //svg = d3.select("body").append("svg").attr("width", w + "px").attr("height", h + "px");
        //retrieve height and width from css
        var svgWidth = this.svgWidth;
        var svgHeight = this.svgHeight;
        var svg = this.svg;
        //console.log(svg);
        d3.json("https://unpkg.com/world-atlas@1/world/110m.json").then(function( world) {
            //console.log(svg);
            //if (error) throw error;
            var mapData = topojson.feature(world,world.objects.countries);
            console.log(mapData);
            //fitSize does not work with features; use a feature collection instead.
            var path = d3.geoPath().projection(d3.geoEquirectangular().fitSize([svgWidth, svgHeight], mapData));
              svg.selectAll("path")
                 .data(mapData.features)
                 .enter().append("path")
                 .attr("d", path);
            //console.log(svg);
    });
                this.drag();
}
    
    
    
    drag() {
        let svgWidth = this.svgWidth
        function dragStart() {
        var svgId = this;
        
        //console.log("dragStart");
        var p = d3.mouse(this);
            b = true;
        this.rect = new selectionRect(p[0], p[1], this.id);
        //console.log(this.rect);
    };
        function dragMove() {
            
        //console.log("dragMove");
        var svg = this;
        var p = d3.mouse(this);
            console.log(p, this.svgWidth)
        if(b){
            this.rect.update(p[0], p[1]);}
        if(!b){
            this.rect.update(p[0]-parseInt(getComputedStyle(this).width), p[1]);     
        }
        if(p[0] > svgWidth && b){
            console.log('poop')
            var y = this.rect.originY;
            this.overflow = new selectionRect(p[0]-parseInt(getComputedStyle(this).width), y);
            b = false;
        }
    };
        
        console.log(this.svgId);
    var dragBehavior = d3.drag()
    .on("drag", dragMove)
    .on("start", dragStart);
//    .on("dragend", this.dragEnd);
//console.log(this.svg.node());
    this.svg.call(dragBehavior);
    }
    
}



function clicked() {
	var d = new Date();
    clickTime
    	.text("Clicked at " + d.toTimeString().substr(0,8) + ":" + d.getMilliseconds());
}

