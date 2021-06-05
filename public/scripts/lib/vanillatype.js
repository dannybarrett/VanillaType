var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const elements = document.body.children;
let vanillaLink;
function lookForCustomElements(parent) {
    for (let i = 0; i < parent.length; i++) {
        console.log(parent[i].nodeName);
        if (parent[i].hasAttribute('client')) {
            handleCSRLink(parent[i]);
        }
        if (parent[i].hasChildNodes()) {
            lookForCustomElements(parent[i].children);
        }
    }
}
let replaceElements = [];
let addedElements = [];
function handleCSRLink(element) {
    return __awaiter(this, void 0, void 0, function* () {
        let clientLink = element;
        clientLink.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const request = new XMLHttpRequest();
            request.onload = () => {
                const nextPage = request.response.body;
                changeDifferences(document.body, nextPage)
                    .then(() => {
                    var _a;
                    for (let i = 0; i < replaceElements.length; i++) {
                        let oldElement = replaceElements[i].prevElement;
                        let newElement = replaceElements[i].nextElement;
                        if (oldElement.nodeName === 'SCRIPT') {
                            oldElement.before(newElement);
                        }
                        else {
                            (_a = oldElement.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newElement, oldElement);
                        }
                    }
                    for (let i = 0; i < addedElements.length; i++) {
                        let parent = addedElements[i].parent;
                        let element = addedElements[i].element;
                        if (element.nodeName === 'SCRIPT') {
                            let script = document.createElement('script');
                            script.setAttribute('src', element.getAttribute('src'));
                            parent.append(script);
                        }
                        else {
                            parent.appendChild(element);
                        }
                        console.log(`Adding ${element.nodeName} to ${parent.nodeName}`);
                        // console.log(parent.lastChild)
                    }
                })
                    .catch(error => {
                    console.error(error);
                });
            };
            request.open('GET', clientLink.getAttribute('href') || '/');
            request.responseType = 'document';
            request.send();
        }));
    });
}
function changeDifferences(prevElement, nextElement) {
    return __awaiter(this, void 0, void 0, function* () {
        // if (!prevElement || !nextElement)
        //     return
        // console.log('Prev: ' + prevElement.nodeName)
        // console.log('Next: ' + nextElement.nodeName)
        if (prevElement.nodeName !== nextElement.nodeName) {
            console.log('node names dont match');
            console.log(`Replacing ${prevElement.nodeName} with ${nextElement.nodeName}`);
            replaceElements.push({
                prevElement: prevElement,
                nextElement: nextElement
            });
            return;
        }
        if (prevElement.children.length === 0 || nextElement.children.length === 0) {
            console.log('node with no children matched');
            if (prevElement.innerHTML === nextElement.innerHTML)
                return;
            prevElement.innerHTML = nextElement.innerHTML;
            return;
        }
        if (prevElement.hasChildNodes() && (prevElement.children.length === nextElement.children.length)) {
            console.log('node with equal number of children matched');
            for (let i = 0; i < prevElement.children.length; i++) {
                yield changeDifferences(prevElement.children[i], nextElement.children[i]);
            }
            return;
        }
        if (prevElement.children.length > nextElement.children.length) {
            const difference = prevElement.children.length - nextElement.children.length;
            // Remove the excess nodes
            const startingIndex = prevElement.children.length - 1;
            for (let i = startingIndex; i > startingIndex - difference; i--) {
                console.log(`Removing prevElement: ${prevElement.children[i].nodeName}`);
                prevElement.removeChild(prevElement.children[i]);
            }
            yield changeDifferences(prevElement, nextElement);
        }
        if (prevElement.children.length < nextElement.children.length) {
            const difference = nextElement.children.length - prevElement.children.length;
            // Add the extra nodes
            const startingIndex = prevElement.children.length;
            for (let i = startingIndex; i < nextElement.children.length; i++) {
                // prevElement.append(nextElement.children[i])
                addedElements.push({
                    element: nextElement.children[i],
                    parent: nextElement
                });
                console.log(`Adding ${nextElement.children[i].nodeName} to the end`);
                nextElement.removeChild(nextElement.children[i]);
            }
            yield changeDifferences(prevElement, nextElement);
        }
    });
}
lookForCustomElements(elements);
export {};
