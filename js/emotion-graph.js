class EmotionGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement
        this.data = data
        this.filteredData = data
        this.chartState = "bubble"
        this.emotionColors = {
            "Sadness": "#0000FF",
            "Anger": "#FF0000",
            "Anxiety": "#FFA500",
            "Neutral": "#90EE90",
            "Happiness": "#FFB6C1",
            "Boredom": "#D3D3D3"
        }
        this.initVis()
    }
    initVis() {
        let vis = this
        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 }
        vis.width = 1000
        vis.height = 700
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
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
            .style("pointer-events", "none")
        d3.select("#toggleViewButton").on("click", function() {
            vis.chartState = vis.chartState === "bubble" ? "bar" : "bubble"
            d3.select(this).text(vis.chartState === "bubble" ? "Switch to Bar Chart" : "Switch to Bubble Chart")
            vis.updateVis()
        })
        vis.wrangleData()
    }
    wrangleData() {
        let vis = this
        let emotionCountByPlatform = {}
        vis.filteredData.forEach(d => {
            let platform = d.Platform
            let emotion = d.Dominant_Emotion
            if (!emotionCountByPlatform[platform]) {
                emotionCountByPlatform[platform] = {}
            }
            if (!emotionCountByPlatform[platform][emotion]) {
                emotionCountByPlatform[platform][emotion] = 0
            }
            emotionCountByPlatform[platform][emotion]++
        })
        vis.aggregatedData = emotionCountByPlatform
        vis.updateVis()
    }
    updateVis() {
        let vis = this
        if (vis.chartState === "bubble") {
            let sizeScale = d3.scaleSqrt()
                .domain([0, d3.max(Object.values(vis.aggregatedData).flatMap(d => Object.values(d)))])
                .range([5, 50])
            let platforms = Object.keys(vis.aggregatedData)
            let groupsPerRow = 3
            let totalRows = Math.ceil(platforms.length / groupsPerRow)
            let horizontalSpacing = vis.width / groupsPerRow
            let verticalSpacing = vis.height / totalRows
            let platformGroups = vis.svg.selectAll(".platform-group")
                .data(platforms, d => d)
                .join(
                    enter => enter.append("g")
                        .attr("class", "platform-group")
                        .attr("transform", (d, i) => {
                            let row = Math.floor(i / groupsPerRow)
                            let col = i % groupsPerRow
                            let x = col * horizontalSpacing
                            let y = row * verticalSpacing
                            return `translate(${x}, ${y})`
                        })
                        .style("opacity", 0)
                        .call(enter => enter.transition().duration(1000).style("opacity", 1)),
                    update => update.transition().duration(1000).attr("transform", (d, i) => {
                        let row = Math.floor(i / groupsPerRow)
                        let col = i % groupsPerRow
                        let x = col * horizontalSpacing
                        let y = row * verticalSpacing
                        return `translate(${x}, ${y})`
                    }),
                    exit => exit.transition().duration(1000).style("opacity", 0).remove()
                )
            platformGroups.each(function(d) {
                let group = d3.select(this)
                let icon = group.selectAll(".platform-icon")
                if (icon.empty()) {
                    group.append("image")
                        .attr("class", "platform-icon")
                        .attr("x", horizontalSpacing / 2 - 25)
                        .attr("y", verticalSpacing / 2 - 25)
                        .attr("width", 50)
                        .attr("height", 50)
                        .attr("xlink:href", d => `images/application_icons/${d}.png`)
                } else {
                    icon.transition().duration(1000)
                        .attr("x", horizontalSpacing / 2 - 25)
                        .attr("y", verticalSpacing / 2 - 25)
                }
            })
            platformGroups.selectAll(".bar-segment").remove()
            platformGroups.each(function(platform) {
                let group = d3.select(this)
                let platformData = vis.aggregatedData[platform]
                let simData = Object.keys(platformData).map(e => ({
                    emotion: e,
                    count: platformData[e],
                    radius: sizeScale(platformData[e]),
                    platform: platform
                }))
                let sim = d3.forceSimulation(simData)
                    .force("collide", d3.forceCollide(d => d.radius + 10))
                    .force("center", d3.forceCenter(horizontalSpacing / 2, verticalSpacing / 2))
                    .force("radial", d3.forceRadial(60).strength(0.1))
                    .stop()
                for (let i = 0; i < 120; i++) sim.tick()
                let bubbles = group.selectAll(".bubble")
                    .data(simData, d => d.emotion)
                    .join("rect")
                    .attr("class", "bubble")
                    .attr("fill", d => vis.emotionColors[d.emotion])
                    .attr("opacity", 0.7)
                    .on("mouseover", function(event, d) {
                        vis.tooltip.style("visibility", "visible")
                            .html(`Emotion: ${d.emotion}<br>Platform: ${d.platform}<br>Count: ${d.count}`)
                        d3.select(this).attr("opacity", 1)
                    })
                    .on("mousemove", function(event) {
                        vis.tooltip
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY + 10) + "px")
                    })
                    .on("mouseout", function() {
                        vis.tooltip.style("visibility", "hidden")
                        d3.select(this).attr("opacity", 0.7)
                    })
                bubbles.transition().duration(1000)
                    .attr("x", d => d.x - d.radius)
                    .attr("y", d => d.y - d.radius)
                    .attr("width", d => 2 * d.radius)
                    .attr("height", d => 2 * d.radius)
                    .attr("rx", d => d.radius)
                    .attr("ry", d => d.radius)
            })
            vis.svg.selectAll(".axisGroup").remove()
        } else {
            let barChartHeight = vis.height * 0.6
            let barChartWidth = vis.width * 0.7
            let xOffset = (vis.width - barChartWidth) / 2
            let barData = []
            let allEmotions = Object.keys(vis.emotionColors)
            Object.keys(vis.aggregatedData).forEach(platform => {
                let row = { platform: platform }
                let total = 0
                allEmotions.forEach(e => { total += vis.aggregatedData[platform][e] || 0 })
                allEmotions.forEach(e => { row[e] = total ? (vis.aggregatedData[platform][e] || 0) / total : 0 })
                barData.push(row)
            })
            let stackGen = d3.stack().keys(allEmotions)
            let series = stackGen(barData)
            let xScale = d3.scaleLinear().domain([0, 1]).range([0, barChartWidth])
            let yScale = d3.scaleBand().domain(barData.map(d => d.platform)).range([0, barChartHeight]).padding(0.2)
            let segmentPositions = {}
            series.forEach(layer => {
                layer.forEach((seg, i) => {
                    let platform = seg.data.platform
                    segmentPositions[platform + "_" + layer.key] = {
                        x: xScale(seg[0]),
                        width: xScale(seg[1]) - xScale(seg[0])
                    }
                })
            })
            let platformGroups = vis.svg.selectAll(".platform-group")
                .data(barData.map(d => d.platform), d => d)
                .join(
                    enter => enter.append("g")
                        .attr("class", "platform-group")
                        .attr("transform", d => `translate(${xOffset}, ${yScale(d)})`)
                        .style("opacity", 0)
                        .call(enter => enter.transition().duration(1000).style("opacity", 1)),
                    update => update.transition().duration(1000).attr("transform", d => `translate(${xOffset}, ${yScale(d)})`),
                    exit => exit.transition().duration(1000).style("opacity", 0).remove()
                )
            platformGroups.each(function(platform) {
                let group = d3.select(this)
                if (group.selectAll(".platform-icon").empty()) {
                    group.append("image")
                        .attr("class", "platform-icon")
                        .attr("xlink:href", `images/application_icons/${platform}.png`)
                        .attr("width", 50)
                        .attr("height", 50)
                }
            })
            platformGroups.selectAll(".platform-icon")
                .transition().duration(1000)
                .attr("x", -60)
                .attr("y", yScale.bandwidth() / 2 - 25)
            platformGroups.each(function(platform) {
                let group = d3.select(this)
                let platformData = vis.aggregatedData[platform]
                let simData = Object.keys(platformData).map(e => ({
                    emotion: e,
                    count: platformData[e],
                    platform: platform
                }))
                let bubbles = group.selectAll(".bubble")
                    .data(simData, d => d.emotion)
                    .join("rect")
                    .attr("class", "bubble")
                    .attr("fill", d => vis.emotionColors[d.emotion])
                    .attr("opacity", 0.7)
                bubbles.transition().duration(1000)
                    .attr("x", function(d) {
                        let pos = segmentPositions[d.platform + "_" + d.emotion]
                        return pos ? pos.x : 0
                    })
                    .attr("y", 0)
                    .attr("width", function(d) {
                        let pos = segmentPositions[d.platform + "_" + d.emotion]
                        return pos ? pos.width : 0
                    })
                    .attr("height", yScale.bandwidth())
                    .attr("rx", 0)
                    .attr("ry", 0)
                    .on("end", function(d) {
                        d3.select(this)
                            .on("mouseover", function(event, d) {
                                let counts = vis.aggregatedData[d.platform]
                                let total = 0
                                Object.keys(counts).forEach(key => { total += counts[key] })
                                let perc = total ? (counts[d.emotion] / total) : 0
                                vis.tooltip.style("visibility", "visible")
                                    .html(`Emotion: ${d.emotion}<br>Platform: ${d.platform}<br>Percentage: ${(perc * 100).toFixed(1)}%`)
                                d3.select(this).attr("opacity", 1)
                            })
                            .on("mouseout", function() {
                                vis.tooltip.style("visibility", "hidden")
                                d3.select(this).attr("opacity", 0.7)
                            })
                    })
            })
            vis.svg.selectAll(".axisGroup").remove()
            let xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0%"))
            vis.svg.append("g")
                .attr("class", "axisGroup")
                .attr("transform", `translate(${xOffset}, ${barChartHeight})`)
                .call(xAxis)
            let yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(50)
            let yAxisGroup = vis.svg.append("g")
                .attr("class", "axisGroup")
                .attr("transform", `translate(${xOffset}, 0)`)
                .call(yAxis)
            yAxisGroup.selectAll("text").remove()
        }
    }
    selectionChanged(newData) {
        let vis = this
        vis.filteredData = newData
        vis.wrangleData()
    }
}
