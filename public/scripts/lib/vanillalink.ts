export default function vanillalink(): void {}

let csrLinks: Element[] = []

function registerCSRLink(element: Element) {
    // console.log(element)
    // csrLinks.push(element)

    element.addEventListener('click', event => {
        event.preventDefault()

        
    })
}

export {
    registerCSRLink as registerLink
}