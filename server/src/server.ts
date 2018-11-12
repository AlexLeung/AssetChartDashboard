import webpack = require('webpack');
import WebpackDevServer = require('webpack-dev-server');
import config from './client.webpack.config';

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: false,
    historyApiFallback: true
}).listen(3000, 'localhost', function (err?: Error) {
    if (err) console.log(err);
    else console.log('Listening at localhost:3000');
});