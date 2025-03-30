class KeywordChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set up margins and dimensions
        vis.margin = { top: 120, right: 300, bottom: 90, left: 200 }; // Increase right margin
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right; // Decrease width
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // Create SVG container
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Initialize tooltip
        vis.tooltip = d3.select("body")
            .append("div")
            .attr("class", "chart-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("font-size", "12px");

        // Process data
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Group data by difficulty category
        vis.difficultyCounts = d3.rollup(
            vis.data,
            v => v.length,
            d => d["Difficulty(str)"]
        );

        // Convert to array for bar chart
        vis.barData = Array.from(vis.difficultyCounts, ([key, value]) => ({ difficulty: key, count: value }));

        // Define the desired order of difficulty categories
        vis.difficultyOrder = [
            "Easy",         // Less Established Websites
            "Okay",         // Somewhat Established Websites
            "Hard",         // Well-Established Websites
            "Very Hard"     // Very Well-Established Websites
        ];

        // Sort the barData array based on the defined order
        vis.barData.sort((a, b) => {
            return vis.difficultyOrder.indexOf(a.difficulty) - vis.difficultyOrder.indexOf(b.difficulty);
        });

        // Update visualization
        vis.updateBarChart();
    }

    updateBarChart() {
        let vis = this;

        // Clear existing content
        vis.svg.selectAll("*").remove();

        // Define scales
        const xScale = d3.scaleBand()
            .domain(vis.barData.map(d => d.difficulty)) // Use sorted data for the domain
            .range([0, vis.width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.barData, d => d.count)])
            .range([vis.height, 0]);

        // Add grid lines
        vis.svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yScale)
                .tickSize(-vis.width)
                .tickFormat(""))
            .attr("stroke-dasharray", "2,2")
            .attr("stroke", "#ddd");

        // Draw bars
        vis.svg.selectAll(".bar")
            .data(vis.barData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.difficulty))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => vis.height - yScale(d.count))
            .attr("fill", d => {
                switch (d.difficulty) {
                    case "Easy": return "#F1C40F";
                    case "Okay": return "#B09CFF";
                    case "Hard": return "#60BA46";
                    case "Very Hard": return "#14C7DE";
                }
            })
            .attr("rx", 5) // Rounded corners
            .attr("ry", 5);

        // Add labels on top of bars
        vis.svg.selectAll(".bar-label")
            .data(vis.barData)
            .join("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.difficulty) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.count) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(d => d.count);

        // Add axes
        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d => {
                    switch (d) {
                        case "Easy": return "Less Established Websites";
                        case "Okay": return "Somewhat Established Websites";
                        case "Hard": return "Well-Established Websites";
                        case "Very Hard": return "Very Well-Established Websites";
                    }
                }))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px");

        vis.svg.append("g")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("font-size", "12px");

        // Add axis titles
        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 80)
            .attr("text-anchor", "middle")
            .text("Website Establishment in Mental Health Coverage");

        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(0)")
            .attr("x", -vis.height / 3)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .text("Number of Keywords Searched");

        // Add chart title
        vis.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2)
            .attr("y", -80)
            .attr("text-anchor", "middle")
            .style("fill", "#2a4d69")
            .text("Total Keywords Searched by Website Establishment Level in Mental Health");

        // Add legend
        vis.createBarChartLegend();

    }

    updateScatterPlot() {
        let vis = this;

        // Clear existing content
        vis.svg.selectAll("*").remove();

        // Define scales
        const xScale = d3.scaleLinear()
            .domain([-5, 105])
            .range([0, vis.width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(vis.data, d => +d["Search Volume"]) * 0.1, d3.max(vis.data, d => +d["Search Volume"]) * 1.1])
            .range([vis.height, 0]);

        // Add grid lines
        vis.svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yScale)
                .tickSize(-vis.width)
                .tickFormat(""))
            .attr("stroke-dasharray", "2,2")
            .attr("stroke", "#ddd");

        // Draw points
        vis.svg.selectAll(".point")
            .data(vis.data)
            .join("circle")
            .attr("class", "point")
            .attr("cx", d => xScale(+d["Difficulty(num)"]))
            .attr("cy", d => yScale(+d["Search Volume"]))
            .attr("r", 10)
            .attr("stroke", "rgba(128,128,128,0.43)")
            .attr("stroke-width", 2)
            .attr("fill", d => {
                switch (d["Difficulty(str)"]) {
                    case "Easy": return "#F1C40F";
                    case "Okay": return "#B09CFF";
                    case "Hard": return "#60BA46";
                    case "Very Hard": return "#14C7DE";
                }
            })
            .on("mouseover", function (event, d) {
                let establishment;
                switch (d["Difficulty(str)"]) {
                    case "Easy": establishment = "Less Established Websites"; break;
                    case "Okay": establishment = "Somewhat Established Websites"; break;
                    case "Hard": establishment = "Well-Established Websites"; break;
                    case "Very Hard": establishment = "Very Well-Established Websites"; break;
                }
                vis.tooltip.style("visibility", "visible")
                    .html(`<strong>${d.Keyword}</strong><br>Search Volume: ${d["Search Volume"]}<br>Exist: ${establishment}`);
            })
            .on("mousemove", function (event) {
                vis.tooltip.style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function () {
                vis.tooltip.style("visibility", "hidden");
            });

        // Add axes
        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("font-size", "12px");

        vis.svg.append("g")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("font-size", "12px");

        // Add axis titles
        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 80)
            .attr("text-anchor", "middle")
            .text("Website Establishment in Mental Health Coverage (Scale 1-100)");

        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(0)")
            .attr("x", -vis.height / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .text("Search Volume");

        // Add chart title
        vis.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2)
            .attr("y", -80)
            .attr("text-anchor", "middle")
            .style("fill", "#2a4d69")
            .text("Mental Health Keyword Search Volume Across Website Establishment Levels");

        // Add legend
        vis.createScatterPlotLegend();
    }

    createBarChartLegend() {
        let vis = this;

        // Define legend data
        const legendData = [
            { label: "Less Established: Websites with low authority in mental health", color: "#F1C40F" },
            { label: "Somewhat Established: Websites with moderate authority", color: "#B09CFF" },
            { label: "Well-Established: Recognized websites with strong authority", color: "#60BA46" },
            { label: "Very Well-Established: Dominant websites with extensive authority", color: "#14C7DE" }
        ];


        // Create legend group
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width + 20}, 0)`);

        // Add legend items
        legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 60})`) // Increased spacing (changed 40 to 60)
            .each(function (d) {
                const item = d3.select(this);

                // Add rectangle (color indicator)
                item.append("rect")
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("fill", d.color)
                    .attr("y", 0); // Align rectangle with the text

                // Split the label into multiple lines
                const text = item.append("text")
                    .attr("x", 25) // Position text to the right of the rectangle
                    .attr("y", 12) // Align text with the rectangle
                    .style("font-size", "12px");

                const words = d.label.split(" ");
                let line = [];
                let lineNumber = 0;
                const lineHeight = 1.2; // Adjust line height as needed
                const maxWidth = 200; // Maximum width of each line (adjust as needed)

                words.forEach(word => {
                    line.push(word);
                    const testLine = line.join(" ");
                    const testText = text.append("tspan").text(testLine);
                    if (testText.node().getComputedTextLength() > maxWidth) {
                        line.pop(); // Remove the last word that caused the overflow
                        text.append("tspan")
                            .attr("x", 25) // Align wrapped lines with the first line
                            .attr("dy", `${lineHeight}em`)
                            .text(line.join(" "));
                        line = [word]; // Start a new line with the current word
                        lineNumber++;
                    }
                    testText.remove();
                });

                // Add the remaining words as the last line
                text.append("tspan")
                    .attr("x", 25)
                    .attr("dy", `${lineHeight}em`)
                    .text(line.join(" "));
            });
    }
    createScatterPlotLegend() {
        let vis = this;

        // Define legend data

        const legendData = [
            { label: "1-25: Less Established Websites", color: "#F1C40F" },
            { label: "26-50: Somewhat Established Websites", color: "#B09CFF" },
            { label: "51-75: Well-Established Websites", color: "#60BA46" },
            { label: "76-100: Very Well-Established Websites", color: "#14C7DE" }
        ];

        // Create legend group
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width + 20}, 0)`);

        // Add legend items
        legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 30})`)
            .each(function (d) {
                const item = d3.select(this);
                item.append("circle")
                    .attr("r", 10)
                    .attr("fill", d.color);
                item.append("text")
                    .attr("x", 15)
                    .attr("y", 10)
                    .text(d.label)
                    .style("font-size", "12px");
            });
    }
}
