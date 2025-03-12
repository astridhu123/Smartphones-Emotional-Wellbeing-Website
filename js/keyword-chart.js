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
        vis.margin = { top: 120, right: 200, bottom: 90, left: 200 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
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
    }
}