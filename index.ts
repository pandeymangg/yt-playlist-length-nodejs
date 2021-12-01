const { google } = require("googleapis");
const youtube = google.youtube("v3");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const api_key = process.env.API_KEY;
const playlistId = "some_playlist_id";

let videoIds = [];
let hourRegex = /(\d+)H/g;
let minuteRegex = /(\d+)M/g;
let secondRegex = /(\d+)S/g;

let nextPageToken = null;
let durationSeconds = 0;
let totalSeconds = 0;

async function getResponse() {
  try {
    while (true) {
      const plResponse = await youtube.playlistItems.list({
        key: api_key,
        part: "contentDetails, snippet",
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      videoIds = [];
      plResponse.data.items.forEach((item) =>
        videoIds.push(item.contentDetails.videoId)
      );

      const vidResponse = await youtube.videos.list({
        key: api_key,
        part: "contentDetails",
        id: videoIds.join(","),
      });

      vidResponse.data.items.forEach((item, index) => {
        const hour =
          item.contentDetails.duration
            ?.match(hourRegex)?.[0]
            ?.replace("H", "") || 0;
        const min =
          item.contentDetails.duration
            ?.match(minuteRegex)?.[0]
            ?.replace("M", "") || 0;
        const sec =
          item.contentDetails.duration
            ?.match(secondRegex)?.[0]
            ?.replace("S", "") || 0;

        durationSeconds =
          parseInt(hour) * 3600 + parseInt(min) * 60 + parseInt(sec);

        totalSeconds += durationSeconds;
      });

      nextPageToken = plResponse.data.nextPageToken;
      if (!nextPageToken) {
        break;
      }
    }

    let [minutes, seconds] = [
      Math.floor(totalSeconds / 60),
      Math.floor(totalSeconds % 60),
    ];

    let hours = Math.floor(minutes / 60);
    minutes = Math.floor(minutes % 60);

    console.log(hours, minutes, seconds);
  } catch (e) {
    console.log(e.message);
  }
}

getResponse();
