var morgan = require('morgan')
var fs = require('fs')
var path = require('path')
var date = require("silly-datetime")
var today = date.format(new Date(), 'YYYY-MM-DD')

var accessLogStream = fs.createWriteStream(path.join(__dirname, `../public/logs/access_${today}_.log`), { flags: 'a' })

/**
 * combined: 标准Apache组合日志输出
 * common: 标准Apache公共日志输出
 * dev: 根据返回的状态码彩色输出日志
 * short: 简洁输出，带响应时间
 * tiny: 控制台输出
 * token 自定义格式输出
 * :date[format] 日期格式
 */
var accesslog = morgan('combined', { stream: accessLogStream })


/**
 * 日志存储类型
 * logger.trace("Entering cheese testing");
 * logger.debug("Got cheese.");
 * logger.info("Cheese is Comté."); 
 * logger.warn("Cheese is quite smelly.");
 * logger.error("Cheese is too ripe!");
 * logger.fatal("Cheese was breeding ground for listeria.");
 * 后端接口用法
 * log.errorlog.error(err)
 */
var log4js = require("log4js")

log4js.configure({
	appenders: {
		cheese: {
			type: "file",
			filename: path.join(__dirname, `../public/logs/error_${today}_.log`)
		}
	},
	categories: { default: { appenders: ["cheese"], level: "trace" } }
})

var errorlog = log4js.getLogger("cheese")


module.exports = {
	accesslog,
	errorlog
}