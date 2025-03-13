class WordCloud {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set up margins and dimensions
        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

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
            .attr("class", "wordcloud-tooltip")
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

        // Convert search volume to a numeric value
        vis.displayData = vis.data.map(d => ({
            text: d.Keyword,
            size: +d["Search Volume"],
            Search_Volume: +d["Search Volume"] // Ensure Search_Volume is correctly assigned
        }));

        // Update visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Define a color scale for random colors
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Define a size scale for word sizes
        const sizeScale = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d.size)])
            .range([10, 100]); // Adjust the range for word sizes

        // Layout for the word cloud
        const layout = d3.layout.cloud()
            .size([vis.width, vis.height]) // Use the width and height of the container
            .words(vis.displayData)
            .padding(5)
            .rotate(() => (Math.random() > 0.5 ? 0 : 90)) // Randomly rotate words
            .fontSize(d => sizeScale(d.size)) // Set font size based on search volume
            .on("end", words => vis.drawWords(words));

        // Start the layout
        layout.start();
    }

    drawWords(words) {
        let vis = this;

        // Clear existing words
        vis.svg.selectAll("text").remove();

        // Draw words
        vis.svg.selectAll("text")
            .data(words)
            .join("text")
            .style("font-size", d => `${d.size}px`)
            .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)]) // Random color
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x + vis.width / 2},${d.y + vis.height / 2})rotate(${d.rotate})`)
            .text(d => d.text)
            .on("mouseover", function (event, d) {
                // Show tooltip on hover
                vis.tooltip.style("visibility", "visible")
                    .html(`<strong>${d.text}</strong><br>Search Volume: ${d.Search_Volume}`);
            })
            .on("mousemove", function (event) {
                // Move tooltip with mouse
                vis.tooltip.style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                vis.tooltip.style("visibility", "hidden");
            });
        console.log("Word Positions:", words);
    }
}