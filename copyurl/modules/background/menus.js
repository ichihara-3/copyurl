import {
  copyUrl, copyUrlWithTitleAsMarkdown,
  copyUrlWithTitleAsText, copyTitle,
  copyUrlAsHtml, copyUrlWithTitleAsHtml,
} from './tasks.js';

const menus = {
  copyurl: {
    title: "only url",
    task: copyUrl,
    active: true,
  },
  copyurl_titletext: {
    title: "url with the title",
    task: copyUrlWithTitleAsText,
    active: true,
  },
  copyurl_markdown: {
    title: "url with the title as markdown",
    task: copyUrlWithTitleAsMarkdown,
    active: true,
  },
  copyurl_html: {
    title: "as html link",
    task: copyUrlAsHtml,
    active: true,
  },
  copyurl_html_title: {
    title: "as html link with title",
    task: copyUrlWithTitleAsHtml,
    active: true,
  },
  copytitle: {
    title: "copy title only",
    task: copyTitle,
    active: true,
  },
};

export { menus };