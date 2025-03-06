/*
* Emotion Bubble Chart
* @param 
* @param
*/

class EmotionGraph {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        console.log(data);
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

        this.wrangleData();
	}

	/*
 	* Data wrangling
 	*/
	wrangleData(){
        let vis = this;

        // Initialize an empty object to store the counts
        let emotionCountByPlatform = {};
    
        // Iterate through the dataset
        vis.data.forEach(d => {
            let platform = d.Platform;
            let emotion = d.Dominant_Emotion;
    
            // Ensure platform exists in the object
            if (!emotionCountByPlatform[platform]) {
                emotionCountByPlatform[platform] = {};
            }
    
            // Ensure emotion exists under the platform
            if (!emotionCountByPlatform[platform][emotion]) {
                emotionCountByPlatform[platform][emotion] = 0;
            }
    
            // Increment the emotion count
            emotionCountByPlatform[platform][emotion]++;
        });
    
        // Store the processed data
        vis.displayData = emotionCountByPlatform;
    
        console.log(vis.displayData);

        this.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
 	* Function parameters only needed if different kinds of updates are needed
 	*/
	updateVis(){

	}

    /*
    * Recall the function when different toggles have been selected
    */
    selectionChanged(newData){
        let vis = this;

        vis.data = newData;
        console.log(vis.displayData);

        this.wrangleData();
    }
}
