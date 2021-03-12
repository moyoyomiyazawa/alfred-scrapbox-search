const alfy = require('alfy');
const shuffle = require('shuffle-array');

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

  const response = await alfy.fetch(
    `https://scrapbox.io/api/pages/${projectName}?limit=1000`,
    options
  );

  // Alfredの表示形式に整形
  const items = response.pages.map(p =>
        createItem(
          p.title,
          p.descriptions[0],
          `https://scrapbox.io/${projectName}/${p.title}`
        )
      );

  if (alfy.input.length > 1) {
    // ランダム表示
    // `--r`のあとに数値を入力すると、その数の分、ランダムな記事を取得して表示する
    if (/^--r/.test(alfy.input)) {
      const result = alfy.input.match(/^--r (\d*)/);
      // 取得件数が未指定なら1件表示
      if (!result) {
        const randomItem = shuffle.pick(items);
        alfy.output([randomItem]);
        return;
      }
      // 取得件数の指定があれば、指定数分の要素を取得
      const randomItems = shuffle.pick(items, { 'picks': Number(result[1]) });
      alfy.output(randomItems);
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
