let step = 0;
const totalSteps = 5;

function updateSlideCounter() {
    const counterEl = document.getElementById("slideCounter");
    const prevBtn = document.getElementById("prevButton");
    const nextBtn = document.getElementById("nextButton");

    counterEl.textContent = `${step + 1} of ${totalSteps}`;

    if (step === 0) {
        prevBtn.disabled = true;
        prevBtn.classList.add("disabled");
    } else {
        prevBtn.disabled = false;
        prevBtn.classList.remove("disabled");
    }

    if (step === totalSteps -1) {
        nextBtn.disabled = true;
        nextBtn.classList.remove("disabled");
    } else {
        nextBtn.disabled = false;
        nextBtn.classList.remove("disabled");
    }
}


document.getElementById("nextButton").addEventListener("click", () => {
    step = (step + 1) % totalSteps;
    updateSlideCounter();
    executeStep(false);
});

document.getElementById("prevButton").addEventListener("click", () => {
    step = (step - 1 + totalSteps) % totalSteps;
    updateSlideCounter();
    executeStep(true);
});
document.addEventListener("DOMContentLoaded", function () {
    updateSlideCounter();
    if (mapVisInstance) {
        showWorldAverage();
        let descriptionBox = d3.select("#map-description");
        descriptionBox.html(`
            <p>On average users aged 16 to 64 worldwide spent <b>6 hours and 40 minutes</b> per day on screens across various devices.</p>
            <p>That equals to <b>46 hours and 40 minutes</b> for average screen time per week among worldwide internet users.</b></p>
        `);
        descriptionBox.classed("show", true);

    }
});

