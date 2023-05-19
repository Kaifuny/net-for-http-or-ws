/**
 * Simple HTTP Server
 * Author: Kaifuny
 * LICENSE: MIT
 */
const { createServer } = require('net')
const path = require('path')

const HTTP_VERSION = 'HTTP/1.1'

const HTTP_METHOD = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
}

const HTTP_STATUS_CODE = {
    OK: 200,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    METHOD_NOT_ALLOWED: 405,
}

const HTTP_STATUS_TEXT = {
    200: 'OK',
    404: 'Not Found',
    500: 'Internal Server Error',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    405: 'Method Not Allowed',
}

const CONTENTTYPE_MAP = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.pdf': 'application/pdf',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.ttf': 'application/font-ttf',
    '.otf': 'application/font-otf',
    '.mp4': 'video/mp4',
}

const parseRequest = (request) => {
    const [header, body] = request.split('\r\n\r\n')
    const [firstLine, ...headersRaw] = header.split('\r\n')
    const [method, path, httpVersion] = firstLine.split(' ')

    const headers = headersRaw.reduce((acc, cur) => {
        const [key, value] = cur.split(': ')
        acc[key] = value
        return acc
    }, {})

    return {
        method,
        path,
        httpVersion,
        headers,
        body,
    }
}

const Response = (statusCode, headers, body) => {
    const header = Object.keys(headers).reduce((acc, cur) => {
        acc += `${cur}: ${headers[cur]}\r\n`
        return acc
    }, '')
    return `${HTTP_VERSION} ${statusCode} ${HTTP_STATUS_TEXT[statusCode]}\r\n${header}\r\n${body}`
}

const Config = {
    port: 8888,
    host: 'localhost',
    root: path.join(__dirname, '../test/www'),
    index: ['/', '/index', '/index.html']
}

const server = createServer((socket) => {
    socket.on('data', (data) => {
        const request = data.toString()
        const {
            method,
            path,
            httpVersion,
            headers,
            body,
        } = parseRequest(request)
        console.log("====================================")
        console.log(`HTTP version: ${httpVersion}`)
        console.log(`Path: ${path}`)
        console.log(`Method: ${method}`)
        console.log(`Headers: ${JSON.stringify(headers)}`)
        console.log(`Body: ${body}`)
        console.log("====================================")

        // 判断 method
        if (!Object.values(HTTP_METHOD).includes(method)) {
            const response = Response(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED, {
                'Content-Type': 'text/plain',
                'Content-Length': 'Method Not Allowed'.length
            }, 'Method Not Allowed')
            socket.write(response)
            socket.end()
            return
        }

        // 根据 path 或者是 header 返回响应内容类型，path 优先级高于 header，如果都没有则默认为 text/plain
        let contentType = 'text/plain'
        Object.keys(CONTENTTYPE_MAP).forEach((key) => {
            if (path.endsWith(key)) {
                contentType = CONTENTTYPE_MAP[key]
            }
        });

        // 默认访问路径设置
        if (method === HTTP_METHOD.GET && Config.index.includes(path)) {
            const response = Response(HTTP_STATUS_CODE.OK, {
                'Content-Type': 'text/plain',
                'Content-Length': 'Hello World'.length
            }, 'Hello World')

            socket.write(response)
            socket.end()
            return    
        }
        

        // 404
        const response = Response(HTTP_STATUS_CODE.NOT_FOUND, {
            'Content-Type': 'text/plain',
            'Content-Length': 'Not Found'.length
        }, 'Not Found')
        socket.write(response)
        socket.end()
    })

    socket.on('error', (data) => {
        console.error('socket error', data)
        const response = Response(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, {
            'Content-Type': 'text/plain',
            'Content-Length': 'Internal Server Error'.length
        }, 'Internal Server Error')
        socket.write(response)
        socket.end()
    })
})

server.on('connection', (data) => {
    console.log('server connection', data.toString())
})

server.listen(Config.port, Config.host, () => {
    console.log('server is running on port 8888')
})
