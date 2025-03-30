let hoverFlag = true;

class MapVis {
    constructor(parentElement, geoData, data, datasetType) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.data = data;
        this.datasetType = datasetType;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = 960;
        vis.height = 500;
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.projection = d3.geoNaturalEarth1()
            .scale(150)
            .translate([vis.width / 2, vis.height / 2]);

        vis.path = d3.geoPath().projection(vis.projection);

        vis.setColorScale();

        vis.zoomGroup = vis.svg.append("g").attr("class", "zoom-group");
        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;
        vis.countries = vis.zoomGroup.selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", vis.path)
            .attr("fill", d => vis.data[d.properties.name] ? vis.colorScale(vis.data[d.properties.name]) : "#ccc")
            .attr("stroke", "#333")
            .attr("stroke-width", "0.5px")
            .on("mouseover", function (event, d) {
                if (hoverFlag) {
                    let value = vis.data[d.properties.name];

                    if (value !== undefined) {
                        d3.select(this).attr("stroke-width", "2px");

                        let unit = vis.datasetType === 'dataset2' ? "minutes" : "hours";
                        let formattedValue = (vis.datasetType === 'dataset2' && value > 0) ? `+${value}` : value;

                        d3.select("#mapTooltip")
                            .style("display", "block")
                            .html(`${d.properties.name}: ${formattedValue} ${unit}`);
                    }
                }
            })
            .on("mousemove", function (event) {
                if (hoverFlag) {
                    if (d3.select("#mapTooltip").style("display") === "block") {
                        d3.select("#mapTooltip")
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px");
                    }
                }
            })
            .on("mouseout", function () {
                if (hoverFlag) {
                    d3.select(this).attr("stroke-width", "0.5px");
                    d3.select("#mapTooltip").style("display", "none");
                }
            });
       this.drawLegend('dataset1', countryData1);
        vis.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                vis.zoomGroup.attr("transform", event.transform);

                const isWorldView = step === 0 || step === 4;
                const isZoomed = event.transform.k !== 1 ||
                    event.transform.x !== 0 ||
                    event.transform.y !== 0;