function executeStep(reverse = false) {

    let descriptionBox = d3.select("#map-description");

    descriptionBox.classed("hide", true);
    descriptionBox.classed("show", false);

    d3.select("#resetZoomBtn").style("display", "none");

    setTimeout(() => {
        if (!reverse) {
            if (step === 0) {
                mapVisInstance.setZoomEnabled(true);
                showWorldAverage();
                descriptionBox.html(`
                  <p>On average users aged 16 to 64 worldwide spent <b>6 hours and 40 minutes</b> per day on screens across various devices.</p>
                  <p>That equals to <b>46 hours and 40 minutes</b> for average screen time per week among worldwide internet users.</b></p>
                
                `);
            } else if (step === 1) {
                mapVisInstance.setZoomEnabled(false);
                mapVisInstance.zoomToJapan();
                setTimeout(() => {
                    if (step === 1) {
                        showTooltipOnCountry("🇯🇵 Japan: 3.56 hours", 10);
                    }
                }, 1000);

                setTimeout(() =>  mapVisInstance.highlightCountry("Japan", 30), 0);
                descriptionBox.html(`
                    <h3>Japan: The Least Screen Time</h3>
                    <p>Japanese people have the <strong>lowest</strong> screen time worldwide, just <strong>3 hours 56 minutes</strong> daily.</p>
                    <p>Digital well-being tools and cultural habits contribute to minimal usage.</p>
                `);
            } else if (step === 2) {
                descriptionBox.html(`
                     <h3>South Africa: The Highest Screen Time</h3>
                     <p>People in South Africa spend <strong>9 hours 24 minutes</strong> on their screens daily.</p>
                     <p>This is nearly 3 hours more than the global average.</p>`);
                descriptionBox.classed("hide", false);
                descriptionBox.classed("show", true);
                removeTooltipOnJapan();
                mapVisInstance.unhighlightCountries();
                mapVisInstance.zoomToSouthAfrica();
                setTimeout(() => showTooltipOnCountry("🇿🇦 South Africa: 9.24 hours", -50), 1000);
                mapVisInstance.highlightCountry("South Africa");
            } else if (step === 3) {
                removeTooltipOnJapan();
                mapVisInstance.unhighlightCountries("Japan");
                mapVisInstance.resetZoom2();
                setTimeout(() =>  mapVisInstance.focusOnUS(), 500);
                showDataset1();
                descriptionBox.html(`
                    <p style="padding-top: 0">Americans spend <strong>7 hours 3 minutes</strong> daily on screens.</p>
                    <p><strong>49%</strong> of toddlers (0-2 years old) already use smartphones.</p>
                    <p>Nearly half <b>(41%)</b> of American teenagers (13-18) have a screen time of more than 8 hours per day.</p>
                    <p>Entertainment screen time among children in the US has risen from <b>4 hours 44 minutes</b> in 2019 to <b>5 hours 33 minutes</b> in 2021.</p>
                `);
                mapVisInstance.removeLegend();
            } else if (step === 4) {
                mapVisInstance.removeCircleLegend();
                mapVisInstance.setZoomEnabled(true);
                descriptionBox.html(`
                        <h3>Global Screen Time Changes (2013 - 2025)</h3>
                        <p>South Africans, despite the highest usage, reduced it by <strong>14 minutes</strong>.</p>
                        <p>UAE saw the biggest increase (+42m), while Romania improved the most (-32m).</p>
                    `);
                resetWorldView(() => {
                    mapVisInstance.updateData(countryData2, 'dataset2');
                    setTimeout(() => mapVisInstance.drawLegend('dataset2', countryData2), 100);
                });
            }
        } else {
            if (step === 4) {
                mapVisInstance.updateData(countryData2, 'dataset2');
                descriptionBox.html(`
                    <h3>Global Screen Time Changes (2013 - 2025)</h3>
                     <p>South Africans, despite the highest usage, reduced it by <strong>14 minutes</strong>.</p>
                     <p>UAE saw the biggest increase (+42m), while Romania improved the most (-32m).</p>  `);
            } else if (step === 3) {
                mapVisInstance.setZoomEnabled(false);
                mapVisInstance.resetZoom2();
                mapVisInstance.focusOnUS();
                mapVisInstance.removeLegend();
                showDataset1();
                descriptionBox.html(`
                    <p style="padding-top: 0">Americans spend <strong>7 hours 3 minutes</strong> daily on screens.</p>
                    <p><strong>49%</strong> of toddlers (0-2 years old) already use smartphones.</p>
                    <p>Nearly half <b>(41%)</b> of American teenagers (13-18) have a screen time of more than 8 hours per day.</p>
                    <p>Entertainment screen time among children in the US has risen from <b>4 hours 44 minutes</b> in 2019 to <b>5 hours 33 minutes</b> in 2021.</p>
                `);
            } else if (step === 2) {
                mapVisInstance.removeCircleLegend();
                descriptionBox.html(`
                     <h3>South Africa: The Highest Screen Time</h3>
                     <p>People in South Africa spend <strong>9 hours 24 minutes</strong> on their screens daily.</p>
                     <p>This is nearly 3 hours more than the global average.</p>`);
                descriptionBox.classed("hide", false);
                descriptionBox.classed("show", true);

                resetWorldView(() => {
                    mapVisInstance.zoomToSouthAfrica();
                    setTimeout(() => {
                        showTooltipOnCountry("🇿🇦 South Africa: 9.24 hours", -50);
                        mapVisInstance.highlightCountry("South Africa");
                        }, 1000);
                });
            } else if (step === 1) {
                removeTooltipOnJapan();
                mapVisInstance.zoomToJapan();
                setTimeout(() => showTooltipOnCountry("🇯🇵 Japan: 3.56 hours", 10), 1000);
                setTimeout(() =>  mapVisInstance.highlightCountry("Japan", 30), 0);
                descriptionBox.html(`
                    <h3>Japan: The Least Screen Time</h3>
                    <p>Japanese people have the <strong>lowest</strong> screen time worldwide, just <strong>3 hours 56 minutes</strong> daily.</p>
                    <p>Digital well-being tools and cultural habits contribute to minimal usage.</p>
                `);
            } else if (step === 0) {
                mapVisInstance.setZoomEnabled(true);
                mapVisInstance.resetZoom2();
                removeTooltipOnJapan();
                mapVisInstance.unhighlightCountries("Japan");
                mapVisInstance.drawLegend('dataset1', countryData1);
                showWorldAverage();
                descriptionBox.html(`
                   <p>On average users aged 16 to 64 worldwide spent <b>6 hours and 40 minutes</b> per day on screens across various devices.</p>
                  <p>That equals to <b>46 hours and 40 minutes</b> for average screen time per week among worldwide internet users.</b></p>
                 `);
            }
        }

        descriptionBox.classed("hide", false);
        descriptionBox.classed("show", true);
    }, 500);
}


function showWorldAverage() {
    mapVisInstance.updateData(countryData1, 'dataset1');
    d3.select("#world-average").style("display", "block");
}

function showTooltipOnCountry(text, top) {
    let japanCoords = [0, 0];

    setTimeout(() => {
        let projectedCoords = mapVisInstance.projection(japanCoords);

        mapVisInstance.svg.selectAll(".map-tooltip").remove();

        mapVisInstance.svg.append("text")
            .attr("class", "map-tooltip")
            .attr("x", projectedCoords[0] + 40)
            .attr("y", projectedCoords[1] - top)
            .attr("font-size", "28px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("opacity", 0)
            .text(text)
            .transition()
            .duration(1000)
            .attr("opacity", 1);
    }, 50);
}

function removeTooltipOnJapan() {
    mapVisInstance.svg.selectAll(".map-tooltip")
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();
}

function showDataset1() {
    mapVisInstance.updateData(countryData1, 'dataset1');
}
function resetWorldView(callback) {
    mapVisInstance.svg.selectAll(".city-dot").remove();
    mapVisInstance.svg.selectAll(".city-label").remove();

    mapVisInstance.resetZoom();

    setTimeout(() => {
        if (callback) callback();
    }, 1500);
}

document.getElementById("resetZoomBtn").addEventListener("click", () => {
    mapVisInstance.resetZoom2();
});



