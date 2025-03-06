document.addEventListener("wheel", (event) => {
    event.preventDefault();
    let pages = document.querySelectorAll(".page");
    let currentPageIndex = Array.from(pages).findIndex(page => page.id === location.hash.substring(1));
    let nextPageIndex = event.deltaY > 0 ? currentPageIndex + 1 : currentPageIndex - 1;
    if (nextPageIndex >= 0 && nextPageIndex < pages.length) {
        location.hash = `#${pages[nextPageIndex].id}`;
    }
}, { passive: false });


let mapVisInstance;

d3.json("https://unpkg.com/world-atlas@2.0.2/countries-50m.json").then(geoData => {
    Promise.all([
        d3.csv("data/World Screen Time/data-1J1Gs.csv"),
        d3.csv("data/World Screen Time/data-t0eHz.csv")
    ]).then(([dataset1, dataset2]) => {
        let countryData1 = {}, countryData2 = {};
        dataset1.forEach(d => { countryData1[d.Country] = +d["Difference (Minutes)"]; });
        dataset2.forEach(d => { countryData2[d.Country] = +d["Time for Datawrapper"]; });

        mapVisInstance = new MapVis("map-container", geoData, countryData1, 'dataset1');

        window.updateMap = function(dataset) {
            if (dataset === 'dataset1') {
                mapVisInstance.updateData(countryData1, 'dataset1');
            } else {
                mapVisInstance.updateData(countryData2, 'dataset2');
            }
        };
    });
});

document.getElementById("nextButton").addEventListener("click", () => {
    if (mapVisInstance) {
        mapVisInstance.focusOnUS();
    }
});

