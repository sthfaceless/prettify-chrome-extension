chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.sync.clear();
    /*
    * Text file headers
    * */
    const headers = new Headers();
    headers.append('Content-Type', 'text/plain; charset=UTF-8');
    /*
    * Fetch default bad words from file
    * */
    const badWordsUrl = chrome.runtime.getURL('data/badWords.txt');
    fetch(badWordsUrl, headers)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const words = new TextDecoder('utf-8').decode(buffer).split(',');
            const partition = 100;
            for (let i = 0; i < words.length / partition; i++) {
                chrome.storage.sync.set({
                    ["badWords" + i]: words.slice(i * partition, Math.min((i + 1) * partition, words.length)).reduce((prev, curr) => {
                        prev.push(curr.trim().toLowerCase())
                        return prev;
                    }, [])
                })
            }
        }).catch(e => console.error("Exception during load default bad words: " + e));
    const goodWordsUrl = chrome.runtime.getURL('data/goodWords.txt');
    fetch(goodWordsUrl, headers)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const text = new TextDecoder('utf-8').decode(buffer);
            chrome.storage.sync.set({
                "goodWords": text.split('\n').reduce((prev, curr) => {
                    prev.push(curr.trim().toLowerCase())
                    return prev;
                }, [])
            });
        }).catch(e => console.error("Exception during load default good words: " + e));
});
