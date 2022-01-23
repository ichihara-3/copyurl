import {
  copyUrl, copyUrlWithTitleAsMarkdown,
  copyUrlWithTitleAsText, copyTitle,
  copyUrlAsHtml, copyUrlWithTitleAsHtml,
  copyRichLink
} from './tasks.js';

const menus = {
  copyurl: {
    title: "copy only url",
    task: copyUrl,
    active: true,
  },
  copyurl_titletext: {
    title: "copy url with the title",
    task: copyUrlWithTitleAsText,
    active: true,
  },
  copyurl_markdown: {
    title: "copy url and title as markdown",
    task: copyUrlWithTitleAsMarkdown,
    active: true,
  },
  copyurl_html: {
    title: "copy url as html link",
    task: copyUrlAsHtml,
    active: false,
  },
  copyurl_html_title: {
    title: "copy url as html link with title",
    task: copyUrlWithTitleAsHtml,
    active: false,
  },
  copytitle: {
    title: "copy title only",
    task: copyTitle,
    active: true,
  },
  copyRichLink: {
    title: "copy url as rich text link",
    task: copyRichLink,
    active: true,
  }
};

export { menus };