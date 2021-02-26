const alfy = require('alfy');

const projectName = process.env.PROJECT_NAME;
const sid = process.env.SID;

const options = {
  headers: {
    Cookie: `connect.sid=${sid}`
  },
  json: true,
  maxAge: 60000
};

const createItem = (title, subtitle, url) => {
  return {
    title,
    subtitle,
    arg: url,
    icon: {
      type: "png",
      path: "icon.png",
    }
  };
}

(async () => {
  if(!projectName || !sid) {
    alfy.output([createItem("Please set environment variable. ⚠️", "Set API_TOKEN and USER_NAME to workflow environment variable", "")])
  }

  if(alfy.input.length > 1) {
    const posts = await alfy.fetch(
      `https://scrapbox.io/api/pages/${projectName}?limit=1000`,
      options
    );

    const items = alfy.inputMatches(posts.pages, 'title').map(p => createItem(p.title, p.descriptions[0], `https://scrapbox.io/${projectName}/${p.title}`));
    if (!items.length) {
      alfy.output(
          [createItem('The requested post was not found.', 'Do a full-text search on the Scrapbox.', `https://scrapbox.io/${projectName}/search/page?q=${alfy.input}`)]);
      return;
    }

    alfy.output(items);
  } else {
    alfy.output([createItem("Loading...", "", "")])
  }
})()
