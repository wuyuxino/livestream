#### 接口文档
```js
1.接口地址
/live/api/v1/stream
2.接口参数
{
    "stream_url":"rtsp://:8554/test",
    "stream_id":22
}
```

#### RTSP 模拟连接
```js
1.RTSP本地模拟连接
rtsp://localhost:8554/test
2.RTMP测试连接
rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid
3.M3U8 测试连接
    漳浦综合HD => http://220.161.87.62:8800/hls/0/index.m3u8
    ipbop advanced 22.050Hz stereo @ 40 kbps => http://devimages.apple.com.edgekey.net/streaming/examples/bipbop_16x9/gear0/prog_index.m3u8
4.参考连接
    https://blog.csdn.net/u014696856/article/details/135365211
