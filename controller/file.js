const url = require('url')

exports.fileUpload = async function (req, res, next) {
    res.send({
        file: req.file,
        path: `${req.file.destination}/${req.file.filename}`
    })
}

exports.fileDownload = async function (req, res, next) {
    let path_file = url.parse(decodeURI(req.url)).query
    const file = `${path_file}`
    res.download(file)
}