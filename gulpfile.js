
var gulp = require('gulp');

// Plugins
var filter     = require('gulp-filter');
var gutil      = require('gulp-util');
var sass       = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify     = require('gulp-uglify');

// Packages
var browserify  = require('browserify');
var watchify    = require('watchify');
var buffer      = require('vinyl-buffer');
var source      = require('vinyl-source-stream');
var browserSync = require('browser-sync');

var assetsBasePath = './app/Resources/public/';
var destBasePath   = './web/';

gulp.task('default', ['styles', 'watch', 'scripts:app:watch', 'browsersync']);
gulp.task('build', ['styles', 'scripts']);

// ** Brower-Sync

gulp.task('browsersync', function() {
    browserSync({
        open: true,
        proxy: "localhost"
    });
});

// ** Build styles

gulp.task('styles',['styles:app','styles:vendor']);

gulp.task('styles:vendor', function() {
    // alternative: an other sass file with imports to customize
    // the bootstrap
    return gulp.src([
            './node_modules/bootstrap/dist/css/bootstrap*'
        ])
        .pipe(gulp.dest(destBasePath + 'css'));
});

gulp.task('styles:app', function(){
    return gulp.src(assetsBasePath + 'styles/base.scss')
        .pipe(sass())
        .on('error', gutil.log.bind(gutil, 'Sass Error'))
        .pipe(gulp.dest(destBasePath + 'css'))
        .pipe(filter('**/*.css'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('watch', function () {
    gulp.watch(assetsBasePath + 'styles/**/*.scss', ['styles:app']);
    gulp.watch(['./app/**/*','./src/**/*'],browserSync.reload());
});

// ** Build scripts

gulp.task('scripts', ['scripts:vendor', 'scripts:app']);

gulp.task('scripts:vendor', function () {
    return gulp.src([
            './node_modules/jquery/dist/*',
            './node_modules/tether/dist/js/*',
            './node_modules/bootstrap/dist/js/bootstrap*.js'
        ])
        .pipe(gulp.dest(destBasePath + 'js'));
});

gulp.task('scripts:app', function () {
    var bundler = browserify(assetsBasePath + 'scripts/main.js');

    return bundler.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(destBasePath + 'js'));
});

gulp.task('scripts:app:watch', function() {
    watchify.args.debug = true;
    var bundler = watchify(browserify(assetsBasePath + 'scripts/main.js', watchify.args));

    bundler.on('update', rebundle);
    bundler.on('log', gutil.log.bind(gutil));

    function rebundle() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('markers.js'))
            .pipe(gulp.dest('./build'));
    }

    return rebundle();
});