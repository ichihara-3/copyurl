import {
  copyUrl, copyUrlWithTitleAsMarkdown,
  copyUrlWithTitleAsText, copyTitle,
  copyUrlAsHtml, copyUrlWithTitleAsHtml,
} from './tasks.js';

const menus = {
  copyurl: {
    title: "only url",
    task: copyUrl,
  },
  copyurl_titletext: {
    title: "url with the title",
    task: copyUrlWithTitleAsText,
  },
  copyurl_markdown: {
    title: "url with the title as markdown",
    task: copyUrlWithTitleAsMarkdown,
  },
  copyurl_html: {
    title: "as html link",
    task: copyUrlAsHtml,
  },
  copyurl_html_title: {
    title: "as html link with title",
    task: copyUrlWithTitleAsHtml,
  },
  copytitle: {
    title: "copy title only",
    task: copyTitle,
  },
};

export { menus };