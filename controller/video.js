const ffmpeg = require('fluent-ffmpeg');

exports.videoMontage = async function (req, res, next) {
    const command = ffmpeg();
    // 输入四个视频文件
    command.input('rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid')
        .input('rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid')
        .input('rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid')
        .input('rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid');

    // 使用复杂滤镜进行拼接，这里使用 xstack 滤镜实现 2x2 布局
    command.complexFilter([
        '[0:v]pad=iw*2:ih*2[a]',
        '[a][1:v]overlay=w[b]',
        '[b][2:v]overlay=0:h[c]',
        '[c][3:v]overlay=w:h'
    ]);

    // 设置输出为推流，例如推送到 RTMP 服务器
    command.outputOptions('-an')
        .outputFormat('flv')
        .output('rtmp://127.0.0.1:1935/live/test')
        .on('start', function (commandLine) {
            console.log('推流开始: ' + commandLine);
            return res.status(200).json({ "message": commandLine })
        })
        .on('end', function () {
            console.log('推流结束');
            return res.status(200).json({ "message": "推流结束" })
        })
        .on('error', function (err) {
            console.error('推流出错: ', err);
            // 更详细的错误日志记录
            if (err.message.includes('Invalid argument')) {
                console.error('可能是输出地址错误或权限问题，请检查推流地址和权限。');
            } else if (err.message.includes('Connection refused')) {
                console.error('网络连接被拒绝，请检查网络连接和服务器地址。');
            } else {
                console.error('其他错误: ', err);
            }
            return res.status(200).json({ "message": err })
        })
        .run();
}


exports.videoScale = async function (req, res, next) {
    const command = ffmpeg();
    // 输入四个视频文件
    command.input('rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid');

    // 使用 complexFilter 实现 crop 和 scale 操作
    command.complexFilter([
        '[0:v]crop=iw/4:ih/4:iw/3:iw/3[cropped]',
        '[cropped]scale=1920:1080[scaled]'
    ]);

    // 设置输出为推流，例如推送到 RTMP 服务器
    command.outputOptions('-an')
        .outputFormat('flv')
        .map('[scaled]')
        .output('rtmp://127.0.0.1:1935/live/test')
        .on('start', function (commandLine) {
            console.log('推流开始: ' + commandLine);
            return res.status(200).json({ "message": commandLine })
        })
        .on('end', function () {
            console.log('推流结束');
            return res.status(200).json({ "message": "推流结束" })
        })
        .on('error', function (err) {
            console.error('推流出错: ', err);
            // 更详细的错误日志记录
            if (err.message.includes('Invalid argument')) {
                console.error('可能是输出地址错误或权限问题，请检查推流地址和权限。');
            } else if (err.message.includes('Connection refused')) {
                console.error('网络连接被拒绝，请检查网络连接和服务器地址。');
            } else {
                console.error('其他错误: ', err);
            }
            return res.status(200).json({ "message": err })
        })
        .run();
}