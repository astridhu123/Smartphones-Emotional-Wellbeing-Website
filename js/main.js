
let mapVisInstance;
let countryData1 = {}, countryData2 = {};

d3.json("https://unpkg.com/world-atlas@2.0.2/countries-50m.json").then(geoData => {
    Promise.all([
        d3.csv("data/World Screen Time/data-t0eHz.csv"),
        d3.csv("data/World Screen Time/data-1J1Gs.csv"),
        d3.csv("data/search terms/Related_Keywords.csv") // Include the third dataset
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

// Load in the Data for the Pandemic Chart
let pandemic_data;
let pandemic_chart;

function load_pandemic_data() {
    Promise.all([
        d3.csv("data/A pandemic of Mental Health/Reported Anxiety and Depression Symptoms/anx_and_dep/anx_or_dep_2019_vs_2020.csv"),
    ]).then(datasets => {

        let data = datasets[0];

        data.forEach(row => {
            row.year = +row.year;
            row.value = +row.value;
        });

        // console.log("Pandemic Data", data);

        pandemic_chart = new PandemicHealthChart("pandemic-chart", data);
    });
}


// Search Trend Graph Visualization
let searchTrendGraph;

function load_search_trend_data() {
    // Array of file names (without extension)
    const datasetNames = [
        "Anxiety", 
        "Counselling", 
        "Depression", 
        "Loneliness", 
        "Mental_Health_Support", 
        "Mental_Illness", 
        "Pandemic", 
        "Screen_Time"
    ];

    Promise.all([
        d3.csv("data/Google Search Trends/anxiety_search_trends.csv"),
        d3.csv("data/Google Search Trends/counselling_search_trends.csv"),
        d3.csv("data/Google Search Trends/depression_search_trends.csv"),
        d3.csv("data/Google Search Trends/lonliness_search_trends.csv"),
        d3.csv("data/Google Search Trends/mental_health_support_search_trends.csv"),
        d3.csv("data/Google Search Trends/mental_illness_search_trends.csv"),
        d3.csv("data/Google Search Trends/pandemic_search_trends.csv"),
        d3.csv("data/Google Search Trends/screen_time_search_trends.csv")
    ]).then(datasets => {

        let parseDate = d3.timeParse("%Y-%m");

        datasets.forEach((dataset, index) => {
            // Assign a name from datasetNames based on index
            dataset.name = datasetNames[index]; // e.g., "Anxiety", "Counselling", etc.

            dataset.forEach(row => {
                // Parse date and value (second entry as integer)
                row.date = parseDate(row[Object.keys(row)[0]]);
                row[Object.keys(row)[1]] = parseInt(row[Object.keys(row)[1]], 10);
            
                // Add a category field with the dataset's name
                row.category = dataset.name;
            });
        });

        let combinedData = datasets.map((dataset, index) => {
            // Replace `Value` with the name of the dataset
            return dataset.map(row => {
                // Replace `Value` with the name of the dataset
                let newRow = { ...row, [dataset.name]: row.Value };
                // delete newRow.Value; // Remove the original `Value` key
                return newRow;
            });
        }).flat(); 

        console.log("Datasets", combinedData);

        searchTrendGraph = new SearchTrendGraph("google-search-trends", combinedData);
        logSearchToggleStatus(searchTrendGraph.data);
    });
}

// LOAD ALL FUNCTIONS =============================================================================================================
load_pandemic_data();
load_search_trend_data();
load_emotion_data();




// EVENT LISTENERS ================================================================================================================

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


d3.selectAll("#search-toggle input[type='checkbox']").on("change", function() {
    console.log("Changing search terms...");
    logSearchToggleStatus(searchTrendGraph.data);
});

function logSearchToggleStatus(data) {

    let searchToggles = document.querySelectorAll('#search-toggle input[type="checkbox"]');
    let selectedCategories = [];

    // Collect checked categories by removing the 'toggle-' prefix
    searchToggles.forEach(toggle => {
        if (toggle.checked) {
            let categoryName = toggle.id.replace("toggle-", ""); // Remove 'toggle-' prefix
            selectedCategories.push(categoryName);
        }
    });

    // Filter data based on selected categories
    const filteredData = data.filter(row => selectedCategories.includes(row.category));

    console.log("selected", selectedCategories);
    console.log(filteredData);

    // Update visualization with filtered data
    searchTrendGraph.selectionChanged(filteredData);
}

// Handle dot clicks
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide')) - 1;
        currentSlideIndex = slideIndex;
        updateSlides();
    });
});