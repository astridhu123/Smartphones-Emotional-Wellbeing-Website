/*
* Emotion Bubble Chart
* @param 
* @param
*/

class PandemicHealthChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        // console.log(data);
        this.initVis();
    }

    /*
	 * Method that initializes the visualization (static content, e.g. SVG area or axes)
 	*/
	initVis(){
        let vis = this;

		vis.margin = {top: 10, right: 10, bottom: 10, left: 10};

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        
        // Initialize the tooltip
        // vis.tooltip = d3.select("#" + vis.parentElement)
        //     .append("div")
        //     .attr("class", "emotion-tooltip")
        //     .style("position", "absolute")
        //     .style("visibility", "hidden")
        //     .style("background-color", "rgba(0, 0, 0, 0.7)")
        //     .style("color", "white")
        //     .style("border-radius", "5px")
        //     .style("padding", "10px")
        //     .style("font-size", "12px")
        //     .style("pointer-events", "none");

        this.wrangleData();
	}

	/*
 	* Data wrangling
 	*/
	wrangleData(){
        let vis = this;

    
        this.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
 	* Function parameters only needed if different kinds of updates are needed
 	*/   
    updateVis() {
        let vis = this;
    
    }
    
    /*
    * Recall the function when different toggles have been selected
    */
    selectionChanged(newData){
        let vis = this;

        console.log("Filtered data in Select");
        console.log(newData);
    
        // Update the internal data with the new, filtered data
        vis.displayData = newData; // Reset displayData
    
        // Reprocess the new data into emotion counts by platform
        vis.wrangleData();
    }
    
}
