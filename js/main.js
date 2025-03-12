
let mapVisInstance;
let countryData1 = {}, countryData2 = {};
let isBarChart = true;

d3.json("https://unpkg.com/world-atlas@2.0.2/countries-50m.json").then(geoData => {
    Promise.all([
        d3.csv("data/World Screen Time/data-t0eHz.csv"),
        d3.csv("data/World Screen Time/data-1J1Gs.csv"),
        d3.csv("data/search terms/Phrase_Match_Keywords.csv") // Include the third dataset
    ]).then(([dataset1, dataset2, wordCloudData]) => { // Add wordCloudData here
        // Process dataset1 and dataset2
        let values = dataset1.map(d => +d["Time for Datawrapper"]).filter(d => !isNaN(d));
        worldAverageScreenTime = d3.mean(values);
        d3.select("#world-average")
            .text(`🌍 World Average Screen Time: ${worldAverageScreenTime.toFixed(2)} hours`)
            .style("display", "block");

        dataset1.forEach(d => { countryData1[d.Country] = +d["Time for Datawrapper"]; });
        dataset2.forEach(d => { countryData2[d.Country] = +d["Difference (Minutes)"]; });

        // Initialize the map visualization
        mapVisInstance = new MapVis("map-container", geoData, countryData1, 'dataset1');

        // Function to update the map
        window.updateMap = function(dataset) {
            if (dataset === 'dataset1') {
                mapVisInstance.updateData(countryData1, 'dataset1');
            } else {
                mapVisInstance.updateData(countryData2, 'dataset2');
            }
        };

        // Log the word cloud data to verify it's loaded correctly
        console.log("Word Cloud Data:", wordCloudData);

        // Initialize the word cloud visualization
        const wordCloud = new WordCloud("word-cloud", wordCloudData);
        const keywordChart = new KeywordChart("bar-chart", wordCloudData);
        document.getElementById("switch-button").addEventListener("click", function () {
            if (isBarChart) {
                keywordChart.updateScatterPlot();
                this.textContent = "Switch to Bar Chart";
            } else {
                keywordChart.updateBarChart();
                this.textContent = "Switch to Scatter Plot";
            }
            isBarChart = !isBarChart;
        });
    }).catch(function (error) {
        console.error("Error loading data:", error);
    });
});
let step = 0;

document.getElementById("nextButton").addEventListener("click", () => {
    if (mapVisInstance) {
        step = (step + 1) % 3;
        updateMapState();
    }
});

document.getElementById("prevButton").addEventListener("click", () => {
    if (mapVisInstance) {
        step = (step - 1 + 3) % 3;
        if (step === 0) {
            mapVisInstance.updateData(countryData1, 'dataset1');
        }
        updateMapState();
    }
});

function updateMapState() {
    if (step === 0) {
        mapVisInstance.updateData(countryData1, 'dataset1');
        d3.select("#world-average").style("display", "block");
    } else if (step === 1) {
        mapVisInstance.focusOnUS();
        mapVisInstance.updateData(countryData1, 'dataset1');
        d3.select("#world-average").style("display", "none");
    } else if (step === 2) {
        mapVisInstance.svg.selectAll(".city-dot").remove();
        mapVisInstance.svg.selectAll(".city-label").remove();
        mapVisInstance.resetZoom();
        mapVisInstance.updateData(countryData2, 'dataset2');
        d3.select("#world-average").style("display", "none");
    }
}

document.getElementById("prevButton").addEventListener("click", () => {
    if (mapVisInstance && mapVisInstance.zoomedToUS) {
        mapVisInstance.svg.selectAll(".city-dot").remove();
        mapVisInstance.svg.selectAll(".city-label").remove();
        mapVisInstance.resetZoom();
    }
});

let emotion_dashboard;

load_emotion_data();

function load_emotion_data() {
    Promise.all([
        d3.csv("data/App Usage and Emotions Datasets/train.csv"),
        d3.csv("data/App Usage and Emotions Datasets/val.csv"),
        d3.csv("data/App Usage and Emotions Datasets/test.csv")
    ]).then(datasets => {
        let [trainData, validateData, testData] = datasets;

        let combinedData = [...trainData, ...validateData, ...testData].filter(row =>
            Object.values(row).some(value => value.trim() !== "")
        );

        combinedData.forEach(row => {
            row.User_ID = +row.User_ID;
            row.Daily_Usage_Time = +row.Daily_Usage_Time;
            row.Posts_Per_Day = +row.Posts_Per_Day;
            row.Likes_Received_Per_Day = +row.Likes_Received_Per_Day;
            row.Comments_Received_Per_Day = +row.Comments_Received_Per_Day;
            row.Messages_Sent_Per_Day = +row.Messages_Sent_Per_Day;
        });

        emotion_dashboard = new EmotionGraph("emotion-graphic", combinedData);
    });
}


// Create event listener to detect changes in both emotion and platform toggles
d3.select("#emotion-toggle").on("change", function() {
    logToggleStatus(emotion_dashboard.data);
});
d3.select("#platform-toggle").on("change", function() {
    logToggleStatus(emotion_dashboard.data);
});

// Function to log the current status of all toggles and filter data
function logToggleStatus(data) {
    console.log("Pre Emotion Data");
    console.log(data);

    const emotionToggles = document.querySelectorAll('#emotion-toggle input[type="checkbox"]');
    const platformToggles = document.querySelectorAll('#platform-toggle input[type="checkbox"]');

    let selectedEmotions = [];
    let selectedPlatforms = [];

    // Collect the selected emotions based on the checked boxes
    emotionToggles.forEach(toggle => {
        if (toggle.checked) {
            selectedEmotions.push(toggle.id);
        }
    });

    // Collect the selected platforms based on the checked boxes
    platformToggles.forEach(toggle => {
        if (toggle.checked) {
            selectedPlatforms.push(toggle.id);
        }
    });

    // Log selected toggles
    // console.log("Selected Emotions: ", selectedEmotions);
    // console.log("Selected Platforms: ", selectedPlatforms);

    // Filter the data based on the selected emotions and platforms
    const filteredData = data.filter(row => {
        const isEmotionSelected = selectedEmotions.includes(row.Dominant_Emotion); // Check if the emotion is selected
        const isPlatformSelected = selectedPlatforms.includes(row.Platform); // Check if the platform is selected

        return isEmotionSelected && isPlatformSelected; // Include the row if both conditions are true
    });

    // Log the filtered data
    // console.log("Filtered Data: ", filteredData);

    emotion_dashboard.selectionChanged(filteredData);
}



// Handle dot clicks
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide')) - 1;
        currentSlideIndex = slideIndex;
        updateSlides();
    });
});