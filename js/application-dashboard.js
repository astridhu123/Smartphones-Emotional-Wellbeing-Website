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
        vis.tooltip = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("class", "emotion-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0, 0, 0, 0.7)")
            .style("color", "white")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("font-size", "12px")
            .style("pointer-events", "none");

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
        vis.displayData.forEach(d => {
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
    
        // console.log(vis.displayData);

        this.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
 	* Function parameters only needed if different kinds of updates are needed
 	*/   
    updateVis() {
        let vis = this;
    
        // Define a color scale for emotions (fixed color for each emotion)
        const emotionColors = {
            "Sadness": "#0000FF",       // Blue for sadness
            "Anger": "#FF0000",         // Red for anger
            "Anxiety": "#FFA500",       // Dark orange-red for anxiety
            "Neutral": "#90EE90",       // Beige for neutral
            "Happiness": "#FFB6C1",     // Light pink for happiness
            "Boredom": "#D3D3D3",       // Light gray for boredom
        };
    
        // Create a scale for bubble size based on the emotion count
        let sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(Object.values(vis.displayData).flatMap(platformData => Object.values(platformData)))])  
            .range([5, 50]); // Minimum and maximum bubble sizes
    
        // Total number of groups (platforms)
        let platforms = Object.keys(vis.displayData); // Get all platforms
        let totalGroups = platforms.length;
        
        // Define the number of groups per row and calculate number of rows
        let groupsPerRow = 3; 
        let totalRows = Math.ceil(totalGroups / groupsPerRow); 
    
        // Calculate horizontal and vertical spacing
        let horizontalSpacing = vis.width / groupsPerRow;
        let verticalSpacing = vis.height / totalRows;
    
        let platformGroups = vis.svg.selectAll(".platform-group")
            .data(platforms)
            .join("g")
            .attr("class", "platform-group")
            .attr("transform", (d, i) => {
                // Calculate row (y) and column (x) for the group position
                let row = Math.floor(i / groupsPerRow);  
                let col = i % groupsPerRow;  
    
                let x = col * horizontalSpacing;  
                let y = row * verticalSpacing; 
                return `translate(${x}, ${y})`;  
            });
    
        // For each platform, we will now create the bubbles
        platformGroups.each(function(platform) {
            let platformData = vis.displayData[platform];
    
            // Add the platform icon to the center of the group
            d3.select(this).append("image")
                .attr("class", "platform-icon")
                .attr("x", horizontalSpacing / 2 - 25)
                .attr("y", verticalSpacing / 2 - 25) 
                .attr("width", 50) 
                .attr("height", 50) 
                .attr("xlink:href", `images/application_icons/${platform}.png`);
    
            // Prepare the data for simulation (convert platformData to an array of objects)
            let simulationData = Object.keys(platformData).map(emotion => ({
                name: emotion,
                count: platformData[emotion],
                radius: sizeScale(platformData[emotion]), // Radius based on emotion count
                platform: platform, // Attach platform info to each bubble
            }));
    
            // Create the simulation for this platform's bubbles
            let platformSimulation = d3.forceSimulation(simulationData)
                .force("collide", d3.forceCollide(d => d.radius + 10)) // Prevent overlap using the radius + a little extra space
                .force("center", d3.forceCenter(horizontalSpacing / 2, verticalSpacing / 2)) // Keep each platform group centered within its space
                .force("radial", d3.forceRadial(100).strength(0.1)) // Apply a radial force pushing the bubbles away from the center
                .stop(); 
    
            // Bind data to the bubbles and create them inside the platform group
            let bubbles = d3.select(this).selectAll(".bubble")
                .data(simulationData)
                .join("circle")
                .attr("class", "bubble")
                .attr("r", d => d.radius) // Set the size based on emotion count
                .attr("fill", d => emotionColors[d.name]) // Set color based on the emotion
                .attr("opacity", 0.7) // Add opacity for better visualization
                .on("mouseover", function(event, d) {
                    // Show the tooltip when hovering over a circle
                    vis.tooltip.style("visibility", "visible")
                        .html(`Emotion: ${d.name}<br>Platform: ${d.platform}<br>Count: ${d.count}`);
                    d3.select(this).attr("opacity", 1); // Highlight the bubble on hover
                })
                .on("mousemove", function(event) {
                    // Position the tooltip based on the mouse position
                    vis.tooltip.style("top", (event.pageY + 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function() {
                    // Hide the tooltip when the mouse moves out
                    vis.tooltip.style("visibility", "hidden");
                    d3.select(this).attr("opacity", 0.7); // Reset opacity
                });
    
            // Update the simulation for this platform
            platformSimulation.nodes(simulationData).on("tick", function() {
                // During the simulation, update the position of each bubble
                bubbles
                    .attr("cx", d => d.x) // Use simulation's x position
                    .attr("cy", d => d.y); // Use simulation's y position
            });
    
            // Start the simulation for this platform
            platformSimulation.alpha(1).restart();
        });
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
