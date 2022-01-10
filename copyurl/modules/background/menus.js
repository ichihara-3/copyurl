import { copyUrl, copyUrlWithTitleAsMarkdown, copyUrlWithTitleAsText } from './tasks.js';

const menus = {
  copyurl: {
    title: "only",
    task: copyUrl,
  },
  copyurl_titletext: {
    title: "with title",
    task: copyUrlWithTitleAsText,
  },
  copyurl_markdown: {
    title: "with title as markdown",
    task: copyUrlWithTitleAsMarkdown,
  }
};

export { menus };