const gulp = require("gulp");

const paths = {
    public: ["public/**/*.*"],
}

gulp.task("default", () => {
    return gulp.src(paths.public).pipe(gulp.dest("dist"));
})