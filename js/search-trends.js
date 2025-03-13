class SearchTrendGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.datasetNames = [
            "Depression", 
            "Anxiety", 
            "Counselling",  
            "Mental_Health_Support", 
            "Loneliness",
            "Mental_Illness", 
            "Pandemic", 
            "Screen_Time"
        ];

        // Define a consistent color mapping
        this.color = d3.scaleOrdinal()
            .domain(this.datasetNames)
            .range(d3.schemeCategory10);

        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = { top: 50, right: 200, bottom: 50, left: 50 };
        vis.width = 1050 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Define scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // Define axes
        vis.xAxis = vis.svg.append("g").attr("transform", `translate(0,${vis.height})`);
        vis.yAxis = vis.svg.append("g");

        // Add X and Y axis labels
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 5)
            .style("text-anchor", "middle")
            .text("Year");

        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 20)
            .style("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Relative Search Interest");

        // Define line generator
        vis.line = d3.line()
            .x(d => vis.x(d.date))
            .y(d => vis.y(d.value));

        // Tooltip setup
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("padding", "8px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        // Create legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width + 30}, 10)`);

        vis.datasetNames.forEach((name, i) => {
            let legendRow = vis.legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", vis.color(name));

            legendRow.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .text(name)
                .attr("font-size", "12px")
                .attr("alignment-baseline", "middle");
        });
        // this.wrangleData();
    }

    wrangleData() {
        let vis = this;
        let groupedData = d3.group(vis.displayData, d => d.category);
        vis.processedData = Array.from(groupedData, ([key, values]) => ({
            category: key,
            values: values.map(d => ({ date: d.date, value: +d.Value }))
        }));

        let allValues = vis.displayData;
        vis.x.domain(d3.extent(allValues, d => d.date));
        vis.y.domain([0, d3.max(allValues, d => d.Value)]);

        this.updateVis();
    }

    updateVis() {
        let vis = this;
    
        vis.xAxis.transition().duration(1000).call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(1000).call(d3.axisLeft(vis.y));
    
        let lines = vis.svg.selectAll(".line")
            .data(vis.processedData);

        // For new lines (enter)
        lines.enter()
            .append("path")
            .attr("class", "line")
            .merge(lines)
            .transition().duration(800)
            .attr("fill", "none")
            .attr("stroke", d => vis.color(d.category))
            .attr("stroke-width", 3)
            .attr("d", d => vis.line(d.values));

        // For exiting lines (remove with transition)
        lines.exit()
            .transition().duration(800)
            .style("opacity", 0)  
            .remove();  

        // Remove old circles
        vis.svg.selectAll(".focus-circle").remove();
    
        // Add event listeners for tooltips
        vis.svg.selectAll(".line")
            .on("mouseover", function(event, d) {
                let line = d3.select(this);
                
                // Create a focus circle for each line
                let focusCircle = vis.svg.append("circle")
                    .attr("class", "focus-circle")
                    .attr("r", 4)
                    .attr("fill", vis.color(d.category))
                    .style("display", "block");
    
                vis.svg.on("mousemove", function(event) {
                    let [mouseX] = d3.pointer(event);
                    let xDate = vis.x.invert(mouseX);
    
                    let closestData = d.values.reduce((a, b) => {
                        return Math.abs(b.date - xDate) < Math.abs(a.date - xDate) ? b : a;
                    });
    
                    focusCircle
                        .attr("cx", vis.x(closestData.date))
                        .attr("cy", vis.y(closestData.value));
    
                    vis.tooltip.transition().duration(200).style("opacity", 1);
                    vis.tooltip.html(`Date: ${closestData.date.toDateString()}<br>Search Term: ${d.category}<br>Relative Search Interest: ${closestData.value}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                });
            })
            .on("mouseout", function() {
                vis.svg.select(".focus-circle").remove();
                vis.tooltip.transition().duration(200).style("opacity", 0);
            });
    }
    
    selectionChanged(newData) {
        let vis = this;
        vis.displayData = newData;
        vis.wrangleData();
    }
}