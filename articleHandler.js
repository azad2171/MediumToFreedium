
(function () {
  console.log('📦 Medium Button Extension running...');

  function isMediumArticle(url) {
    const regex = /medium\.com\/(@[^/]+|[^/]+)\/[a-z0-9-]+-[a-z0-9]{12}$/i;
    return regex.test(url);
  }

  function waitForElementInArticle(article, selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      function check() {
        const el = article.querySelector(selector);
        if (el && el.offsetParent !== null) {
          resolve(el);
        } else if (performance.now() - start > timeout) {
          reject(new Error(`Timeout waiting for ${selector}`));
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
        const linkAnchor = article.querySelector('a:has(h2), a:has(h1)');
        const articleLink = linkAnchor?.href || window.location.href;

        const customBtn = createButton(articleLink);
        const parent = findCommonParent(moreBtn, bookmarkBtn);
        if (parent) {
          parent.appendChild(customBtn);
        } else {
          console.warn('⚠️ No common parent found for custom button.');
        }
      })
      .catch((err) => {
        console.warn('❌ Button(s) not found:', err.message);
      });
  }

  function modifyLinks() {
    const initialArticles = document.querySelectorAll('article, div[role="article"]');
    initialArticles.forEach(processArticle);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches('article, div[role="article"]')) {
            processArticle(node);
          } else {
            node.querySelectorAll?.('article, div[role="article"]')
              ?.forEach(processArticle);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function modifySingleArticle() {
    const mainArticle = document.querySelector('article.meteredContent');
    if (!mainArticle) {
      console.warn('❌ Main article not found.');
      return;
    }
    processArticle(mainArticle);
  }

  function runForCurrentPage() {
    if (isMediumArticle(location.href)) {
      modifySingleArticle();
    } else {
      modifyLinks();
    }
  }

  // Run on initial load
  runForCurrentPage();

  // Observe URL changes (SPA routing)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log('🔁 URL changed:', lastUrl);
      runForCurrentPage();
    }
  });
  urlObserver.observe(document.body, { childList: true, subtree: true });
})();