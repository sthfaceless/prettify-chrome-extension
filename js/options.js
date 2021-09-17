function loadFromPrefix(pref, items) {
    const result = [];
    Object.keys(items).filter(name => name.startsWith(pref)).forEach(key => result.push(...items[key]));
    return result;
}

function createGoodWord(word, goodWordsContainer) {
    const element = document.createElement('div');
    element.className = 'sprettifier_good_word';
    element.innerText = word;
    element.onclick = () => {
        document.getElementById("sprettifier_good_words").childNodes.forEach((node) => {
            if (node.innerText === word) {
                goodWordsContainer.removeChild(node);
            }
            chrome.storage.sync.get({goodWords: []}, items => {
                const words = items.goodWords.filter(item => item !== word);
                chrome.storage.sync.set({goodWords: words});
            })
        });
    }
    return element;
}

document.addEventListener('DOMContentLoaded', () => {
    const goodWordsContainer = document.getElementById("sprettifier_good_words");
    chrome.storage.sync.get(null, items => {
        const goodWords = loadFromPrefix("goodWords", items);
        for (const word of goodWords) {
            goodWordsContainer.appendChild(createGoodWord(word, goodWordsContainer));
        }
    });
    document.getElementById("sprettifier_add_bad_btn").onclick = () => {
        const input = document.getElementById("sprettifier_add_bad_input");
        const word = input.value.trim().toLowerCase();
        chrome.storage.sync.get({badWordsUser: []}, items => {
            const words = items.badWordsUser.filter(item => item !== word);
            words.push(word);
            chrome.storage.sync.set({badWordsUser: words});
        })
        input.value = '';
    }
    document.getElementById("sprettifier_add_good_btn").onclick = () => {
        const input = document.getElementById("sprettifier_add_good_input");
        const word = input.value.trim().toLowerCase();
        chrome.storage.sync.get({goodWordsUser: []}, items => {
            const words = items.goodWordsUser.filter(item => item !== word);
            words.push(word);
            chrome.storage.sync.set({goodWordsUser: words});
        })
        input.value = '';
        goodWordsContainer.appendChild(createGoodWord(word, goodWordsContainer));
    }
});
