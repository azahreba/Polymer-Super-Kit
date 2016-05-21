/// <binding BeforeBuild='before-build' />
/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = {
  'autoprefixer': require('gulp-autoprefixer'),
  'cache': require('gulp-cache'),
  'changed': require('gulp-changed'),
  'cssmin': require('gulp-cssmin'),
  'if': require('gulp-if'),
  'imagemin': require('gulp-imagemin'),
  'jshint': require('gulp-jshint'),
  'minifyHtml': require('gulp-minify-html'),
  'rename': require('gulp-rename'),
  'size': require('gulp-size'),
  'uglify': require('gulp-uglify'),
  'useref': require('gulp-useref')
};
var connect = require('gulp-connect');
var del = require('del');
var runSequence = require('run-sequence');
var polybuild = require('polybuild');
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var sass = require('gulp-sass');
var ts = require('gulp-typescript');
var merge = require('merge2');
var replace = require('gulp-replace');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var DEST_DIR = 'extension';

var styleTask = function (stylesPath, srcs) {
  return gulp.src(srcs.map(function (src) {
    return path.join('.tmp', stylesPath, src);
  }))
    .pipe($.changed(stylesPath, { extension: '.css' }))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe($.if('*.css', $.cssmin()))
    .pipe(gulp.dest('www/' + stylesPath))
    .pipe($.size({ title: stylesPath }));
};

gulp.task('sass', function () {
  return gulp.src('app/**/*.scss')
    .pipe(sass({
      'includePaths': ['./app/styles/']
    }).on('error', sass.logError))
    .pipe(gulp.dest('.tmp'))
    .pipe(connect.reload());
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  return styleTask('styles', ['**/*.css']);
});

gulp.task('elements', function () {
  return styleTask('elements', ['**/*.css']);
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      'app/scripts/**/*.js',
      'app/elements/**/*.js',
      'app/elements/**/*.html'
  ])
    .pipe($.jshint.extract()) // Extract JS from .html files
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('www/images'))
    .pipe($.size({ title: 'images' }));
});

gulp.task('typescript', function () {
  var tsResult = gulp.src([
    'app/scripts/main.ts',
    'app/elements/**/*.ts',
    'app/scripts/**/*.ts'
  ])
  .pipe(ts({
    target: 'es5',
    noImplicitAny: true,
    suppressImplicitAnyIndexErrors: true,
    sourceMap: true,
    experimentalDecorators: true,
    inlineSourceMap: true,
    inlineSources: true,
    out: 'output.js'
  }));

  return tsResult.js.pipe(gulp.dest('.tmp'))
      .pipe(connect.reload());
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
  var app = gulp.src([
    '.tmp/**/*.js',
    '.tmp/**/*.css',
    'app/*',
    '!app/test',
    '!app/precache.json'
  ], {
    dot: true
  }).pipe(gulp.dest('www'));

  var media = gulp.src([
    'app/media/**/*'
  ]).pipe(gulp.dest('www/media'));

  var locales = gulp.src([
    'app/_locales/**/*'
  ]).pipe(gulp.dest('www/_locales'));

  var scripts = gulp.src([
    'app/scripts/**/*.js'
  ]).pipe(gulp.dest('www/scripts'));

  var bower = gulp.src([
    'app/bower_components/**/*',
    '!app/bower_components/**/{demo,test}/*',
    '!app/bower_components/**/{demo,test}'
  ]).pipe(gulp.dest('www/bower_components'));

  var elements = gulp.src(['app/elements/**/*.html'])
    .pipe(gulp.dest('www/elements'));

  var swBootstrap = gulp.src(['app/bower_components/platinum-sw/bootstrap/*.js'])
    .pipe(gulp.dest('www/elements/bootstrap'));

  var swToolbox = gulp.src(['app/bower_components/sw-toolbox/*.js'])
    .pipe(gulp.dest('www/sw-toolbox'));

  var polybuilt = gulp.src(['app/index.html'])
    //.pipe($.rename('index.build.html'))
    .pipe(gulp.dest('www/'));

  return merge(media, locales, app, scripts, bower, elements, polybuilt, swBootstrap, swToolbox)
    .pipe($.size({ title: 'copy' }));
});

