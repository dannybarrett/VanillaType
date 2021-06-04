require('dotenv').config()
import { Request, Response } from "express"
const express = require('Express')
const helmet = require('helmet')
const fs = require('fs')
const app = express()
const port = process.env.PORT
const builders = require('./builders.ts')

app.use(helmet())
app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req: Request, res: Response) => {
    res.render('index')
})

app.get('/:page', (req: Request, res: Response) => {
    res.render(req.params.page)
})

function buildFiles() {
    builders.minifyAllSass('public/styles/', 'public/styles/')
    builders.minifyAllTS('public/scripts/', 'public/scripts/')
}

buildFiles()

app.listen(port, () => {
    console.log(`Vanilla development server started at http://127.0.0.1:${port}`)
})

function watchForChanges() {
    fs.watch('public/', { recursive: true }, (eventType: string, filename: string) => { 
        if (eventType) { 
            if (filename.endsWith('.sass') || filename.endsWith('.scss') || filename.endsWith('.ts')) {
                console.log(`Change detected on ${filename}`)   
                builders.minifyFile(filename, 'public/', 'public/')
            }
        }
    })
}

watchForChanges()