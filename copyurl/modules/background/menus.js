import { copyUrl, copyUrlWithTitleAsMarkdown, copyUrlWithTitleAsText, copyTitle } from './tasks.js';

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
  },
  copytitle: {
    title: "title only",
    task: copyTitle,
  },
};

export { menus };