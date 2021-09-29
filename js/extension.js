function createEmptyNode(depth, parent, parentCharacter) {
    return {
        depth: depth + 1,
        link: null,
        parent: parent,
        parentCharacter: parentCharacter,
        markedSuffix: null,
        checked: false,
        edges: {}
    }
}

const root = createEmptyNode(-1, null, null);

/*
* Build tree with suffix links
* */
function buildTree(words) {
    /*
    * Add all words to tree
    * */
    for (const word of words) {
        let node = root;
        for (const ch of word) {
            if (!node.edges[ch]) {
                node.edges[ch] = createEmptyNode(node.depth, node, ch);
            }
            node = node.edges[ch];
        }
        node.markedSuffix = node;
    }
}

function go(node, ch) {
    if (node.edges[ch])
        return node.edges[ch];
    if (node === root)
        return root;
    return go(getSuffixLink(node), ch);
}

function getSuffixLink(node) {
    if (node.link != null)
        return node.link;
    if (node === root || node.parent === root)
        return node.link = root;
    return node.link = go(getSuffixLink(node.parent), node.parentCharacter);
}
/*
* Replace bad words in particular tag
* */
function replaceText(text, goodWords) {
    if (!text || text.trim().length === 0)
        return text;
    let node = root;
    let matches = {}
    for (let i = 0; i < text.length; i++) {
        node = go(node, text[i].toLowerCase());
        if (node.markedSuffix !== null)
            matches[i - node.markedSuffix.depth + 1] = node.markedSuffix.depth;
    }
    let result = '';
    for (let i = 0; i < text.length; i++) {
        if (matches[i]) {
            if (goodWords.length !== 0) {
                result += goodWords[Math.floor(Math.random() * goodWords.length)];
            } else {
                result += "*".repeat(matches[i]);
            }
            i += matches[i] - 1;
        } else
            result += text[i];
    }
    return result;
}

function getMarkedSuffix(node){
    if(node.checked)
        return node.markedSuffix;
    node.checked = true;
    if(node.markedSuffix !== null)
        return node.markedSuffix;
    return node.markedSuffix = getMarkedSuffix(getSuffixLink(node));
}

function dfs(node){
    getMarkedSuffix(node);
    for(const child of Object.values(node.edges)){
        dfs(child);
    }
}

function loadFromPrefix(pref, items) {
    const result = [];
    Object.keys(items).filter(name => name.startsWith(pref)).forEach(key => result.push(...items[key]));
    return result;
}

/*
* Replace words on document loaded
* */
chrome.storage.sync.get(null, items => {
    const badWords = loadFromPrefix("badWords", items);
    const goodWords = loadFromPrefix("goodWords", items);
    buildTree(badWords);
    dfs(root);
    /*
        Scan all html tags and replace text values from it
    */
    const elements = document.getElementsByTagName('*');
    for (const element of elements) {
        for (const node of element.childNodes) {
            if (node.nodeType === 3) {
                const text = node.nodeValue;
                const replacedText = replaceText(text, goodWords);
                if (replacedText !== text) {
                    element.replaceChild(document.createTextNode(replacedText), node);
                }
            }
        }
    }
})
