/*
Hey! Welcome to the gulpfile. Here's the bit you'll have to work with
if you want to modify how your site is compiled. 
*/

/*
These are dependencies. They're also listed in package.json, which
automatically installs them when you type in `npm install`
*/
var gulp = require('gulp');
var _ = require('lodash');
var yml = require('gulp-yml');
var print = require('gulp-print');
var stripBom = require('gulp-stripbom');
var removeEmptyLines = require('gulp-remove-empty-lines');
var plumber = require('gulp-plumber');
var jsonEditor = require('gulp-json-editor');
var jsonCombine = require('gulp-jsoncombine');
var del = require('del');
var rename = require('gulp-rename');
var ignore = require('gulp-ignore');
var handlebars = require('gulp-compile-handlebars');
var handlebarsHelpers = require('diy-handlebars-helpers');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');
var markdown = require('gulp-markdown');
var toc = require('gulp-toc');

/* This dependency is special. It powers all of the bits
that I couldn't build with off-the-shelf parts. */
var arglebargle = require('arglebargle');

/* Type `gulp clean` to delete the target directory */
gulp.task('clean', function(){
    del('target'); 
});

/* Convert the yaml posts into JSON, then render them. 
    This is an intermediary stage - these JSON files
    aren't part of the final output. 
*/
gulp.task('compile_posts', function(cb){
    return gulp.src('./source/posts/*.yaml')
        .pipe(print())
        .pipe(stripBom())
        .pipe(plumber())
        .pipe(yml())
        .pipe(arglebargle.appendFileinfo())
        .pipe(arglebargle.tidyInput())
        .pipe(arglebargle.render())
        .pipe(gulp.dest('./target/json/posts'));
});

gulp.task('concatenate_posts', ['compile_posts'], function(){
    return gulp.src('./target/json/posts/*.json')
        .pipe(jsonCombine("posts.json",function(data){
            return new Buffer(JSON.stringify(data));   
        }))
        .pipe(jsonEditor(function(json){return json;}))
        .pipe(gulp.dest('./target/json/'));
});

gulp.task('compile_config', function(){
    return gulp.src('./source/config.yaml')
        .pipe(yml())
        .pipe(rename("config.json"))
        .pipe(gulp.dest('./target/json/'));
});

gulp.task('compile_index', ['concatenate_posts'], function(){
    return gulp.src('./target/json/posts.json')
        .pipe(arglebargle.buildIndex())
        .pipe(rename("index.json"))
        .pipe(gulp.dest('./target/json/'));
});

gulp.task('compile_categories', ['concatenate_posts'], function(){
    return gulp.src('./target/json/posts.json')
        .pipe(arglebargle.buildCategories())
        .pipe(rename("categories.json"))
        .pipe(gulp.dest('target/json/'));
});

gulp.task('concatenate_master', ['compile_config', 'compile_index', 'compile_categories'], function(){
    return gulp.src('./target/json/*.json') 
        .pipe(ignore.include(function(file){
            return (file.path.indexOf("config.json") > -1 ||
                    file.path.indexOf("index.json") > -1 ||
                    file.path.indexOf("categories.json") > -1);
        }))
        .pipe(jsonCombine("master.json",function(data){
            return new Buffer(JSON.stringify(data));   
        }))
        .pipe(jsonEditor(function(json){return json;}))
        .pipe(gulp.dest('./target/json/'));
});

gulp.task('sass', function(){
    return gulp.src('./source/theme/scss/*.scss')
        .pipe(plumber())
        .pipe(sass({require:['susy', 'breakpoint']}))
        .pipe(gulp.dest('./target/css/'))
});

gulp.task('css', function(){
    return gulp.src('./source/theme/css/*.css')
        .pipe(concat('css_bundle.css'))
        .pipe(gulp.dest('./target/css/'))
});

gulp.task('images', function(){
    return gulp.src('./source/theme/images/*')
        .pipe(gulp.dest('./target/images/'))
});


