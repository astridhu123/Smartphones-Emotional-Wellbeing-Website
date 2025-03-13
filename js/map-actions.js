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
document.addEventListener("DOMContentLoaded", function () {
    if (mapVisInstance) {
        showWorldAverage();
        let descriptionBox = d3.select("#map-description");
        descriptionBox.html(`
            <h3>🌍 Global Screen Time Trends</h3>
            <p>The average person spends <strong>6 hours 40 minutes</strong> on screens daily.</p>
            <p>📉 Some countries improved: Romania (-32 minutes), Mexico (-30 minutes).</p>
            <p>📈 Others increased: UAE (+42 minutes), Russia (+24 minutes).</p>
        `);

        descriptionBox.classed("show", true);

    }
});

function executeStep(reverse = false) {
    let descriptionBox = d3.select("#map-description");

    descriptionBox.classed("hide", true);
    descriptionBox.classed("show", false);

    setTimeout(() => {
        if (!reverse) {
            if (step === 0) {
                showWorldAverage();
                descriptionBox.html(`
                    <h3>🌍 Global Screen Time Trends</h3>
                    <p>The average person spends <strong>6 hours 40 minutes</strong> on screens daily.</p>
                    <p>📉 Some countries improved: Romania (-32 minutes), Mexico (-30 minutes).</p>
                    <p>📈 Others increased: UAE (+42 minutes), Russia (+24 minutes).</p>
                `);
            } else if (step === 1) {
                showTooltipOnJapan();
                descriptionBox.html(`
                    <h3>🇯🇵 Japan: The Least Screen Time</h3>
                    <p>Japanese people have the <strong>lowest</strong> screen time worldwide, just <strong>3 hours 56 minutes</strong> daily.</p>
                    <p>📵 Digital well-being tools and cultural habits contribute to minimal usage.</p>
                `);
            } else if (step === 2) {
                removeTooltipOnJapan();
                mapVisInstance.focusOnUS();
                showDataset1();
                descriptionBox.html(`
                    <h3>🇺🇸 USA: Heavy Screen Users</h3>
                    <p>Americans spend <strong>7 hours 3 minutes</strong> daily on screens.</p>
                    <p>👶 <strong>49%</strong> of toddlers (0-2 years old) already use smartphones.</p>
                    <p>📱 Gen Z leads with an average of <strong>9 hours</strong> of screen time per day.</p>
                `);
            } else if (step === 3) {
                descriptionBox.html(`
                        <h3>📉 Global Screen Time Changes</h3>
                        <p>More people are aware of screen time effects post-pandemic.</p>
                        <p>📊 South Africans, despite the highest usage (9h 24m), reduced it by <strong>14 minutes</strong>.</p>
                        <p>🌍 UAE saw the biggest increase (+42m), while Romania improved the most (-32m).</p>
                    `);
                resetWorldView(() => {
                    mapVisInstance.updateData(countryData2, 'dataset2');
                });
            }
        } else {
            if (step === 3) {
                mapVisInstance.updateData(countryData2, 'dataset2');
                descriptionBox.html(`
                    <h3>📉 Global Screen Time Changes</h3>
                    <p>More countries reduced screen time this year.</p>
                    <p>📊 Romania slashed screen use by <strong>32 minutes</strong>, while UAE increased by <strong>42 minutes</strong>.</p>
                    <p>🌍 South Africa, despite high usage, improved by <strong>14 minutes</strong>.</p>
                `);
            } else if (step === 2) {
                mapVisInstance.focusOnUS();
                showDataset1();
                descriptionBox.html(`
                    <h3>🇺🇸 USA: Heavy Screen Users</h3>
                    <p>Americans spend <strong>7 hours 3 minutes</strong> daily on screens.</p>
                    <p>👶 Almost <strong>49%</strong> of toddlers use smartphones.</p>
                    <p>📱 Gen Z leads with <strong>9 hours</strong> of screen time per day.</p>
                `);
            } else if (step === 1) {
                resetWorldView(() => {
                    showTooltipOnJapan();
                    descriptionBox.html(`
                        <h3>🇯🇵 Japan: The Least Screen Time</h3>
                        <p>Japanese people have the <strong>lowest</strong> screen time: just <strong>3 hours 56 minutes</strong> daily.</p>
                        <p>📵 Digital well-being tools and cultural habits contribute to minimal usage.</p>
                    `);
                });
            } else if (step === 0) {
                removeTooltipOnJapan();
                showWorldAverage();
                descriptionBox.html(`
                    <h3>🌍 Global Screen Time Trends</h3>
                    <p>The world averages <strong>6 hours 40 minutes</strong> of screen time daily.</p>
                    <p>📉 Some countries improved: Romania (-32 minutes), Mexico (-30 minutes).</p>
                    <p>📈 Others increased: UAE (+42 minutes), Russia (+24 minutes).</p>
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



