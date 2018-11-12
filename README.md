Forked from [Minimal boilerplate for a single-page app using MobX, React and TypeScript with TSX](https://github.com/mobxjs/mobx-react-typescript-boilerplate).
Fork was used to create a display portal for multiple TradingView graphs displayed on the same browser window. Ideal for large screens (ie. flatscreen).

# Usage

* Install Node.js
* `cd client`
* `npm install`
* `cd ../server`
* `npm install`
* `npm start`
* navigate to `[host]:3000`

One page '/charts' shows the rendered TradingView charts. The other page '/config' allows for interactive layout configuration. It is intended that users have a browser open on their flatscreen navigated to '/charts' while they change
layout from another computer navigated ot '/config'. On '/config', users can divide the screen up into rectangles either by horizontally or vertically splitting an existing rectangle, forming a rectangle tree. The leaves
of the tree may render a TradingView chart, there is UI to specify the symbol to chart along with the indicator group to use, the candle width, and chart zoom. Indicator configurations and whole configurations (all layout options, divisions, etc.) can
be saved persistently in the server's file for later use.

# Architecture

The rectangle tree is modeled using a recursive structure of `Division` objects.

Just as the application has a charts and config page, there are `/charts` and `/config` folders under the main `src` folder. `src/charts/DivisionChart` is a component which renders itself recursively for rendering charts in the Division tree. The same
can be said for `src/config/DivisionConfig` as an analogue for the config page.

# Notes

For simplicity sake Webpack Hot Module Reloading is disabled. If you want to use HMR, see the [Reactive2015 demo](https://github.com/mobxjs/mobx-reactive2015-demo) to see a valid setup.