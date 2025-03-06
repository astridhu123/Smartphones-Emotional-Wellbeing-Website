
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

let emotion_dashboard;

load_emotion_data();

// Function to load the emotional training data
function load_emotion_data () {
    d3.csv("data/App Usage and Emotions Datasets/train.csv").then(data => {

        const cleanedData = data.filter(row => Object.values(row).some(value => value.trim() !== ""));
        // console.log(cleanedData);

        cleanedData.User_ID = +cleanedData.User_ID;

        cleanedData.forEach(row => {
            row.User_ID = +row.User_ID;
            row.Daily_Usage_Time = +row.Daily_Usage_Time;
            row.Posts_Per_Day = +row.Posts_Per_Day;
            row.Likes_Received_Per_Day = +row.Likes_Received_Per_Day;
            row.Comments_Received_Per_Day = +row.Comments_Received_Per_Day;
            row.Messages_Sent_Per_Day = +row.Messages_Sent_Per_Day;
        });

        emotion_dashboard = new EmotionGraph("emotion-graphic", cleanedData);
    })
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
