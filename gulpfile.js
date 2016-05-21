'use strict';

var async = require('async');
var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var replace = require('gulp-replace');
var gif = require('gulp-if');
var env = 'development';
var buildId = Number(String(fs.readFileSync('.build')).trim());

var css = [
    './scss/main.scss'
];

var js = [
    './bower_components/jquery/dist/jquery.min.js',
    './bower_components/async/lib/async.js',
    './bower_components/lodash/dist/lodash.min.js',
    './bower_components/dropzone/dist/min/dropzone.min.js',
    './bower_components/fabric/dist/fabric.min.js',
    './bower_components/angular/angular.min.js',
    './bower_components/angular-aria/angular-aria.min.js',
    './bower_components/angular-animate/angular-animate.min.js',
    './bower_components/angular-material/angular-material.min.js',
    './bower_components/angular-fabric/assets/fabric.js',
    './bower_components/angular-fabric/assets/fabricCanvas.js',
    './bower_components/angular-fabric/assets/fabricConstants.js',
    './bower_components/angular-fabric/assets/fabricDirective.js',
    './bower_components/angular-fabric/assets/fabricDirtyStatus.js',
    './bower_components/angular-fabric/assets/fabricUtilities.js',
    './bower_components/angular-fabric/assets/fabricWindow.js',
    './javascripts/config.js',
    './javascripts/app.js',
    './javascripts/services/configService.js',
    './javascripts/services/utilService.js',
    './javascripts/directives/dropzone.js',
    './javascripts/directives/fileOpen.js',
    './javascripts/directives/resizeScreen.js',
    './javascripts/directives/fabric.js',
    './javascripts/controllers/indexController.js'
];

var bg = [
    './views/index.html'
];

gulp.task('html', function() {

    return gulp.src(bg)
        .pipe(replace('%env%', env))
        .pipe(replace('%build\_id%', buildId))
        .pipe(gulp.dest('./'));
});

gulp.task('js', function() {

    return gulp.src(js)
        .pipe(concat('all.js'))
        .pipe(replace(/\%env\%/g, env))
        //.pipe(gif(env === 'production', uglify()))
        .pipe(gulp.dest('./build/' + buildId + '/javascripts'));
});

gulp.task('css', function () {

    return gulp.src(css)
        .pipe(sass())
        .pipe(gif(env === 'production', cleanCss({
            rebase: false
        })))
        .pipe(replace(/\/bower_components\//g, '../../../bower_components/'))
        .pipe(gulp.dest('./build/' + buildId + '/stylesheets'));
});

gulp.task('production', function () {

    env = 'production';

    return gulp.start('css', 'js', 'html');
});

gulp.task('default', function () {

    env = 'development';

    return gulp.start('css', 'js', 'html');
});

gulp.task('watch', function () {

    gulp.start('default');

    return watch([
        './javascripts/*',
        './javascripts/**/*',
        './views/*',
        './scss/*'
    ], function() {
        return gulp.start('default');
    });
});
