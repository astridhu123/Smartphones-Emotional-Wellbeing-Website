class SearchTrendGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = { top: 50, right: 50, bottom: 50, left: 50 };
        vis.width = 1000 - vis.margin.left - vis.margin.right;
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

        // Define color scale
        vis.color = d3.scaleOrdinal(d3.schemeCategory10);

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

        // this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Group data by category
        let groupedData = d3.group(vis.displayData, d => d.category);
        
        // Convert grouped data to array format
        vis.processedData = Array.from(groupedData, ([key, values]) => ({
            category: key,
            values: values.map(d => ({ date: d.date, value: +d.Value }))
        }));

        // Flatten all dataset values to find global min/max
        let allValues = vis.displayData;

        // Set domains
        vis.x.domain(d3.extent(allValues, d => d.date));
        vis.y.domain([0, d3.max(allValues, d => d.Value)]);

        this.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update axes
        vis.xAxis.call(d3.axisBottom(vis.x));
        vis.yAxis.call(d3.axisLeft(vis.y));

        // Bind data and create lines
        let lines = vis.svg.selectAll(".line")
            .data(vis.processedData);

        lines.enter()
            .append("path")
            .attr("class", "line")
            .merge(lines)
            .attr("fill", "none")
            .attr("stroke", d => vis.color(d.category))
            .attr("stroke-width", 1.5)
            .attr("d", d => vis.line(d.values))
            .on("mouseover", function(event, d) {
                let line = d3.select(this);
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
                    
                    focusCircle.attr("cx", vis.x(closestData.date))
                        .attr("cy", vis.y(closestData.value));

                    vis.tooltip.transition().duration(200).style("opacity", 1);
                    vis.tooltip.html(`Date: ${closestData.date.toDateString()}<br>Category: ${d.category}<br>Value: ${closestData.value}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                });
            })
            .on("mouseout", function() {
                vis.svg.select(".focus-circle").remove();
                vis.tooltip.transition().duration(200).style("opacity", 0);
            });

        lines.exit().remove();
    }

    selectionChanged(newData) {
        let vis = this;
        vis.displayData = newData;
        vis.wrangleData();
    }
} 