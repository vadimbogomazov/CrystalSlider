'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import webpack from 'gulp-webpack';
import webpackConfig from './webpack.config.babel';
import del from 'del';

const paths = {
  src: 'src/',
  dist: 'dist/'
};

// Tasks
gulp.task('clean', (cb) => del([`${paths.dist}**`], cb));

gulp.task('copy', () => {
  return gulp.src(`${paths.src}*.*`)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('webpack', () => {
  return gulp.src(`${paths.src}/crystalslider.js`)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('css', () => {
  return gulp.src(`${paths.src}*.scss`)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(gulp.dest(paths.dist))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', () => {
  gulp.watch(`${paths.src}*.*`, ['copy']);
  gulp.watch(`${paths.src}*.js`, ['webpack']);
  gulp.watch(`${paths.src}*.scss`, ['css']);
});

gulp.task('default', ['clean', 'copy', 'webpack', 'css', 'watch']);