// Copy app Fonts To www
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('www/fonts'))
    .pipe($.size({ title: 'fonts' }));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var assets = $.useref.assets({ searchPath: ['.tmp', 'app', 'www'] });

  return gulp.src([
      'app/**/*.html',
      '!app/bower_components/**',
      '!app/{elements,test}/**/*.html'
    ])
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({ preserveComments: 'some' })))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.cssmin()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output Files
    .pipe(gulp.dest('www'))
    .pipe($.size({ title: 'html' }));
});

// Vulcanize+Crisper+Polyclean imports
gulp.task('polybuild-polymer', function () {
  return gulp.src('www/bower_components/polymer/*.html')
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR + '/bower_components/polymer'))
    .pipe($.size({ title: 'polybuild-polymer' }));
});

gulp.task('polybuild-iron', function () {
  return gulp.src([
      'www/bower_components/iron-*/iron-*.html',
      '!www/bower_components/**/{demo,test}/**'
    ])
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR + '/bower_components'))
    .pipe($.size({ title: 'polybuild-iron' }));
});

gulp.task('polybuild-paper', function () {
  return gulp.src([
      'www/bower_components/paper-e*/paper-*.html',
      '!www/bower_components/**/{demo,test}/**'
    ])
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR + '/bower_components'))
    .pipe($.size({ title: 'polybuild-paper' }));
});

gulp.task('polybuild-platinum', function () {
  return gulp.src([
      'www/bower_components/platinum-*/*.html',
      '!www/bower_components/**/{demo,test}/**'
    ])
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR + '/bower_components'))
    .pipe($.size({ title: 'polybuild-platinum' }));
});

gulp.task('polybuild-prism', function () {
  return gulp.src([
      'www/bower_components/prism-*/*.html',
      '!www/bower_components/**/{demo,test}/**'
    ])
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR + '/bower_components'))
    .pipe($.size({ title: 'polybuild-prism' }));
});

gulp.task('polybuild-marked', function () {
  return gulp.src([
      'www/bower_components/marked-*/*.html',
      '!www/bower_components/**/{demo,test}/**'
    ])
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR + '/bower_components'))
    .pipe($.size({ title: 'polybuild-marked' }));
});

gulp.task('polybuild-neon', function () {
  return gulp.src([
      'www/bower_components/neon-*/*.html',
      '!www/bower_components/**/{demo,test}/**'
    ])
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR + '/bower_components'))
    .pipe($.size({ title: 'polybuild-neon' }));
});

gulp.task('polybuild-index', function () {
  return gulp.src('www/index.html')
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.size({ title: 'polybuild-index' }));
});

gulp.task('polybuild-elements', function () {
  return gulp.src('www/elements/elements.html')
    .pipe(polybuild({suffix: ''}))
    .pipe(gulp.dest(DEST_DIR + '/elements'))
    .pipe($.size({ title: 'polybuild-elements' }));
});

gulp.task('polybuild', function () {
  runSequence(
    'polybuild-polymer',
    'polybuild-iron',
    'polybuild-marked',
    'polybuild-neon',
    //'polybuild-paper',
    'polybuild-platinum',
    'polybuild-prism',

    'polybuild-index',
    'polybuild-elements'
    );
});

// Generate a list of files that should be precached when serving from 'www'.
// The list will be consumed by the <platinum-sw-cache> element.
gulp.task('precache', function (callback) {
  var dir = 'www';

  glob('{elements,scripts,styles}/**/*.*', { cwd: dir },
      function (error, files) {
    if (error) {
      callback(error);
    } else {
      files.push('index.html', './',
          'bower_components/appcomponentsjs/appcomponents-lite.min.js');
      var filePath = path.join(dir, 'precache.json');
      fs.writeFile(filePath, JSON.stringify(files), callback);
    }
  });
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'www']));

// Watch Files For Changes & Reload
gulp.task('serve',
    ['html', 'typescript', 'sass'],
    function () {
  //connect.server({
  //  root: ['.tmp/', 'app'],
  //  port: 8000,
  //  livereload: true
  //});
  
  gulp.watch([
    'app/elements/**/*.html'],
    ['html']);
  gulp.watch([
    'app/elements/**/*.ts',
    'app/scripts/**/*.ts'
  ], ['typescript']);
  gulp.watch([
    'app/elements/**/*.scss',
    'app/styles/**/*.scss'
  ], ['sass']);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence(
    'typescript',
    'sass',
    ['copy', 'styles'],
    'elements',
    ['images', 'fonts', 'html'],
    'polybuild',
    cb);
  // Note: add , 'precache' , after 'polybuild', if your are going to use Service Worker
});

// Load tasks for app-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('app-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) { }