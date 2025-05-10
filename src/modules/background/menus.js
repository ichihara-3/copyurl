export const menus = [
  {
    id: "copyRichLink",
    title: "Rich Link",
    active: true,
    description: "Copies the URL of a tab as a rich text link, so that you can paste the link with the title to your document(e.g. Google docs...) WITHOUT any editing.",
  },
  {
    id: "copyUrl",
    title: "URL",
    active: false,
    description: "Copies only the URL of the page to the clipboard.",
  },
  {
    id: "copyUrlWithTitleAsText",
    title: "URL && Title",
    active: true,
    description: "Copies the URL and TITLE of the page, they are separated with `|`.",
  }, {
    id: "copyUrlWithTitleAsMarkdown",
    title: "Markdown",
    active: true,
    description: "Copies the URL and TITLE as a markdown-style link.",
  },
  {
    id: "copyUrlAsHtml",
    title: "HTML",
    active: false,
    description: "Copies the URL as HTML-style anchor link(a tag).",
  },
  {
    id: "copyUrlWithTitleAsHtml",
    title: "HTML && Title",
    active: false,
    description: "Copies the URL and TITLE as an HTML-style anchor link (a tag).",
  },
  {
    id: "copyTitle",
    title: "Title",
    active: false,
    description: "Copies the TITLE of the page.",
  },
];