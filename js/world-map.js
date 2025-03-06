class MapVis {
    constructor(parentElement, geoData, data, datasetType) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.data = data;
        this.datasetType = datasetType; // 'dataset1' or 'dataset2'
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
            .on("mouseover", function(event, d) {
                d3.select("#mapTooltip")
                    .style("display", "block")
                    .html(`${d.properties.name}: ${vis.data[d.properties.name]} hours`);
            })
            .on("mousemove", function(event) {
                d3.select("#mapTooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                d3.select("#mapTooltip").style("display", "none");
            });
    }

    setColorScale() {
        let vis = this;

        if (vis.datasetType === 'dataset1') {
            let minVal = Math.min(...Object.values(vis.data));
            let maxVal = Math.max(...Object.values(vis.data));

            vis.colorScale = d3.scaleDiverging(d3.interpolateRdYlGn)
                .domain([maxVal,0, minVal]);
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
   /* focusOnUS() {
        let vis = this;

        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(usGeoData => {
            vis.usStates = topojson.feature(usGeoData, usGeoData.objects.states).features;

            let usProjection = d3.geoAlbersUsa();
            let usPath = d3.geoPath().projection(usProjection);

            // Fit the US projection to the screen
            usProjection.fitSize([vis.width, vis.height], topojson.feature(usGeoData, usGeoData.objects.states));

            let initialScale = vis.projection.scale();
            let initialTranslate = vis.projection.translate();
            let targetScale = usProjection.scale() * 1; // Slightly increase for zoom effect
            let targetTranslate = [vis.width * 2, vis.height / 0.45]; // Move camera to the left

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
                    vis.svg.selectAll(".country").remove();

                    vis.svg.selectAll(".state")
                        .data(vis.usStates)
                        .enter().append("path")
                        .attr("class", "state")
                        .attr("fill", "#d3d3d3")
                        .attr("stroke", "#333")
                        .attr("d", usPath)
                        .style("opacity", 0)
                        .transition()
                        .style("opacity", 1);
                });
        });
    }


*/
}
