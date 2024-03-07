export const menus = [
  {
    id: "copyRichLink",
    title: "rich text link",
    active: true,
    description: "Copies the URL of a tab as a rich text link, so that you can paste the link with the title to your document(e.g. Google docs...) WITHOUT any editing.",
  },
  {
    id: "copyUrl",
    title: "copy URL of this page",
    active: false,
    description: "Copies only the URL of the page to the clipboard.",
  },
  {
    id: "copyUrlWithTitleAsText",
    title: "URL with title",
    active: true,
    description: "Copies the URL and TITLE of the page, they are separated with `|`.",
  }, {
    id: "copyUrlWithTitleAsMarkdown",
    title: "URL and title as markdown",
    active: true,
    description: "Copies the URL and TITLE as a markdown-style link.",
  },
  {
    id: "copyUrlAsHtml",
    title: "HTML link",
    active: false,
    description: "Copies the URL as HTML-style anchor link(a tag).",
  },
  {
    id: "copyUrlWithTitleAsHtml",
    title: "HTML link with title",
    active: false,
    description: "Copies the URL and TITLE as an HTML-style anchor link (a tag).",
  },
  {
    id: "copyTitle",
    title: "title only",
    active: false,
    description: "Copies the TITLE of the page.",
  },
];