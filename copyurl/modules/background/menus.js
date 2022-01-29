import {
  copyUrl, copyUrlWithTitleAsMarkdown,
  copyUrlWithTitleAsText, copyTitle,
  copyUrlAsHtml, copyUrlWithTitleAsHtml,
  copyRichLink
} from "./tasks.js";

const menus = [
  {
    id: "copyRichLink",
    title: "rich text link",
    task: copyRichLink,
    active: true,
    description: "Copies the URL of a tab as a rich text link, so that you can paste the link with the title to your document(e.g. Google docs...) WITHOUT any editing.",
  },
  {
    id: "copyurl",
    title: "copy URL of this page",
    task: copyUrl,
    active: false,
    description: "Copies only the URL of the page to the clipboard.",
  },
  {
    id: "copyurl_titletext",
    title: "URL with title",
    task: copyUrlWithTitleAsText,
    active: true,
    description: "Copies the URL and TITLE of the page, they are separated with `|`.",
  }, {
    id: "copyurl_markdown",
    title: "URL and title as markdown",
    task: copyUrlWithTitleAsMarkdown,
    active: true,
    description: "Copies the URL and TITLE as a markdown-style link.",
  },
  {
    id: "copyurl_html",
    title: "HTML link",
    task: copyUrlAsHtml,
    active: false,
    description: "Copies the URL as HTML-style anchor link(a tag).",
  },
  {
    id: "copyurl_html_title",
    title: "HTML link with title",
    task: copyUrlWithTitleAsHtml,
    active: false,
    description: "Copies the URL and TITLE as an HTML-style anchor link (a tag).",
  },
  {
    id: "copytitle",
    title: "title only",
    task: copyTitle,
    active: false,
    description: "Copies the TITLE of the page.",
  },
];

export { menus };