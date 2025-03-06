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

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;
        vis.countries = vis.svg.selectAll(".country")
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
                            .duration(1000)
                            .ease(d3.easeBounceOut)
                            .attr("r", d => radiusScale(d.avgScreenTime))
                            .attr("opacity", 0.7);

                        vis.svg.selectAll(".city-label")
                            .data(cityData.filter(d => cityCoords[d.city]))
                            .enter().append("text")
                            .attr("class", "city-label")
                            .attr("x", d => vis.projection(cityCoords[d.city])[0] + 5)
                            .attr("y", d => vis.projection(cityCoords[d.city])[1] - 5)
                            .attr("font-size", "12px")
                            .attr("fill", "black")
                            .attr("font-weight", "bold")
                            .attr("opacity", 0)
                            .text(d => `${d.city}: ${d.avgScreenTime.toFixed(2)}h`)
                            .transition()
                            .duration(1000)
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

}
