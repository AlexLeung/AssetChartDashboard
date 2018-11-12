import * as path  from 'path';
import * as webpack from 'webpack';

const clientPath = '../../client'
const configuration: webpack.Configuration = {
    mode: "development",
    devtool: 'eval',
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        `${clientPath}/src/index`
    ],
    output: {
        path: path.resolve(`${clientPath}/dist`),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader",
            include: path.resolve(`${clientPath}/src`)
        }]
    }
};

export default configuration;
