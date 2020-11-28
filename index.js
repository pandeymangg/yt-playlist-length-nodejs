const { google } = require('googleapis')
const youtube = google.youtube('v3')

const api_key = 'your_api_key'

let videoIds = []
let regex = /(\d+)/g
let duration = []
let durationString = ''
let nextPageToken = null
let durationSeconds = 0
let totalSeconds = 0

async function getResponse() {
    try {
        while (true) {
            const plResponse = await youtube.playlistItems.list({
                key: api_key,
                part: 'contentDetails, snippet',
                playlistId: 'any playlist id here',
                maxResults: 50,
                pageToken: nextPageToken
            })

            videoIds = []
            plResponse.data.items.forEach(item => {
                videoIds.push(item.contentDetails.videoId)
            })

            const vidResponse = await youtube.videos.list({
                key: api_key,
                part: 'contentDetails',
                id: videoIds.join(',')
            })

            vidResponse.data.items.forEach(item => {
                duration = item.contentDetails.duration.match(regex)

                if (duration.length < 4) {
                    durationString = `${duration[0]} ${duration[1]} ${duration[2]}`
                }

                if (duration.length < 3) {
                    durationString = `0 ${duration[0]} ${duration[1]}`
                }

                if (duration.length < 2) {
                    durationString = `0 0 ${duration[0]}`
                }

                duration = durationString.split(' ')

                durationSeconds = parseInt(duration[0])*3600 + parseInt(duration[1])*60 + parseInt(duration[2])

                totalSeconds += durationSeconds
            })

            nextPageToken = plResponse.data.nextPageToken
            if (!nextPageToken) {
                break;
            }

        }

        let [ minutes, seconds ] = [parseInt(totalSeconds / 60), parseInt(totalSeconds % 60)]
        let hours = parseInt(minutes / 60)
        minutes = parseInt(minutes % 60)
        console.log(hours, minutes, seconds)
    } catch (e) {
        console.log(e.message)
    }

}

getResponse()
