# TriTune
A modular accessible instrument based on Web Audio API

## Setup

### Prerequisites
You will need nodejs and ruby installed beforehand as well.
```sh
npm install -g bower gulp node-serve
# we will need sass
gem install sass
```

### Install dependencies & build
```sh
npm install
bower install
gulp build
```

### Running options
the easiest way
```sh
# launches gulp build and gulp serve
gulp
```
just serving
```sh
# launches static server, watch and livereload
gulp serve
```
less resource heavy opiton
```sh
# open in 2 tabs
serve --path dist
gulp watch
```

### Connecting with the R-iOT module
After you have linked your device with the R-iOT module this script will listen for osc (Open Sound Control) messages that the R-iOT will send through UDP and then relay them via sockets to the web client.
```sh
node riot.js
```
