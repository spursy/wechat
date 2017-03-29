var sha1 = require('sha1')
var getRawBody = require('raw-body')
var weChatClass = require('./weChatPublic')
var xmlUtil = require('../util/xmlUtil')

module.exports = function (params, handler) {
        return async function(ctx, next) {
                    var weChat = new weChatClass(params)
                    var token = params.token
                    var signature = ctx.query.signature
                    var nonce = ctx.query.nonce
                    var timestamp = ctx.query.timestamp
                    var echostr = ctx.query.echostr
                    var str = [token, timestamp, nonce].sort().join('')
                    var sha = sha1(str)

                    if (ctx.method === 'GET') {
                        if (sha === signature){
                            ctx.body = echostr + ''
                        }
                        else {
                            ctx.body = 'wrong'
                        }
                    } else if (ctx.method === 'POST') {
                        if (sha !== signature){
                            ctx.body = 'wrong'
                            return false
                        }
                        var data =  await getRawBody(ctx.req, {
                            length: this.length,
                            limit: '1mb',
                            encoding: this.charset
                        })
                        
                        var content = await xmlUtil.parseXMLAsync(data)
                         var mes = await xmlUtil.formatMessage(content.xml)
                        this.weixin = mes
                        await handler.call(this, next)
                        await weChat.reply.call(this,ctx, next)
                    }  
        }      
}


