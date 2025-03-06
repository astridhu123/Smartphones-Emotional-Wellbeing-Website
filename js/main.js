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

        emotion_dashboard = new EmotionGraph("emotion-dashboard", cleanedData);
    })
}


