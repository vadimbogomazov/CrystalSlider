'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import babelminify from 'gulp-babel-minify';
import rename from 'gulp-rename';
import del from 'del';

const paths = {
  src: 'src',
  dist: 'dist'
};

// Tasks
gulp.task('clean', (cb) => del([`${paths.dist}/**`], cb));

gulp.task('copy', () => {
  return gulp.src(`${paths.src}/*.*`)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('sass', () => {
  return gulp.src(`${paths.src}/*.scss`)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('scripts', () => {
  return gulp.src(`${paths.src}/*.js`)
    .pipe(babel())
    .pipe(babelminify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', () => {
  gulp.watch(`${paths.src}/*.*`, ['copy']);
  gulp.watch(`${paths.src}/*.scss`, ['sass']);
  gulp.watch(`${paths.src}/*.js`, ['scripts']);
});

gulp.task('default', ['clean', 'copy', 'sass', 'scripts', 'watch']);
