const gulp = require('gulp');
const projectConfig = require('./projectConfig.json');
const path = projectConfig.path;
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const rename = require("gulp-rename");
const gcmq = require('gulp-group-css-media-queries');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const del = require('del');

const webpackConf = {
    mode: isDev() ? 'development' : 'production',
    devtool: isDev() ? 'eval-source-map' : false,
    optimization: {
        minimize: false
    },
    output: {
        filename: 'script.js',
    },
    module: {
        rules: []
    }
}

if(isProd()){
    webpackConf.module.rules.push({
        test: /\.(js)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
    });
}

function isDev() {
    return !argv.prod;
}

function isProd() {
    return !!argv.prod;
}

function browserLive() {
    browserSync.init({
        open: true,
        server: path.dist.distPath
    });
}

function watch(){
    gulp.watch(path.watch.html, html);
    gulp.watch(path.watch.style, scss);
    gulp.watch(path.watch.script, script);
    gulp.watch(path.watch.image, imageMin);
    gulp.watch(path.watch.font, font);
}

function font() {
    return gulp.src(path.src.font)
        .pipe(gulp.dest(path.dist.font))
        .on('end', browserSync.reload);
}

function favicon() {
    return gulp.src(path.src.favicon)
        .pipe(gulp.dest(path.dist.favicon))
        .on('end', browserSync.reload);
}

function imageMin(){
    return gulp.src(path.src.image)
        .pipe(newer(path.dist.image))
        .pipe(imagemin([
            imageminJpegRecompress({
                progressive: true,
                min: 70, max: 75
            }),
            pngquant({
                speed: 5,
                quality: [0.6, 0.8]
            }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { removeUnusedNS: false },
                    { removeUselessStrokeAndFill: false },
                    { cleanupIDs: false },
                    { removeComments: true },
                    { removeEmptyAttrs: true },
                    { removeEmptyText: true },
                    { collapseGroups: true }
                ]
            })
        ]))
        .pipe(gulp.dest(path.dist.image))
        .on('end', browserSync.reload);
}

function script(){
    return gulp.src(path.src.script)
        .pipe(plumber())
        .pipe(webpackStream(webpackConf, webpack))
        .pipe(gulpif(isProd(), uglify()))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.dist.script))
        .pipe(browserSync.reload({stream: true}))
}

function scss(){
    return gulp.src(path.src.style)
        .pipe(gulpif(isDev(), sourcemaps.init()))
        .pipe(sass())
        .pipe(gulpif(isProd(), autoprefixer({
            grid: true
        })))
        .pipe(gulpif(isProd(), gcmq()))
        .pipe(gulpif(isDev(), sourcemaps.write()))
        .pipe(gulpif(isProd(), csso()))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.dist.style))
        .pipe(browserSync.reload({stream: true}))
}

function html() {
    return gulp.src(path.src.html)
        .pipe(gulp.dest(path.dist.html))
        .on('end', browserSync.reload);
}

function clean(){
    return del([path.dist.distPath]);
}

exports.default = gulp.series(
    gulp.parallel(clean),
    gulp.parallel(html, scss, script, imageMin, favicon, font),
    gulp.parallel(watch, browserLive)
);
