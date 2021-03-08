const alfy = require('alfy');

const projectName = process.env.PROJECT_NAME;
const sid = process.env.SID;

const options = {
  headers: {
    Cookie: sid ? `connect.sid=${sid}` : '',
  },
  json: true,
  maxAge: 60000,
};

const createItem = (title, subtitle, url) => {
  return {
    title,
    subtitle,
    arg: url,
    icon: {
      type: 'png',
      path: 'icon.png',
    },
  };
};

(async () => {
  if (!projectName) {
    alfy.output([
      createItem(
        'Please set environment variable. ⚠️',
        'Set PROJECT_NAME to workflow environment variable',
        ''
      ),
    ]);
    return;
  }

  const posts = await alfy.fetch(
    `https://scrapbox.io/api/pages/${projectName}?limit=1000`,
    options
  );

  const items = posts.pages.map(p =>
        createItem(
          p.title,
          p.descriptions[0],
          `https://scrapbox.io/${projectName}/${p.title}`
        )
      );

  if (alfy.input.length > 1) {
    // ランダム表示
    if (alfy.input === '--r') {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      alfy.output([randomItem]);
      return;
    }

    // インクリメンタル検索
    const matchedItems = alfy.inputMatches(items, 'title');
    // 一致したページがなければScrapbox内で全文検索及び新規ページ作成へ飛ばす
    if (!matchedItems.length) {
      alfy.output([
        createItem(
          'The requested post was not found.',
          'Do a full-text search on the Scrapbox.',
          `https://scrapbox.io/${projectName}/search/page?q=${alfy.input}`
        ),
      ]);
      return;
    }
    alfy.output(matchedItems);
  } else {
    alfy.output([createItem('Loading...', '', '')]);
  }
})();
