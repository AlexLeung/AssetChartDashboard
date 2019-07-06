import webpack = require('webpack');
import WebpackDevMiddleware = require('webpack-dev-middleware');
import config from './client.webpack.config';
import express from 'express';
import * as path from 'path';
import WebSocket from 'ws';
import http from 'http';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const expressApp = express();
const clientApplicationWebpackCompiler = webpack(config);
expressApp.use(WebpackDevMiddleware(clientApplicationWebpackCompiler,{publicPath: '/',logLevel:'error'}));
expressApp.get('/', function(req, res) {
    const resetStyling: React.CSSProperties = {
        margin: 0,
        padding: 0,
        width: "100%",
        height: "100%"
    };
    const indexPage = (
        <html style={resetStyling}>
            <head>
                <title>Asset Dashboard</title>
            </head>
            <body style={resetStyling}>
                <script type="text/javascript" src="https://s3.tradingview.com/tv.js" />
                <div id="root" style={resetStyling} />
                <script src="/bundle.js" />
            </body>
        </html>
    );
    res.send(renderToStaticMarkup(indexPage));
});

let greatestConnectionIdRegistered = 0;
const connections: {[key: number]: WebSocket} = {};

//clientApplicationWebpackCompiler.hooks.afterCompile.tap("after-compile-hook",function() {
//    console.log("after compile hook activated");
//});

clientApplicationWebpackCompiler.hooks.afterEmit.tap("after-emit-hook", function(){
    console.log("after emit hook activated");
});

const server = http.createServer()
const webSocketServer = new WebSocket.Server({server});
server.on('request', expressApp);
server.listen(3000, function() {
    console.log("Listening as localhost:3000");
});

webSocketServer.on('connection', function(webSocket) {
    connections[greatestConnectionIdRegistered++] = webSocket;
    console.log("connected");
    webSocket.on('message', function(message) {
        console.log("received");
        console.log(typeof message.valueOf());
        console.log(message.valueOf());
        console.log((message as any).message);
    })
})

/*
new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: false,
    historyApiFallback: true
}).listen(3000, 'localhost', function (err?: Error) {
    if (err) console.log(err);
    else console.log('Listening at localhost:3000');
});
*/