import { parse } from "dotenv"

const FileAPI = require('file-api')
const FileAPIFile: any = FileAPI.File
const FileAPIReader: any = FileAPI.FileReader
const sass = require('sass')
const cleanCSS = require('clean-css')
const typescript = require('typescript')
const uglify = require('uglify-js')
const glob = require('glob')
const pug = require('pug')
const fse = require('fse')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

function minifyFile(srcFile: string, srcFolder: string, destFolder: string) {
    const fileReader = new FileAPIReader()
    const fileReaderFile = srcFolder + srcFile
    let destFile = srcFile
    fileReader.readAsText(new FileAPIFile(fileReaderFile))

    fileReader.on('loadend', () => {
        let data

        if (srcFile.endsWith('.sass') || srcFile.endsWith('scss')) {
            const css = sass.renderSync({ file: srcFolder + srcFile }).css.toString()
            data = new cleanCSS({}).minify(css).styles
            destFile = srcFile.replace('.sass' || '.scss', '.css')
        }

        if (srcFile.endsWith('.ts')) {
            const transpiledCode = typescript.transpileModule(fileReader.result, 
                {
                    compilerOptions: {
                        // module: typescript.ModuleKind.CommonJS,
                        module: typescript.ModuleKind.module,
                        target: 'ES6'
                    }
                }
            )
            data = uglify.minify(transpiledCode.outputText).code
            // data = transpiledCode.outputText
            destFile = srcFile.replace('.ts', '.js')
        }

        fse.writeFile(destFolder + destFile, data, (error: any) => {
            if (!error) 
                console.log(`${destFile} successfully minified`)
            else 
                console.error(`${destFile} could not be written to: ${error}`)
        })
    })
}

function minifyAllSass(srcFolder: string, destFolder: string) {
    glob(srcFolder + ('*.sass' || '*.scss'), 'cwd', function(error: any, files: any) {
        if (!error) {
            files.map((file: string) => {
                file = file.replace('public/', '')
                file = file.replace('styles/', '')
                minifyFile(file, srcFolder, destFolder)
            })
        } else {
            console.error(error)
        }
    }) 
}

function minifyAllTS(srcFolder: string, destFolder: string) {
    glob(srcFolder + '*.ts', 'cwd', function(error: any, files: any) {
        if (!error) {
            files.map((file: string) => {
                file = file.replace('public/', '')
                file = file.replace('scripts/', '')
                minifyFile(file, srcFolder, destFolder)
            })
        } else {
            console.error(error)
        }
    }) 
}

function renderPug(srcFile: string, srcFolder: string, destFolder: string) {
    const compiledSource = pug.renderFile(srcFolder + srcFile)
    const fileName = srcFile.replace('.pug', '')
    // console.log('filename: ' + fileName)
    const additionalDir = fileName === 'index' ? '' : fileName + '/'
    const newFileLocation = destFolder + additionalDir + 'index.html'
    // console.log(compiledSource)
    const dom = new JSDOM(compiledSource)
    // const parsedHTML = new DOMParser().parseFromString(compiledSource, 'text/html')
    let head = dom.window.document.head
    let body = dom.window.document.body
    // console.log('addition dir: ' + additionalDir)
    const reg = /\//g
    const levels = [...additionalDir.matchAll(reg)].length
    // console.log(levels)
    let prelink: string = ''
    for (let j = 0; j < levels; j++) {
        prelink += '../'
    }
    // console.log(`prelink: ${prelink}`)
    addPrelinkToAllChildElements(prelink, head)
    addPrelinkToAllChildElements(prelink, body)
    fse.writeFile(newFileLocation, head.innerHTML + body.innerHTML, (error: any) => {
        if (!error)
            console.log(`${newFileLocation} successfully minified`)
        else 
            console.error(`${newFileLocation} could not be written to: ${error}`)
    })
}

function addPrelinkToAllChildElements(prelink: string, element: HTMLElement | Element) {
    const href = element.getAttribute('href') || ''
    const src = element.getAttribute('src') || ''

    if (element.hasAttribute('href')) {
        // console.log('test')
        if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('www.')) {
            let newlink = prelink + href
            element.setAttribute('href', newlink)
        }
    }

    if (element.hasAttribute('src')) {
        if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('www.')) {
            let newlink = prelink + src
            element.setAttribute('src', newlink)
        }
    }

    // console.log(element)

    if (element.children.length > 0) {
        for (let j = 0; j < element.children.length; j++) {
            addPrelinkToAllChildElements(prelink, element.children[j])
        }
    }
}

function renderAllPugFiles(srcFolder: string, destFolder: string) {
    glob(srcFolder + '**/*.pug', 'cwd', (error: any, files: any) => {
        if (!error) {
            files.map((file: string) => {
                file = file.replace(srcFolder, '')
                renderPug(file, srcFolder, destFolder)
            })
        } else {
            console.error(error)
        }
    })
}

exports.minifyFile = minifyFile
exports.minifyAllSass = minifyAllSass
exports.minifyAllTS = minifyAllTS
exports.renderPug = renderPug
exports.renderAllPugFiles = renderAllPugFiles