# VanillaType
A web framework using Typescript, Sass, and custom components.
### There are 3 main ways to utilize this framework
1. For JAMStack app creation. Just run 'npm build' to create static files. For example you can sync     Netlify with Github and tell it to use 'npm build' as the build script and 'build/' as the dist folder. A working demo can be seen at [Netlify VanillaType Demo](https://vanillatype.netlify.app/)

2. For a server sided project, such as an ecommerce site, or a site that has dynamic content that must be updated frequently

3. As a front-end Single Page Application, utilizing client side rendering build in to the VanillaType library (public/scripts/lib/vanillatype.js)

## Requirements & Dependencies
This project uses node and npm. All other dependencies are included in package.json

## Running the development server
`npm run dev`

## Building static website files
`npm run build`

## Client side rendering (not 100%, but we're getting there)
In your anchor tags, just add the attribute `client`
    ex: 
        `a(href='your-link' client) Client Side Rendering`