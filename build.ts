const fs = require('fse')
const builders = require('./builders.ts')

function recreateBuildDirectory() {
    // This function collects information about the directory
    fs.stat('build/', function(err: any, stats: any) {

        // Make sure that 'build/' exists and is a directory
        if (stats && stats.isDirectory()) {
            // Remove the build directory, and use recursive to remove all of its contents as well
            fs.rmdirSync('build/', { recursive: true }, function(rmdirError: any) {
                if (!rmdirError) {
                    console.log("Build directory removed")
                    fs.mkDirSync('build/')
                } else {
                    console.log(rmdirError)
                }
            })
        } else {
            fs.mkDir('build/')
        }
    })
}

recreateBuildDirectory()
builders.renderAllPugFiles('views/', 'build/')
builders.minifyAllSass('public/styles/', 'build/styles/')
builders.minifyAllTS('public/scripts/', 'build/scripts/')