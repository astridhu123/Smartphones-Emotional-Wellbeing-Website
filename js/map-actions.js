let step = 0;
const totalSteps = 4;

document.getElementById("nextButton").addEventListener("click", () => {
    step = (step + 1) % totalSteps;
    executeStep(false);
});

document.getElementById("prevButton").addEventListener("click", () => {
    step = (step - 1 + totalSteps) % totalSteps;
    executeStep(true);
});

function executeStep(reverse = false) {
    if (!reverse) {
        // forward order
        if (step === 0) {
            showWorldAverage();
        } else if (step === 1) {
            showTooltipOnJapan();
        } else if (step === 2) {
            removeTooltipOnJapan();
            mapVisInstance.focusOnUS();
            showDataset1();
        } else if (step === 3) {
            resetWorldView(() => {
                mapVisInstance.updateData(countryData2, 'dataset2');
            });
        }
    } else {
        // reverse order
        if (step === 3) {
            mapVisInstance.updateData(countryData2, 'dataset2');
        } else if (step === 2) {
            mapVisInstance.focusOnUS();
            showDataset1();
        } else if (step === 1) {
            resetWorldView(() => {
                showTooltipOnJapan();
            });
        } else if (step === 0) {
            removeTooltipOnJapan();
            showWorldAverage();
        }
    }
}


function showWorldAverage() {
    mapVisInstance.updateData(countryData1, 'dataset1');
    d3.select("#world-average").style("display", "block");
}

function showTooltipOnJapan() {
    let japanCoords = [138.2529, 36.2048];

    setTimeout(() => {
        let projectedCoords = mapVisInstance.projection(japanCoords);

        mapVisInstance.svg.selectAll(".map-tooltip").remove();

        mapVisInstance.svg.append("text")
            .attr("class", "map-tooltip")
            .attr("x", projectedCoords[0] + 10)
            .attr("y", projectedCoords[1] - 10)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("opacity", 0)
            .text("🇯🇵 Japan: 3.56 hours")
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



