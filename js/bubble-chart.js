// Load and process data
Promise.all([
    d3.csv("data/mental_care/coun_or_therap_edu.csv"),
    d3.csv("data/mental_care/coun_or_therap_race.csv"),
    d3.csv("data/mental_care/coun_or_therap_gender.csv"),
    d3.csv("data/mental_care/coun_or_therap_age.csv")
]).then(function (files) {
    const [eduData, raceData, genderData, ageData] = files;
    console.log("Education Data:", eduData);
    console.log("Race Data:", raceData);
    console.log("Gender Data:", genderData);
    console.log("Age Data:", ageData);
    // Combine data into a single dataset
    const combinedData = eduData.map((edu, i) => ({
        education: edu.group,
        race: raceData[i].group,
        gender: genderData[i].group,
        age: ageData[i].group,
        value: +edu.value,
        period_end: edu.period_end
    }));

    // Initialize bubble chart
    renderBubbleChart(combinedData);

    // Add filter functionality
    document.getElementById("education-filter").addEventListener("change", function () {
        filterData(combinedData);
    });
    document.getElementById("age-filter").addEventListener("change", function () {
        filterData(combinedData);
    });

}).catch(function (error) {
    console.error("Error loading CSV files:", error);
});
function renderBubbleChart(data) {
    const margin = { top: 50, right: 50, bottom: 50, left: 350 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select("#bubble-chart").html("");

    // Create SVG container
    const svg = d3.select("#bubble-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.education))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.race))
        .range([height, 0])
        .padding(0.1);

    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.value)])
        .range([5, 30]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Add bubbles
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.education) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.race) + yScale.bandwidth() / 2)
        .attr("r", d => sizeScale(d.value))
        .attr("fill", d => colorScale(d.gender))
        .attr("opacity", 0.7)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("opacity", 1);
            tooltip.style("visibility", "visible")
                .html(`<strong>${d.education}</strong><br>${d.race}<br>Value: ${d.value}`);
        })
        .on("mousemove", function (event) {
            tooltip.style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("opacity", 0.7);
            tooltip.style("visibility", "hidden");
        });

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");
}

function filterData(data) {
    const educationFilter = document.getElementById("education-filter").value;
    const ageFilter = document.getElementById("age-filter").value;

    const filteredData = data.filter(d =>
        (educationFilter === "All" || d.education === educationFilter) &&
        (ageFilter === "All" || d.age === ageFilter)
    );

    renderBubbleChart(filteredData);
}