var express = require('express')

const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const bodyParser = require("body-parser")
const log = require('./config/log')
const fileController = require('./controller/file.js')
const liveController = require('./controller/live')
const videoController = require('./controller/video')
const globalConfig = require('./config/global')
const errorConfig = require('./config/errorhand')


const app = express()

// body json 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

// IE10+、Chrome4+、FireFox3.5+
app.use(cors())

app.use(log.accesslog)

// public directory
app.use(express.static(path.join(__dirname, 'public')))

// helmet doc --> https://helmetjs.github.io/
app.use(helmet())

// error handling middleware
app.use(errorConfig.errorhand)

// stream api
app.post('/live/api/v1/stream/video', liveController.liveStreamingVideo)
app.post('/live/api/v1/stream/audio', liveController.liveStreamingAudio)
app.post('/live/api/v1/stream/captions', liveController.liveStreamingCaptions)
app.post('/live/api/v1/stream/play', liveController.liveStreamingPlay)
app.post('/live/api/v1/stream/closews', liveController.liveStreamingCloseWs)

// text
app.post('/live/api/v1/stream/audiotext', liveController.liveStreamingAudioText)

app.get('/file/api/v1/download', fileController.fileDownload)

// video
app.get('/video/api/v1/stream/montage', videoController.videoMontage)
app.get('/video/api/v1/stream/montageTest', videoController.videoMontageTest)
app.get('/video/api/v1/stream/videoyyxz', videoController.videoYyXz)
app.get('/video/api/v1/stream/videotsjbxz', videoController.videoTsJbXz)


app.get('/video/api/v1/stream/scale', videoController.videoScale)

// server port
app.listen(globalConfig.serverport, () => {
    console.log(`Server is running at ${globalConfig.serverport} port!!!`)
})