                d3.select("#resetZoomBtn")
                    .style("display", isWorldView && isZoomed ? "flex" : "none");
            });


        vis.svg.call(vis.zoom);
    }

    setColorScale() {
        let vis = this;

        if (vis.datasetType === 'dataset2') {
            let minVal = Math.min(...Object.values(vis.data));
            let maxVal = Math.max(...Object.values(vis.data));

            vis.colorScale = d3.scaleDiverging(d3.interpolateRdYlGn)
                .domain([maxVal, 0, minVal]);
        } else {
            let minVal = Math.min(...Object.values(vis.data));
            let maxVal = Math.max(...Object.values(vis.data));

            vis.colorScale = d3.scaleSequential(d3.interpolateBlues)
                .domain([minVal, maxVal]);
        }
    }

    updateData(newData, datasetType) {
        let vis = this;
        vis.data = newData;
        vis.datasetType = datasetType;
        vis.setColorScale();

        vis.countries.transition()
            .duration(1000)
            .attr("fill", d => vis.data[d.properties.name] ? vis.colorScale(vis.data[d.properties.name]) : "#ccc");
    }

    focusOnUS() {
        let vis = this;

        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(usGeoData => {
            vis.usStates = topojson.feature(usGeoData, usGeoData.objects.states).features;

            let usProjection = d3.geoAlbersUsa();

            usProjection.fitSize([vis.width, vis.height], topojson.feature(usGeoData, usGeoData.objects.states));

            let initialScale = vis.projection.scale();
            let initialTranslate = vis.projection.translate();
            let targetScale = usProjection.scale() * 1;
            let targetTranslate = [vis.width * 2, vis.height / 0.5];

            d3.transition()
                .duration(1500)
                .tween("zoom", () => {
                    let scaleInterpolator = d3.interpolate(initialScale, targetScale);
                    let translateInterpolator = d3.interpolate(initialTranslate, targetTranslate);

                    return t => {
                        vis.projection.scale(scaleInterpolator(t)).translate(translateInterpolator(t));
                        vis.path = d3.geoPath().projection(vis.projection);
                        vis.svg.selectAll(".country").attr("d", vis.path);
                    };
                })
                .on("end", () => {
                    vis.zoomedToUS = true;
                    hoverFlag = false;
                    d3.csv("data/kaggle smartphone metrics/mobile_usage_behavioral_analysis.csv").then(data => {

                        let cityData = d3.rollups(
                            data,
                            v => d3.mean(v, d => +d.Daily_Screen_Time_Hours),
                            d => d.Location
                        );

                        cityData = cityData.map(d => ({
                            city: d[0],
                            avgScreenTime: d[1]
                        }));

                        let cityCoords = {
                            "New York": [-74.006, 40.7128],
                            "Los Angeles": [-118.2437, 34.0522],
                            "Chicago": [-87.6298, 41.8781],
                            "Houston": [-95.3698, 29.7604],
                            "Phoenix": [-112.074, 33.4484]
                        };

                        let maxScreenTime = d3.max(cityData, d => d.avgScreenTime);
                        let minScreenTime = d3.min(cityData, d => d.avgScreenTime);

                        vis.drawCircleLegend(minScreenTime, maxScreenTime);

                        let radiusScale = d3.scaleSqrt()
                            .domain([minScreenTime, maxScreenTime])
                            .range([15, 30]);


                        vis.svg.selectAll(".city-dot")
                            .data(cityData.filter(d => cityCoords[d.city]))
                            .enter().append("circle")
                            .attr("class", "city-dot")
                            .attr("cx", d => vis.projection(cityCoords[d.city])[0])
                            .attr("cy", d => vis.projection(cityCoords[d.city])[1])
                            .attr("r", 0)
                            .attr("fill", "red")
                            .attr("opacity", 0)
                            .transition()
                            .duration(500)
                            .ease(d3.easeBounceOut)
                            .attr("r", d => radiusScale(d.avgScreenTime))
                            .attr("opacity", 0.7);

                        vis.svg.selectAll(".city-center-dot")
                            .data(cityData.filter(d => cityCoords[d.city]))
                            .enter().append("circle")
                            .attr("class", "city-center-dot")
                            .attr("cx", d => vis.projection(cityCoords[d.city])[0])
                            .attr("cy", d => vis.projection(cityCoords[d.city])[1])
                            .attr("r", 3)
                            .attr("fill", "black")
                            .attr("stroke", "white")
                            .attr("stroke-width", 1)
                            .attr("opacity", 0)
                            .transition()
                            .duration(500)
                            .attr("opacity", 1);

                        vis.svg.selectAll(".city-label")
                            .data(cityData.filter(d => cityCoords[d.city]))
                            .enter().append("text")
                            .attr("class", "city-label")
                            .attr("x", d => {
                                const [x] = vis.projection(cityCoords[d.city]);
                                const r = radiusScale(d.avgScreenTime);

                                if (d.city === "Los Angeles") return x - r - 40;
                                if (d.city === "Phoenix") return x + r + 8;
                                return x + r + 5;
                            })
                            .attr("y", d => {
                                const [, y] = vis.projection(cityCoords[d.city]);
                                const r = radiusScale(d.avgScreenTime);

                                if (d.city === "Los Angeles") return y + r;
                                if (d.city === "Phoenix") return y - r - 5;
                                return y - r - 2;
                            })

                            .attr("font-size", "16px")
                            .attr("font-weight", "bold")
                            .attr("fill", "white")
                            .attr("stroke", "black")
                            .attr("stroke-width", 6)
                            .attr("paint-order", "stroke")
                            .attr("opacity", 0)
                            .text(d => `${d.city}: ${d.avgScreenTime.toFixed(2)}h`)
                            .transition()
                            .duration(500)
                            .delay(300)
                            .attr("opacity", 1);
                    });
                });
        });
    }

    resetZoom() {
        let vis = this;

        let initialScale = vis.projection.scale();
        let initialTranslate = vis.projection.translate();
        let worldScale = 150;
        let worldTranslate = [vis.width / 2, vis.height / 2];

        d3.transition()
            .duration(1500)
            .tween("zoom", () => {
                let scaleInterpolator = d3.interpolate(initialScale, worldScale);
                let translateInterpolator = d3.interpolate(initialTranslate, worldTranslate);

                return t => {
                    vis.projection.scale(scaleInterpolator(t)).translate(translateInterpolator(t));
                    vis.path = d3.geoPath().projection(vis.projection);
                    vis.svg.selectAll(".country").attr("d", vis.path);
                };
            })
            .on("end", () => {
                vis.zoomedToUS = false;
                hoverFlag = true;
            });
    }
    resetZoom2() {
        let vis = this;

        vis.svg.transition()
            .duration(750)
            .call(vis.zoom.transform, d3.zoomIdentity)
            .on("end", () => {
                d3.select("#resetZoomBtn").style("display", "none");
            });
    }

    drawLegend(datasetType, data) {
        let vis = this;

        // Remove existing legends and defs
        vis.svg.selectAll(".legend").remove();
        vis.svg.selectAll("defs").remove();

        const legendWidth = 150, legendHeight = 10;

        const legendGroup = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width - legendWidth - 40}, ${vis.height - 20})`);

        const defs = vis.svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient");

        let colorScale, titleText;

        if (datasetType === 'dataset1') {
            colorScale = d3.interpolateBlues;
            titleText = "Daily Screen Time (hours)";
        } else {
            colorScale = d3.interpolateRdYlGn;
            titleText = "Change in Screen Time (minutes)";
        }

        linearGradient.selectAll("stop")
            .data([
                { offset: "0%", color: colorScale(0) },
                { offset: "50%", color: colorScale(0.5) },
                { offset: "100%", color: colorScale(1) }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        legendGroup.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)")
            .style("stroke", "#333")
            .style("stroke-width", "0.5px");

        const minVal = Math.min(...Object.values(data));
        const maxVal = Math.max(...Object.values(data));

        // Min label (left)
        legendGroup.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .attr("fill", "#000")
            .attr("font-size", "11px")
            .text(datasetType === 'dataset1' ? `${minVal.toFixed(1)}h` : `${maxVal > 0 ? '+' : ''}${maxVal}m`);

        // Max label (right)
        legendGroup.append("text")
            .attr("x", legendWidth)
            .attr("y", -5)
            .attr("fill", "#000")
            .attr("font-size", "11px")
            .attr("text-anchor", "end")
            .text(datasetType === 'dataset1' ? `${maxVal.toFixed(1)}h` : `${minVal}m`);

        // Title
        legendGroup.append("text")
            .attr("x", legendWidth / 2)
            .attr("y", -20)
            .attr("fill", "#000")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .text(titleText);
    }


    removeLegend() {
        this.svg.selectAll(".legend").remove();
        this.svg.selectAll("defs").remove();
    }
    zoomToJapan() {
        let vis = this;
        const japanCoords = [138.2529, 36.2048];
        const scale = 4;
        const [x, y] = vis.projection(japanCoords);

        const translate = [vis.width / 2 - x * scale, vis.height / 2 - y * scale];

        vis.svg.transition()
            .duration(1500)
            .call(
                vis.zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }
    highlightCountry(countryName) {
        let vis = this;

        vis.svg.selectAll(".country")
            .attr("stroke", d => d.properties.name === countryName ? "red" : "#333")
            .attr("stroke-width", d.properties.name === countryName ? "1px": "0.5px");
    }
    unhighlightCountries() {
        let vis = this;

        vis.svg.selectAll(".country")
            .attr("stroke", "#333")
            .attr("stroke-width", "0.5px");
    }
    zoomToSouthAfrica() {
        let vis = this;

        const southAfricaCoords = [22.9375, -30.5595];
        const scale = 4;

        const [x, y] = vis.projection(southAfricaCoords);
        const translate = [vis.width / 2 - x * scale, vis.height / 2 - y * scale];

        vis.svg.transition()
            .duration(1500)
            .call(
                vis.zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }

    drawCircleLegend(minVal, maxVal) {
        let vis = this;

        vis.svg.selectAll(".circle-legend").remove();

        const legendGroup = vis.svg.append("g")
            .attr("class", "circle-legend")
            .attr("transform", `translate(${vis.width - 160}, ${vis.height - 180})`);

        legendGroup.append("text")
            .text("Average Screen Time")
            .attr("x", 0)
            .attr("y", 0)
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        const radiusScale = d3.scaleSqrt()
            .domain([minVal, maxVal])
            .range([15, 30]);

        const valuesToShow = [minVal, (minVal + maxVal) / 2, maxVal].map(d => +d.toFixed(1));
        const yStart = 40;

        valuesToShow.forEach((value, i) => {
            const r = radiusScale(value);
            const yOffset = yStart + i * 1.8 * r;

            legendGroup.append("circle")
                .attr("cx", 30)
                .attr("cy", yOffset)
                .attr("r", r)
                .attr("fill", "red")
                .attr("opacity", 0.7);

            legendGroup.append("text")
                .attr("x", 70)
                .attr("y", yOffset + 5)
                .attr("font-size", "11px")
                .text(`${value.toFixed(2)}h`);
        });
    }
    setZoomEnabled(enabled) {
        let vis = this;

        vis.svg.on(".zoom", null);

        if (enabled) {
            vis.svg.call(vis.zoom);
        }
    }
    removeCircleLegend() {
        this.svg.selectAll(".circle-legend").remove();
        this.svg.selectAll(".city-center-dot").remove();
    }
}
