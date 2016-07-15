// gulp
var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var ghPages = require('gulp-gh-pages');

gulp.task('deploy', function() {
	return gulp.src('app/**/*')
		.pipe(ghPages());
});

gulp.task('connect', function () {
	connect.server({
		root: 'app/',
		port: 8080
	});
});
