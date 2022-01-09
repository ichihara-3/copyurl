import { Tasks } from './tasks.js';

const tasks = new Tasks();

const menus = {
  copylink: {
    title: "this page url",
    task: tasks.copyLink,
  },
  copylink_titletext: {
    title: "with title",
    task: tasks.copyLinkWithTitleAsText,
  },
  copylink_markdown: {
    title: "with title as markdown",
    task: tasks.copyLinkWithTitleAsMarkdown,
  }
};

export { menus };