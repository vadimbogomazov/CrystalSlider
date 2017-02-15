'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import minify from 'gulp-babel-minify';
import rename from 'gulp-rename';
import del from 'del';

const paths = {
  src: 'src',
  dist: 'dist'
};

const pluginName = 'crystalslider';

// Tasks
gulp.task('clean', function (cb) {
  del([`${paths.dist}/**`], cb);
});

gulp.task('sass', function() {
  return gulp.src(`${paths.src}/**.scss`)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sass())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('scripts', function(){
  return gulp.src(`${paths.src}/**.js`)
    .pipe(babel())
    .pipe(minify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', function () {
  gulp.watch(`${paths.src}/${pluginName}.scss`, ['sass']);
  gulp.watch(`${paths.src}/${pluginName}.js`, ['scripts']);
});

gulp.task('default', ['clean', 'sass', 'scripts', 'watch']);
