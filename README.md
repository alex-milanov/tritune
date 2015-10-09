# TriTune
A modular accessible instrument based on Web Audio API

## Setup

### Dependencies
```sh
npm install -g gulp node-serve
# we will need sass
gem install sass
```

### Install & build
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
