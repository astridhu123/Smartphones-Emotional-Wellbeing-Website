// Path to file: data\A pandemic of Mental Health\Reported Anxiety and Depression Symptoms\anx_and_dep\anx_or_dep_2019_vs_2020.csv

class PandemicHealthChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        // this.data_2019;
        // this.data_2020;

        let parseDate = d3.timeParse("%Y-%m-%d");

        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = { top: 20, right: 20, bottom: 20, left: 50};

        // vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.width = 600;
        vis.height = 500;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (vis.margin.left) + "," + vis.margin.top + ")"); 

        vis.tooltip = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0, 0, 0, 0.7)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("pointer-events", "none");

        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;
        
        // console.log("vis data", vis.data);

        // Filter data into separate arrays for 2019 and 2020
        vis.data_2019 = vis.data.filter(d => d.year === 2019);
        vis.data_2020 = vis.data.filter(d => d.year === 2020);

        // console.log("2020", vis.data_2020, "2019", vis.data_2019);
        
        // Call the updateVis function to update the visualization with the sorted data
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
    
        // Set up the scales
        let x0 = d3.scaleBand()
            .domain(["May", "June", "July", "August", "September", "October", "November", "December"])  // months
            .rangeRound([0, vis.width])
            .padding(0.1); 
    
        let x1 = d3.scaleBand()
            .domain([2019, 2020]) 
            .rangeRound([0, x0.bandwidth()]) 
            .padding(0.05); 
    
        let y = d3.scaleLinear()
            .domain([0, d3.max([...vis.data_2019, ...vis.data_2020], d => d.value)])  
            .nice()
            .range([vis.height, 0]);
    
        // Create axes
        vis.svg.append("g")
            .selectAll(".x-axis")
            .data([0]) 
            .join("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(" + 30 + "," + vis.height + ")") // Shift x-axis by 30px
            .call(d3.axisBottom(x0)); // X-axis for months
    
        vis.svg.append("g")
            .selectAll(".y-axis")
            .data([0]) 
            .join("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + 30 + ", 0)") // Shift y-axis by 30px
            .call(d3.axisLeft(y)); // Y-axis for values
    
        // Y-Axis label (before the y-axis, moved to the left)
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)  
            .attr("y", -vis.margin.left + 10)  
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Depression and Anxiety Score (DASS Scale)");
    
        // Bind the data and create the bars
        let months = ["May", "June", "July", "August", "September", "October", "November", "December"];
    
        let groupedData = months.map(month => {
            return {
                month: month,
                yearData: [  
                    {
                        year: 2019,
                        value: d3.mean(vis.data_2019.filter(d => d.month === month), d => d.value)  
                    },
                    {
                        year: 2020,
                        value: d3.mean(vis.data_2020.filter(d => d.month === month), d => d.value)
                    }
                ]
            };
        });
    
        // Create the bars for each group (2019 and 2020) for each month
        let bars = vis.svg.selectAll(".bar")
            .data(groupedData)
            .join("g")
            .attr("transform", d => "translate(" + (x0(d.month) + 30) + ", 0)"); // Shift bars by 30px
    
        // Tooltip
        const tooltip = vis.tooltip;
    
        bars.selectAll(".bar2019")
            .data(d => [d.yearData[0]]) 
            .join("rect")
            .attr("class", "bar2019")
            .attr("x", d => x1(d.year)) 
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => vis.height - y(d.value))
            .attr("fill", "steelblue") 
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html("Month: " + d3.select(this.parentNode).datum().month + "<br>Year: " + d.year + "<br>Value: " + d.value.toFixed(2))  // Access the month from the parent group data
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
    
        bars.selectAll(".bar2020")
            .data(d => [d.yearData[1]]) 
            .join("rect")
            .attr("class", "bar2020")
            .attr("x", d => x1(d.year)) 
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => vis.height - y(d.value))
            .attr("fill", "#D22B2B")
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html("Month: " + d3.select(this.parentNode).datum().month + "<br>Year: " + d.year + "<br>Value: " + d.value.toFixed(2))  // Access the month from the parent group data
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
    
        // Adding Legend (positioned at the top-right corner)
        let legend = vis.svg.append("g")
            .attr("transform", "translate(" + (vis.width - 555 + 30) + "," + 20 + ")"); // Shift the legend by 30px
    
        // Legend for 2019
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "steelblue");
    
        legend.append("text")
            .attr("x", 30)
            .attr("y", 15)
            .text("2019")
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    
        // Legend for 2020
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 25)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "#D22B2B");
    
        legend.append("text")
            .attr("x", 30)
            .attr("y", 40)
            .text("2020")
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    }
}