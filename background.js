console.log('Background script is running');

function isMediumArticle(url) {
    // Medium article URLs contain a hyphenated slug with a unique ID
    // const articleRegex = /medium\.com\/(?!tag|search|@)[^/]+\/[a-z0-9-]+-[a-z0-9]{12}$/i;
    const articleRegex = /medium\.com\/(@[^/]+|[^/]+)\/[a-z0-9-]+-[a-z0-9]{12}$/i;

    return articleRegex.test(url);
}



chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
            console.log('url:', tab.url);
            // console.log('isMediumArticle:', isMediumArticle(tab.url));
            
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ['createButton.js']
            })

            if (isMediumArticle(tab.url)) {
                console.log('Medium article detected');
                chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    func: modifySingleArticle
                });
            } else {
                console.log('Medium Home page detected');
                chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    func: modifyLinks
                });
            }
    }
});


function modifyLinks() {
    console.log('Modifying links on Medium homepage');

    function waitForElementInArticle(article, selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = performance.now();

            function check() {
                const el = article.querySelector(selector);
                const now = performance.now();

                if (el && el.offsetParent !== null) {
                    resolve(el);
                } else if (now - start > timeout) {
                    reject(new Error(`Timeout waiting for selector: ${selector}`));
                } else {
                    requestAnimationFrame(check);
                }
            }

            check();
        });
    }


    function processArticle(article) {
        if (article.dataset.modified) return;
        article.dataset.modified = true;

        const moreBtnSelector = 'button[aria-label="More options"]';
        const bookmarkBtnSelector = 'button[aria-label="Add to list bookmark button"]';

        const waitMore = waitForElementInArticle(article, moreBtnSelector);
        const waitBookmark = waitForElementInArticle(article, bookmarkBtnSelector);

        Promise.all([waitMore, waitBookmark])
            .then(([moreBtn, bookmarkBtn]) => {
                console.log('🎯 Buttons ready:', { moreBtn, bookmarkBtn });

                // ✅ Your logic here - inject custom button, modify styles, etc.
                const articleLink = article.querySelectorAll('a:has(h2)')[0].href;
                const customBtn = createButton(articleLink);
                
                let parent = findCommonParent(moreBtn, bookmarkBtn);
                parent.appendChild(customBtn);

            })
            .catch(err => {
                console.warn('❌ Button(s) not found in time:', err.message);
            });


    }



    // 🔁 Initial scan
    const initialArticles = document.querySelectorAll('article, div[role="article"]');
    initialArticles.forEach(processArticle);

    // 🔍 Observe future additions
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;

                if (node.matches('article, div[role="article"]')) {
                    processArticle(node);
                } else {
                    const nestedArticles = node.querySelectorAll?.('article, div[role="article"]');
                    nestedArticles?.forEach(processArticle);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

}

function modifySingleArticle() {
    console.log('Modifying single article on Medium');
    
}
