const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const Stream = require('node-rtsp-stream');

const { validationResult } = require('express-validator');

let stream = null;
let ffmpeg_process_video = null;
let ffmpeg_process_audio = null;
let ffmpeg_process_captions = null;

// 直播流视频裁剪
exports.liveStreamingVideo = async function (req, res, next) {
    let filePath = `./VideoSlicing/${req.body.stream_name}/`

    //递归创建文件夹
    fs.mkdir(filePath, { recursive: true }, err => {
        if (err) { return }
    })

    ffmpeg_process_video = ffmpeg(req.body.stream_url)
        .duration(req.body.slicing_time)
        .videoCodec('copy')
        .noAudio()
        .output(`./VideoSlicing/${req.body.stream_name}/${req.body.stream_name}_${req.body.order}.mp4`)
        .on('error', (err) => {
            console.error('An error occurred: ', err.message);
            ffmpeg_process_video.kill();
            return res.status(200).json({ "errormassage": err.message });
        })
        .on('end', () => {
            console.log('Processing finished successfully.');
            ffmpeg_process_video.kill();
            return res.status(200).json({ "video": `VideoSlicing/${req.body.stream_name}/${req.body.stream_name}_${req.body.order}.mp4` })
        })
        .run();

}

// 直播流音频裁剪
exports.liveStreamingAudio = async function (req, res, next) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ errors: errors.mapped() })
    }

    let filePath = `./VideoSlicing/${req.body.stream_name}/`

    //递归创建文件夹
    fs.mkdir(filePath, { recursive: true }, err => {
        if (err) { return }
    })

    ffmpeg_process_audio = ffmpeg(req.body.stream_url)
        .noVideo()
        .duration(req.body.slicing_time)
        .audioCodec('libmp3lame')
        .output(`./VideoSlicing/${req.body.stream_name}/${req.body.stream_name}_${req.body.order}.mp3`)
        .on('error', (err) => {
            console.error('An error occurred: ', err.message);
            ffmpeg_process_audio.kill()
            return res.status(200).json({ "errormassage": err.message });
        })
        .on('end', () => {
            console.log('Processing finished successfully.');
            ffmpeg_process_audio.kill()
            return res.status(200).json({ "audio": `VideoSlicing/${req.body.stream_name}/${req.body.stream_name}_${req.body.order}.mp3` })
        })
        .run();
}

// 获取直播中字幕流
exports.liveStreamingCaptions = async function (req, res, next) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ errors: errors.mapped() })
    }

    let filePath = `./VideoSlicing/${req.body.stream_name}/`

    //递归创建文件夹
    fs.mkdir(filePath, { recursive: true }, err => {
        if (err) { return }
    })

    exec(`ffprobe -v error -select_streams s -show_entries stream=index -of csv=p=0 ${req.body.stream_url}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行 ffprobe 时出错: ${error.message}`);
            return;
        }
        if (stdout.trim() === '') {
            console.error(`输入源中没有字幕流`);
            return res.status(200).json({ "captions": "输入源中没有字幕流" });
        }

        ffmpeg_process_captions = ffmpeg(req.body.stream_url)
            .inputOptions('-i', req.body.stream_url)
            .duration(req.body.slicing_time)
            .outputOptions('-map', '0:s:0?')
            .output(`./VideoSlicing/${req.body.stream_name}/${req.body.stream_name}_${req.body.order}.txt`)
            .on('error', (err) => {
                console.error('An error occurred: ', err.message);
                ffmpeg_process_captions.kill();
                return res.status(200).json({ "errormassage": err.message });
            })
            .on('end', () => {
                console.log('Processing finished successfully.');
                ffmpeg_process_captions.kill();
                return res.status(200).json({ "captions": `VideoSlicing/${req.body.stream_name}/${req.body.stream_name}_${req.body.order}.txt` })
            })
            .run();
    })


}

exports.liveStreamingPlay = async function (req, res, next) {
    if (stream) {
        // 停止 ffmpeg 进程
        stream.stop();
        // 关闭 WebSocket 服务器
        // node-rtsp-stream 可能没有直接暴露关闭 WebSocket 的方法，
        // 这里假设 stop 方法会关闭相关资源
        stream = null;
        console.log('Stream stopped');
    }
    stream = new Stream({
        name: 'name',
        streamUrl: req.body.stream_url,
        wsPort: req.body.wsport,
        ffmpegOptions: {
            '-stats': '',
            '-r': 20,
            '-s': '1280 720'
        }
    });

    stream.on('error', (err) => {
        console.error('RTSP 流不可用:', err);
    })


    return res.status(200).json({ stream })
}

exports.liveStreamingCloseWs = async function (req, res, next) {
    if (stream) {
        // 停止 ffmpeg 进程
        stream.stop();
        // 关闭 WebSocket 服务器
        // node-rtsp-stream 可能没有直接暴露关闭 WebSocket 的方法，
        // 这里假设 stop 方法会关闭相关资源
        stream = null;
        console.log('Stream stopped');
    }

    if (ffmpeg_process_video) {
        ffmpeg_process_video.kill();
    }

    if (ffmpeg_process_audio) {
        ffmpeg_process_audio.kill();
    }

    if (ffmpeg_process_captions) {
        ffmpeg_process_captions.kill();
    }

    return res.status(200).json({ "message": "Stream stopped" })
}

// 音频转文字-调用本地python接口
exports.liveStreamingAudioText = async function (req, res, next) {
    return res.status(200).json({ "message": "Stream Text" })
}