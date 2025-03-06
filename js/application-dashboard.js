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
            .domain([0, d3.max(Object.values(vis.displayData).flatMap(platformData => Object.values(platformData)))])  // Get the max emotion count across all platforms
            .range([5, 50]); // Minimum and maximum bubble sizes
        
        // Create a force simulation for all the platforms
        let simulation = d3.forceSimulation()
            .force("collide", d3.forceCollide(d => d.radius + 10)) // Prevent overlap using the radius + a little extra space
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2)) // Keep the bubbles centered
            .stop(); // Stop the simulation after a fixed number of ticks for performance
        
        // Create a group for each platform
        let platforms = Object.keys(vis.displayData); // Get all platforms
        let platformGroups = vis.svg.selectAll(".platform-group")
            .data(platforms)
            .join("g")
            .attr("class", "platform-group")
            .attr("transform", (d, i) => `translate(0, ${i * (vis.height / platforms.length)})`); // Vertically space out groups for each platform
        
        // For each platform, we will now create the bubbles
        platformGroups.each(function(platform) {
            let platformData = vis.displayData[platform];
            
            // Add the platform icon to the center of the group
            d3.select(this).append("image")
                .attr("class", "platform-icon")
                .attr("x", vis.width / 2 - 25) // Center the icon horizontally
                .attr("y", vis.height / (platforms.length + 1) - 25) // Center the icon vertically
                .attr("width", 50) // Icon width
                .attr("height", 50) // Icon height
                .attr("xlink:href", `images/application_icons/${platform}.png`); // Icon path, assumes icons are named exactly after the platform
            
            // Prepare the data for simulation (convert platformData to an array of objects)
            let simulationData = Object.keys(platformData).map(emotion => ({
                name: emotion,
                count: platformData[emotion],
                angle: Math.random() * 2 * Math.PI, // Random initial angle for circular layout
                radius: sizeScale(platformData[emotion]), // Radius based on emotion count
                platform: platform, // Attach platform info to each bubble
            }));
            
            // Create the simulation for this platform's bubbles
            let platformSimulation = d3.forceSimulation(simulationData)
                .force("collide", d3.forceCollide(d => d.radius + 10)) // Prevent overlap using the radius + a little extra space
                .force("center", d3.forceCenter(vis.width / 2, vis.height / (platforms.length + 1))) // Keep each platform group centered
                .stop(); // Stop the simulation after a fixed number of ticks for performance
            
            // Bind data to the bubbles and create them inside the platform group
            let bubbles = d3.select(this).selectAll(".bubble")
                .data(simulationData)
                .join("circle")
                .attr("class", "bubble")
                .attr("cx", d => vis.width / 2 + d.radius * Math.cos(d.angle)) // Use polar coordinates (angle and radius) for circular placement
                .attr("cy", d => vis.height / (platforms.length + 1) + d.radius * Math.sin(d.angle)) // Same as above
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
                    .attr("cx", d => vis.width / 2 + d.radius * Math.cos(d.angle))
                    .attr("cy", d => vis.height / (platforms.length + 1) + d.radius * Math.sin(d.angle));
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

        vis.data = newData;
        console.log(vis.displayData);

        this.wrangleData();
    }
}
