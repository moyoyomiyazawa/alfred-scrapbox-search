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

  const response = await alfy.fetch(
    `https://scrapbox.io/api/pages/${projectName}?limit=1000`,
    options
  );

  if (alfy.input.length > 1) {
    const items = alfy
      .inputMatches(response.pages, 'title')
      .map((p) =>
        createItem(
          p.title,
          p.descriptions[0],
          `https://scrapbox.io/${projectName}/${p.title}`
        )
      );
    if (!items.length) {
      alfy.output([
        createItem(
          'The requested post was not found.',
          'Do a full-text search on the Scrapbox.',
          `https://scrapbox.io/${projectName}/search/page?q=${alfy.input}`
        ),
      ]);
      return;
    }

    alfy.output(items);
  } else {
    alfy.output([createItem('Loading...', '', '')]);
  }
})();
