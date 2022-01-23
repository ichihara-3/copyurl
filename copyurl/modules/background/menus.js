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
    description: "Copies the URL of the page to the clipboard.",
  },
  copyurl_titletext: {
    title: "copy url with the title",
    task: copyUrlWithTitleAsText,
    active: true,
    description: "Copies the URL and TITLE of the page, they are separated with `|`.",
  },
  copyurl_markdown: {
    title: "copy url and title as markdown",
    task: copyUrlWithTitleAsMarkdown,
    active: true,
    description: "Copies the URL and TITLE as a markdown-style link.",
  },
  copyurl_html: {
    title: "copy url as html link",
    task: copyUrlAsHtml,
    active: false,
    description: "Copies the URL as HTML-style anchor link(a tag).",
  },
  copyurl_html_title: {
    title: "copy url as html link with title",
    task: copyUrlWithTitleAsHtml,
    active: false,
    description: "Copies the URL and TITLE as an HTML-style anchor link (a tag).",
  },
  copytitle: {
    title: "copy title only",
    task: copyTitle,
    active: true,
    description: "Copies the TITLE of the page.",
  },
  copyRichLink: {
    title: "copy url as rich text link",
    task: copyRichLink,
    active: true,
    description: "Copies the URL as a rich text link, so that you can paste the link with the title to your document(e.g. Google docs...) WITHOUT any editing.",
  }
};

export { menus };