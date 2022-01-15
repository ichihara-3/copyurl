import {
  copyUrl, copyUrlWithTitleAsMarkdown,
  copyUrlWithTitleAsText, copyTitle,
  copyUrlAsHtml, copyUrlWithTitleAsHtml,
} from './tasks.js';

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
  copyurl_html: {
    title: "only as html",
    task: copyUrlAsHtml,
  },
  copyurl_html_title: {
    title: "with title as html",
    task: copyUrlWithTitleAsHtml,
  },
  copytitle: {
    title: "title only",
    task: copyTitle,
  },
};

export { menus };