gulp.task('pages', function(){
    return gulp.src(['./source/pages/*.md', './README.md'])
        .pipe(markdown())
        .pipe(toc())
        .pipe(gulp.dest('./target/partials/'))
});

gulp.task('partials', ['concatenate_master', 'pages', 'sass', 'css', 'images'], function(cb){
    gulp.src('./target/json/master.json')
        .pipe(jsonEditor(function(json){
            gulp.src('./source/theme/partials/*.handlebars')
            .pipe(print())
            .pipe(handlebars(json, {
                'helpers': handlebarsHelpers,
                'partials': {
                    'css': "<link rel='stylesheet' href='css/minimal.css'>\n"+
                           "<link rel='stylesheet' href='css/css_bundle.css'>",
                    'js': "<script src='js/bundle.js'></script>"
                }
            }))
            .pipe(rename({extname:'.html'}))
            .pipe(gulp.dest('./target/partials/'))
            .on('end', cb)
            
            return json;
        }))
});

gulp.task('posts_html', ['partials'], function(){
    return gulp.src('target/json/master.json')
        .pipe(jsonEditor(function(master){
            gulp.src('target/json/posts/*.json')
                .pipe(jsonEditor(function(post){
                    var post = arglebargle.addMetadataToPost(post, master);
                    gulp.src('source/theme/single.handlebars')
                        .pipe(handlebars(post, {
                            'batch':['./target/partials'],
                            'helpers': handlebarsHelpers, 
                        }))
                        .pipe(rename(post.id + ".html"))
                        .pipe(gulp.dest('./target'))
                        .pipe(print())
                    return {};
                }));
            return {};
        }))
});

gulp.task('rss', ['concatenate_master'], function(){
    return gulp.src('target/json/master.json')
        .pipe(jsonEditor(function(master){
            gulp.src('source/theme/rss.handlebars')
                .pipe(handlebars(arglebargle.addMetadataToMaster(master), {
                    'helpers': handlebarsHelpers, 
                }))
                .pipe(rename("rss.xml"))
                .pipe(gulp.dest('./target'))
                .pipe(print())
            return {};
        }));
});

gulp.task('index_html', ['partials'], function(){
    return gulp.src('target/json/master.json')
        .pipe(jsonEditor(function(master){
            gulp.src('source/theme/index.handlebars')
                .pipe(handlebars(arglebargle.addMetadataToMaster(master), {
                    'batch':['./target/partials'],
                    'helpers': handlebarsHelpers, 
                }))
                .pipe(rename("index.html"))
                .pipe(gulp.dest('./target'))
                .pipe(print())
            return {};
        }));
});

gulp.task('other_pages', ['partials'], function(){
    return gulp.src('target/json/master.json')
        .pipe(jsonEditor(function(master){
            gulp.src('source/theme/*.handlebars')
                .pipe(ignore.exclude(function(file){
                    return (file.path.indexOf("index.handlebars") > -1 ||
                            file.path.indexOf("single.handlebars") > -1 ||
                            file.path.indexOf("rss.handlebars") > -1);
                }))
                .pipe(handlebars(arglebargle.addMetadataToMaster(master), {
                    'batch':['./target/partials'],
                    'helpers': handlebarsHelpers, 
                }))
                .pipe(rename({'extname':'.html'}))
                .pipe(gulp.dest('./target'))
                .pipe(print())
            return {};
        }));
});

gulp.task('default', ['index_html', 'posts_html', 'other_pages', 'rss'], function(){
});

gulp.task('watch', function(){
    gulp.watch("./source/theme/scss/*", ['sass'])
    gulp.watch("./source/theme/css/*", ['css'])
    gulp.watch("./source/theme/images/*", ['images'])
    gulp.watch("./source/theme/*.handlebars", ['default'])
    gulp.watch("./source/theme/partials/*", ['default'])
    gulp.watch("./source/posts/*", ['default'])
    gulp.watch("./source/pages/*", ['default'])
    gulp.watch("./source/pages/config.yaml", ['default'])
    gulp.watch("./README.md", ['default'])
});
