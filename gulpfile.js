var gulp = require('gulp');
var connect = require('gulp-connect');
var inject = require('gulp-inject');
var mocha = require('gulp-mocha');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');

var reload = ['./index.html', './morphon.js'];

gulp.task('connect', function() {
	connect.server({
		root: '.',
    port: '8081',
		livereload: true
	});
});

gulp.task('reload', function() {
	gulp.src(reload)
		.pipe(connect.reload());
});

gulp.task('watch', function() {
	// gulp.watch(reload, ['reload']);
  gulp.watch(['./test/*.js', './morphon.js'], ['mocha']);
});

gulp.task('mocha', function () {
  return gulp.src('./test/*.js')
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('default', ['connect', 'watch']);