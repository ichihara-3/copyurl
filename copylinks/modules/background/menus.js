import { copyLink, copyLinkWithTitleAsMarkdown, copyLinkWithTitleAsText } from './tasks.js';

const menus = {
  copylink: {
    title: "this page url",
    task: copyLink,
  },
  copylink_titletext: {
    title: "with title",
    task: copyLinkWithTitleAsText,
  },
  copylink_markdown: {
    title: "with title as markdown",
    task: copyLinkWithTitleAsMarkdown,
  }
};

export { menus };