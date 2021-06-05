const elements: HTMLCollection = document.body.children
let vanillaLink: any
import {registerLink} from './vanillalink.js'

function lookForCustomElements(parent: HTMLCollection) {
    for (let i = 0; i < parent.length; i++) {
        console.log(parent[i].nodeName)
        if (parent[i].hasAttribute('client')) {
            handleCSRLink(parent[i])
        }  
        if (parent[i].hasChildNodes()) {
            lookForCustomElements(parent[i].children)
        }
    }
}

let replaceElements: any[] = []
let addedElements: any[] = []

async function handleCSRLink(element: Element) {
    let clientLink = element
    clientLink.addEventListener('click', async (event) => {
        event.preventDefault()

        const request = new XMLHttpRequest()
        request.onload = () => {
            const nextPage = request.response.body
            
            changeDifferences(document.body, nextPage)
                .then(() => {
                    for (let i = 0; i < replaceElements.length; i++) {
                        let oldElement = replaceElements[i].prevElement
                        let newElement = replaceElements[i].nextElement
                        if (oldElement.nodeName === 'SCRIPT') {
                            oldElement.before(newElement)
                        } else {
                            oldElement.parentNode?.replaceChild(newElement, oldElement)
                        }
                        
                    }

                    for (let i = 0; i < addedElements.length; i++) {
                        let parent: HTMLElement | Element = addedElements[i].parent
                        let element = addedElements[i].element
                        if (element.nodeName === 'SCRIPT') {
                            let script = document.createElement('script')
                            script.setAttribute('src', element.getAttribute('src'))
                            parent.append(script)
                        } else {
                            parent.appendChild(element)
                        }
                        console.log(`Adding ${element.nodeName} to ${parent.nodeName}`)
        
                        // console.log(parent.lastChild)
                    }
                })
                .catch(error => {
                    console.error(error)
                })
        }
        request.open('GET', clientLink.getAttribute('href') || '/')
        request.responseType = 'document'
        request.send()
    })
}

async function changeDifferences(prevElement: HTMLElement | Element, nextElement: HTMLElement | Element) {
    // if (!prevElement || !nextElement)
    //     return

    // console.log('Prev: ' + prevElement.nodeName)
    // console.log('Next: ' + nextElement.nodeName)

    if (prevElement.nodeName !== nextElement.nodeName) {
        console.log('node names dont match')
        console.log(`Replacing ${prevElement.nodeName} with ${nextElement.nodeName}`)
        replaceElements.push({
            prevElement: prevElement,
            nextElement: nextElement
        })
        return
    }

    if (prevElement.children.length === 0 || nextElement.children.length === 0) {
        console.log('node with no children matched')
        if (prevElement.innerHTML === nextElement.innerHTML)
            return

        prevElement.innerHTML = nextElement.innerHTML
        return
    }

    if (prevElement.hasChildNodes() && (prevElement.children.length === nextElement.children.length)) {
        console.log('node with equal number of children matched')
        for (let i = 0; i < prevElement.children.length; i++) {
            await changeDifferences(prevElement.children[i], nextElement.children[i])
        }
        return
    }

    if (prevElement.children.length > nextElement.children.length) {
        const difference = prevElement.children.length - nextElement.children.length

        // Remove the excess nodes
        const startingIndex = prevElement.children.length - 1
        for (let i = startingIndex; i > startingIndex - difference; i--) {
            console.log(`Removing prevElement: ${prevElement.children[i].nodeName}`)
            prevElement.removeChild(prevElement.children[i])
        }

        await changeDifferences(prevElement, nextElement)
    }

    if (prevElement.children.length < nextElement.children.length) {
        const difference = nextElement.children.length - prevElement.children.length

        // Add the extra nodes
        const startingIndex = prevElement.children.length
        for (let i = startingIndex; i < nextElement.children.length; i++) {
            // prevElement.append(nextElement.children[i])
            addedElements.push({
                element: nextElement.children[i],
                parent: nextElement
            })
            console.log(`Adding ${nextElement.children[i].nodeName} to the end`)
            nextElement.removeChild(nextElement.children[i])
        }

        await changeDifferences(prevElement, nextElement)
    }   
}

lookForCustomElements(elements)