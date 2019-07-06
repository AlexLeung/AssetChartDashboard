import * as path  from 'path';
import {Configuration} from 'webpack';

const clientPath = '../client'
const configuration: Configuration = {
    mode: "development",
    devtool: 'eval',
    entry: [
        `${clientPath}/src/index`
    ],
    output: {
        path: path.resolve(`${clientPath}/dist`),
        filename: 'bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader"
        }]
    }
};
export default configuration;
