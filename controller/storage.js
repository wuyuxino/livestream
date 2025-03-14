const fs = require('fs');
const path = require('path');
var date = require("silly-datetime");
const log = require('../config/log');

// 审核记录存储
exports.saveData = async function (req, res, next) {
    const data = req.body.audit_records;
    var today = date.format(new Date(), 'YYYY-MM-DD')
    const auditLogFilePath = path.join(__dirname, `../public/auditrecords/auditlog_${today}-${new Date().getTime()}_.log`)

    // 将记录转换为 JSON 字符串
    const logEntry = JSON.stringify(data) + '\n';

    // 以追加模式打开文件，如果文件不存在则创建
    fs.appendFile(auditLogFilePath, logEntry, (err) => {
        if (err) {
            log.errorlog(err)
            return res.status(200).json({ "message": "保存审核记录时出错" })
        } else {

            return res.status(200).json({ "message": "审核记录保存成功" })
        }
    });
}

// 审核记录查询
exports.searchData = async function (req, res, next) {
    // 递归读取文件夹中的所有文件
    function readAllFilesInDirectory(dir, callback) {
        fs.readdir(dir, (err, files) => {
            if (err) {
                return callback(err);
            }

            const allFiles = [];
            let remaining = files.length;

            if (remaining === 0) {
                return callback(null, allFiles);
            }

            files.forEach((file) => {
                const filePath = path.join(dir, file);
                fs.stat(filePath, (statErr, stat) => {
                    if (statErr) {
                        return callback(statErr);
                    }

                    if (stat.isDirectory()) {
                        readAllFilesInDirectory(filePath, (subErr, subFiles) => {
                            if (subErr) {
                                return callback(subErr);
                            }
                            allFiles.push(...subFiles);
                            if (--remaining === 0) {
                                callback(null, allFiles);
                            }
                        });
                    } else {
                        fs.readFile(filePath, 'utf8', (readErr, data) => {
                            if (readErr) {
                                return callback(readErr);
                            }
                            allFiles.push({
                                path: filePath,
                                content: data
                            });
                            if (--remaining === 0) {
                                callback(null, allFiles);
                            }
                        });
                    }
                });
            });
        });
    }

    // 使用示例
    const targetDirectory = path.join(__dirname, '../public/auditrecords');
    readAllFilesInDirectory(targetDirectory, (err, files) => {
        if (err) {
            console.error('Error reading files:', err);
            log.errorlog(err);
        } else {
            return res.status(200).json({ "data": files })
        }
    });
}

// 审核记录删除
exports.searchRemove = async function (req, res, next) {
    const filename = req.body.file_name;
    const filePath = path.join(__dirname, `../public/auditrecords/${filename}`)
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log('文件未找到');
                log.errorlog(err);
            } else {
                console.error('检查文件时出错:', err);
                log.errorlog(err);
            }
        } else {
            // 文件存在，执行删除操作
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('删除文件时出错:', unlinkErr);
                    log.errorlog(unlinkErr);
                } else {
                    console.log('文件删除成功');
                    return res.status(200).json({ "message": "文件删除成功" })
                }
            });
        }
    });
}

// 获取审核文件
exports.searchFile = async function (req, res, next) {
    const targetDirectory = path.join(__dirname, '../VideoSlicing');
    let newArr = [];
    function readDoubleFolders(rootDir) {
        try {
            const firstLevelEntries = fs.readdirSync(rootDir, { withFileTypes: true });

            firstLevelEntries.forEach((firstLevelEntry) => {
                let obj;
                const firstLevelPath = path.join(rootDir, firstLevelEntry.name);
                if (firstLevelEntry.isDirectory()) {
                    obj = {
                        onefile: firstLevelEntry.name,
                        twofile: []
                    }
                    const secondLevelEntries = fs.readdirSync(firstLevelPath, { withFileTypes: true });
                    secondLevelEntries.forEach((secondLevelEntry) => {
                        const secondLevelPath = path.join(firstLevelPath, secondLevelEntry.name);
                        if (secondLevelEntry.isDirectory()) {
                        } else {
                            obj['twofile'].push(secondLevelEntry.name)
                        }
                    });
                }
                newArr.push(obj)
            });

            return res.status(200).json({ "data": newArr })
        } catch (error) {
            console.error(`发生错误: ${error.message}`);
            log.errorlog(error);
        }
    }

    // 替换为你的根文件夹路径
    readDoubleFolders(targetDirectory);
}

// 删除审核文件夹及文件夹中所有文件
exports.removeFile = async function (req, res, next) {
    function deleteFolderRecursive(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach((file) => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    // 如果是文件夹，则递归调用删除函数
                    deleteFolderRecursive(curPath);
                } else {
                    // 如果是文件，则直接删除
                    fs.unlinkSync(curPath);
                }
            });
            // 删除空文件夹
            fs.rmdirSync(folderPath);

            return res.status(200).json({ "message": "文件删除成功" })
        }
    }

    // 使用示例
    const targetDirectory = path.join(__dirname, `../VideoSlicing/${req.body.file_name}`)
    deleteFolderRecursive(targetDirectory);
}