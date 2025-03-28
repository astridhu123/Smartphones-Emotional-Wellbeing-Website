class BrushVis {
    constructor(parentElement, data, searchTrendGraph) {
        this.parentElement = parentElement;
        this.data = data;
        this.searchTrendGraph = searchTrendGraph; // Reference to main graph

        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = { top: 50, right: 200, bottom: 50, left: 50 };
        vis.width = 1050 - vis.margin.left - vis.margin.right;
        vis.height = 150 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);
        
        // Add title in the top-left corner (to the right of the Y-axis)
        vis.svg.append("text")
            .attr("class", "brush-title")
            .attr("x", -vis.margin.left + 10) // Adjust position relative to Y-axis
            .attr("y", -20) // Position above the brush chart
            .style("text-anchor", "start") // Align text to the left
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Adjust Timeline");


        // Define scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // Define axes
        vis.xAxis = vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height})`);
        
        // Add X-axis label
        vis.xAxisLabel = vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 5)
            .style("text-anchor", "middle")
            .text("Year");


        vis.yAxis = vis.svg.append("g");

        // Define area chart (for visualizing trends in the overview)
        vis.area = d3.area()
            .x(d => vis.x(d.date))
            .y0(vis.height)
            .y1(d => vis.y(d.value));

        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush end", function(event) {
                vis.brushed(event);
            });

        // Append brush group
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush")
            .call(vis.brush);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.x.domain(d3.extent(vis.data, d => d.date));
        vis.y.domain([0, d3.max(vis.data, d => d.value)]);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.xAxis.transition().duration(1000).call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(1000).call(d3.axisLeft(vis.y));

        let areaPath = vis.svg.selectAll(".area").data([vis.data]);

        areaPath.enter()
            .append("path")
            .attr("class", "area")
            .merge(areaPath)
            .transition().duration(800)
            .attr("fill", "steelblue")
            .attr("opacity", 0.6)
            .attr("d", vis.area);
    }

    brushed(event) {
        let vis = this;
    
        if (event.selection) {
            let [x0, x1] = event.selection.map(vis.x.invert);
            
            // Update the X-axis label to show the selected range
            vis.xAxisLabel.text(`${x0.getFullYear()} - ${x1.getFullYear()}`);

    
            // Get selected categories from toggles
            let selectedCategories = getActiveToggles();
    
            // Filter data based on brushed range and selected toggles
            let filteredData = vis.searchTrendGraph.data.filter(d =>
                d.date >= x0 && d.date <= x1 &&
                selectedCategories.includes(d.category)
            );
    
            // Update the search trends graph with the filtered data
            vis.searchTrendGraph.selectionChanged(filteredData);
        }
    }

    applyCurrentBrush() {
        let vis = this;
        let currentSelection = d3.brushSelection(vis.brushGroup.node());
    
        if (currentSelection) {
            vis.brushed({ selection: currentSelection });
        }
    }
}
