let projectFolder = 'dist';
let sourceFolder = '#src';

let path = {
	build: {
		html: projectFolder + "/",
		css: projectFolder + "/css/",
		js: projectFolder + "/js/",
		img: projectFolder + "/img/",
		fonts: projectFolder + "/fonts/"
	},
	src: {
		html: [sourceFolder + "/*.html","!"+ sourceFolder + "/_*.html" ],
		css: sourceFolder + "/css/style.scss",
		js: sourceFolder + "/js/main.js",
		img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: sourceFolder + "/fonts/*.ttf",
	},
	watch: {
		html: sourceFolder + "/**/*.html",
		css: sourceFolder + "/css/**/*.scss",
		js: sourceFolder + "/js/**/*.js",
		img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		},
	clean:"./" + projectFolder + "/",

}

let {src,dest} = require('gulp'),
	 gulp = require('gulp'),
	 browserSync = require('browser-sync').create(),
	 fileinclude = require('gulp-file-include'),
	 del = require('del'),
	 scss = require('gulp-sass'),
	 autoprefixer = require('gulp-autoprefixer'),
	 groupMedia = require('gulp-group-css-media-queries'),
	 cleanCss = require('gulp-clean-css'),
	 rename = require('gulp-rename'),
	 uglifyJs = require('gulp-uglify-es').default,
	 babel = require('gulp-babel'),
	 imgmin = require('gulp-imagemin'),
	 webp = require('gulp-webp'),
	 gulpWebpHtml = require('gulp-webp-html'),
	 webpcss = require('gulp-webp-css'),
	 ttf2woff = require('gulp-ttf2woff'),
	 ttf2woff2 = require('gulp-ttf2woff2'),
	 fs = require('fs');


	 function Browsersync() {
	 	browserSync.init({
	 		server: {
	 			baseDir: "./" + projectFolder + "/"
	 		},
	 		port:3000,
	 		notify: false 
	 	})
	 }

	 function html() {
	 	return src(path.src.html)
	 	.pipe(fileinclude())
	 	.pipe(gulpWebpHtml())
	 	.pipe(dest(path.build.html))
	 	.pipe(browserSync.stream())
	 }
	 function clean() {
	 	return del(path.clean);
	 }
	 function watchFiles() {
	 	gulp.watch([path.watch.html],html);
	 	gulp.watch([path.watch.css],css);
	 	gulp.watch([path.watch.js],js);
	 	gulp.watch([path.watch.img],img);
	 }

	 function css() {
	 	return src(path.src.css)
	 	.pipe(scss ({
	 		outputStyle: "expanded"
	 	}))
	 	.pipe(groupMedia())
	 	.pipe(
	 		autoprefixer({
	 			overrideBrowserslist:['last 5 versions'],
	 			cascade:true
	 		})
	 		)
	 	.pipe(webpcss(
	 		{webpClass: '.webp',noWebpClass: '.no-webp'}))
	 	.pipe(dest(path.build.css))
	 	.pipe(cleanCss())
	 	.pipe(
	 		rename({
	 			extname:'.min.css'
	 		}))
	 	.pipe(dest(path.build.css))
	 	.pipe(browserSync.stream())
	 }

	 function js() {
	 	return src(path.src.js)
	 	.pipe(fileinclude())
	 	.pipe(dest(path.build.js))
	 	.pipe(
	 		uglifyJs()
	 		  )
	 	.pipe(
	 		babel({
            presets: ['@babel/env']
        })
	 		)
	 	.pipe(
	 		rename({
	 			extname:'.min.js'
	 		}))
	 	.pipe(dest(path.build.js))
	 	.pipe(browserSync.stream())	
	 }

	 function img() {
	 	return src(path.src.img)
	 	.pipe(webp({
	 		quality:70
	 	}))
	 	.pipe(dest(path.build.img))
	 	.pipe(src(path.src.img))
	 	.pipe(
	 		imgmin({
	 			progressive:true,
	 			svgoPlugins:[{removeViewBox:false}],
	 			interlaced:true,
	 			optimizationLevel:3
	 		}))
	 	.pipe(dest(path.build.img))
	 	.pipe(browserSync.stream())
	 }


	 function fonts() {
	 	src(path.src.fonts)
	 	.pipe(ttf2woff())
	 	.pipe(dest(path.build.fonts));
	 	return src(path.src.fonts)
	 	.pipe(ttf2woff2())
	 	.pipe(dest(path.build.fonts));
	 }

	 function setFonts() {
	 	let file_content = fs.readFileSync(sourceFolder + '/css/fonts.scss');
		if (file_content == '') {
		fs.writeFile(sourceFolder + '/css/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
		if (items) {
		let c_fontname;
		for (var i = 0; i < items.length; i++) {
		let fontname = items[i].split('.');
		fontname = fontname[0];
		if (c_fontname != fontname) {
		fs.appendFile(sourceFolder + '/css/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
		}
		c_fontname = fontname;
		}
		}
		})
		}
	 }

	 function cb() {

	 }

	 let build = gulp.series(clean,gulp.parallel(css,html,js,img,fonts),setFonts);
	 let watch = gulp.parallel(build, watchFiles, Browsersync);


	 exports.setFonts = setFonts;
	 exports.img =img;
	 exports.fonts = fonts;
	 exports.js = js;
	 exports.css = css;	
	 exports.build = build;
	 exports.html = html;
	 exports.watch = watch;
	 exports.default = watch;

