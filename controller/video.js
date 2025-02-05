const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// 2*2 布局
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
            command.kill();
            return res.status(200).json({ "message": "推流结束" })
        })
        .on('error', function (err) {
            command.kill();
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

// 测试拼接 1*1 布局
exports.videoMontageTest = async function (req, res, next) {
    const command = ffmpeg();
    // 输入视频文件的路径
    const video1Path = path.join(__dirname, 'test/video1.mp4');
    const video2Path = path.join(__dirname, 'test/video2.mp4');

    // 输出视频文件的路径
    const outputPath = path.join(__dirname, 'test/output.mp4');

    command.input(video1Path)
        .input(video2Path);

    // 设置复杂滤镜以实现左右拼接
    command.complexFilter([
        {
            filter: 'hstack',
            options: {},
            inputs: ['0:v', '1:v'],
            outputs: 'vout'
        }
    ]);

    // 映射输出流
    command.map('vout');


    // 设置输出文件路径和输出选项
    command.output(outputPath)
        .outputOptions([
            '-c:v', 'libx264',  // 视频编码器
            '-c:a', 'aac'       // 音频编码器
        ]);

    // 执行命令
    command.on('start', function (commandLine) {
        console.log('开始拼接视频，执行的命令：', commandLine);
    }).on('progress', function (progress) {
        console.log('处理进度：', progress.percent ? progress.percent.toFixed(2) + '%' : '未知');
    }).on('end', function () {
        console.log('视频拼接完成，输出文件：', outputPath);
        return res.status(200).json({ "message": outputPath })
    }).on('error', function (err) {
        console.error('拼接视频时出错：', err.message);
        return res.status(200).json({ "message": err })
    }).run();
}

// 视频 鱼眼镜头畸变校正
exports.videoYyXz = async function (req, res, next) {
    // 输入视频文件路径
    const inputVideoPath = path.join(__dirname, 'test/video2.mp4');
    // 输出视频文件路径
    const outputVideoPath = path.join(__dirname, 'test/videoYyXz.mp4');

    const command = ffmpeg(inputVideoPath);

    // 设置 lenscorrection 滤镜参数
    // cx 和 cy 是图像中心的相对坐标，取值范围 0 到 1
    // k1 和 k2 是畸变系数，需要根据实际情况调整
    const cx = 0.5;
    const cy = 0.5;
    const k1 = -0.1;
    const k2 = -0.05;
    const lensCorrectionFilter = `lenscorrection=cx=${cx}:cy=${cy}:k1=${k1}:k2=${k2}`;

    // 应用滤镜
    command.videoFilter(lensCorrectionFilter);

    // 设置输出文件路径和输出选项
    command.output(outputVideoPath)
        .outputOptions([
            '-c:v', 'libx264',
            '-c:a', 'aac'
        ])
        .on('start', function (commandLine) {
            console.log('开始处理视频畸变，执行的命令：', commandLine);
        })
        .on('progress', function (progress) {
            console.log('处理进度：', progress.percent ? progress.percent.toFixed(2) + '%' : '未知');
        })
        .on('end', function () {
            console.log('视频畸变处理完成，输出文件：', outputVideoPath);
            return res.status(200).json({ "message": outputVideoPath })
        })
        .on('error', function (err) {
            console.error('处理视频畸变时出错：', err.message);
            return res.status(200).json({ "message": err })
        })
        .run();
}

// 视频 透视畸变校正
exports.videoTsJbXz = async function (req, res, next) {
    // 输入视频文件路径
    const inputVideoPath = path.join(__dirname, 'test/video2.mp4');
    // 输出视频文件路径
    const outputVideoPath = path.join(__dirname, 'test/videoTsJbXz.mp4');

    const command = ffmpeg(inputVideoPath);

    // 设置 perspective 滤镜参数
    // 以下参数需要根据实际情况调整
    const x0 = 0;
    const x1 = 720;
    const x2 = 0;
    const x3 = 720;

    const y0 = 0;
    const y1 = 0;
    const y2 = 1728;
    const y3 = 1728;

    const perspectiveFilter = `perspective=x0=${x0}:y0=${y0}:x1=${x1}:y1=${y1}:x2=${x2}:y2=${y2}:x3=${x3}:y3=${y3}`;

    // 应用滤镜
    command.videoFilter(perspectiveFilter);

    // 设置输出文件路径和输出选项
    command.output(outputVideoPath)
        .outputOptions([
            '-c:v', 'libx264',
            '-c:a', 'aac'
        ])
        .on('start', function (commandLine) {
            console.log('开始处理视频透视畸变，执行的命令：', commandLine);
        })
        .on('progress', function (progress) {
            console.log('处理进度：', progress.percent ? progress.percent.toFixed(2) + '%' : '未知');
        })
        .on('end', function () {
            console.log('视频透视畸变处理完成，输出文件：', outputVideoPath);
            return res.status(200).json({ "message": outputVideoPath })
        })
        .on('error', function (err) {
            console.error('处理视频透视畸变时出错：', err.message);
            return res.status(200).json({ "message": err })
        })
        .run();
}

exports.videoScale = async function (req, res, next) {
    const command = ffmpeg();
    // 输入四个视频文件
    command.input('rtmp://127.0.0.1:1935/live/test');

    // 使用 complexFilter 实现 crop 和 scale 操作
    command.complexFilter([
        '[0:v]crop=iw/4:ih/4:iw/3:iw/3[cropped]',
        '[cropped]scale=1920:1080[scaled]'
    ]);

    // 设置输出为推流，例如推送到 RTMP 服务器
    command.outputOptions('-an')
        .outputFormat('flv')
        .map('[scaled]')
        .output('rtmp://127.0.0.1:1935/live/test111')
        .on('start', function (commandLine) {
            console.log('推流开始: ' + commandLine);
            return res.status(200).json({ "message": commandLine })
        })
        .on('end', function () {
            console.log('推流结束');
            command.kill();
            return res.status(200).json({ "message": "推流结束" })
        })
        .on('error', function (err) {
            console.error('推流出错: ', err);
            command.kill();
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