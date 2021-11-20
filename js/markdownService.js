// import marked from "./marked.js";
import PlainTextRenderer from "./marked-plaintext.js";
import { log, trim } from "./utils.js";

const fromMd = "fromMd"

const htmlRenderer = new marked.Renderer();
htmlRenderer.link = externalLinkRenderer;
htmlRenderer.paragraph = (s) => `<p class="${fromMd}">${s}</p>`
htmlRenderer.em = (s) => `<em class="${fromMd}">${s}</em>`
htmlRenderer.codespan = (s) => `<code class="${fromMd}">${s}</code>`
htmlRenderer.blockquote = (s) => `<blockquote class="${fromMd}">${s}</blockquote>`

const plainTextRenderer = new PlainTextRenderer();
plainTextRenderer.checkbox = (text) => {
  return text;
};
plainTextRenderer.link = externalLinkRendererPlainText;
// plainTextRenderer.code = externalCodespanRendererPlainText;


const mdOptions = {
  // whether to conform to original MD implementation
  pedantic: false,
  // Github Flavoured Markdown
  gfm: true,
  // tables extension
  tables: true,
  // smarter list behavior
  smartLists: true,
  // "smart" typographic punctuation for things like quotes and dashes
  smartypants: false,
  // sanitize HTML tags
  sanitize: false,
  headerIds: false,
  mangle: false,
  renderer: htmlRenderer,
  // ... other options
};

const plaintextOptions = {
  sanitize: false,
  mangle: false,
  renderer: plainTextRenderer,
};

// Block-level renderer methods

// code(string code, string infostring, boolean escaped)
// blockquote(string quote)
// html(string html)
// heading(string text, number level, string raw, Slugger slugger)
// hr()
// list(string body, boolean ordered, number start)
// listitem(string text, boolean task, boolean checked)
// checkbox(boolean checked)
// paragraph(string text)
// table(string header, string body)
// tablerow(string content)
// tablecell(string content, object flags)

// Inline-level renderer methods

// strong(string text)
// text(string text)
// em(string text)
// codespan(string code)
// br()
// del(string text)
// link(string href, string title, string text)
// image(string href, string title, string text)

// const todoListItemRenderer = (text) => {
//   if (text.includes('type="checkbox"')) {
//     return `<li style="list-style: none">${text}</li>`;
//   }
//   return `<li>${text}</li>`;
// };

function externalLinkRenderer(href, title, text) {
  text = text ? text : href;
  title = title ? title : text;
  const result = `<a class="${fromMd}" target="_blank" href="${href}" title="${title}">${text}</a>`
  return result;
};

// function codespanParser (str, ...rest) {
//   let style = "";
//   let begin = str.indexOf("{");
//   let end = str.indexOf("}");
//   let text = str;
//   if (begin > -1) {
//     text = str.slice(0, begin);
//     end = end > 0 ? end : str.length + 1;
//     const sub = str.substring(begin + 1, end).trim();
//     const [bgColor, color] = sub.split(",");
//     const stColor = color ? `color:${color};` : "";
//     const stbgColor = bgColor
//       ? `background-color:${bgColor};`
//       : "background-color:transparent";
//     style = `style="${stColor}${stbgColor}" `;
//   }
//   return [text, style];
// };
//
// function externalCodespanRenderer(str) {
//   const [text, style] = codespanParser(str);
//   return `<mark ${style}>${text}</mark>`;
// }

// function externalCodespanRendererPlainText (str) {
//   const [text, style] = codespanParser(str);
//   return text;
// };

function externalLinkRendererPlainText(href, title, text) {
  return `${text} ${href} ${title ? title : ""}`
    .replace(/https:\/\//gi, "")
    .replace(/http:\/\//gi, "")
    .replace(/mailto:/gi, "")
    .replace(/www\./gi, "")
    .replace(/tim.vandehey@gmail/gi, "")
    .replace(/thevandeheys@gmail/gi, "")
    .replace(/pat.vandehey@gmail/gi, "")
    .replace(/\.com/gi, "")
    .replace(/\./gi, " ")
    .replace(/\//gi, "");
};

/*
const htmlRenderer = new marked.Renderer()
log({htmlRenderer})

const methods = ["code","listitem","link"]
methods.forEach( (k) => {overRide(htmlRenderer,k)});

function overRide (renderer, k) {
  const orig = renderer[k]
  log({orig})
  const replace = (...args) => {
    log(args)
    orig.apply(null,...args)
  }
  renderer[k] = replace
  log({replace,renderer})
  return
  }
*/

export function convertToHTML(markdownText) {
  const result = marked(markdownText, mdOptions).trim();
  return result;
}

const filterOut = ['', 'br', 'or', 'is', 'a', 'to', 'and', 'gt', 'lt']

// var regex = /( |<([^>]+)>)/ig
//             down.innerHTML = str2.replace(regex, "");

const htmlDecodeElement = document.createElement('textarea')
function htmlDecode(input) {
  // var e = document.createElement('textarea');
  htmlDecodeElement.innerHTML = input;
  // handle case of empty input
  return htmlDecodeElement.childNodes.length === 0 ? "" : htmlDecodeElement.childNodes[0].nodeValue;
}

htmlDecode("&lt;img src='myimage.jpg'&gt;");
// returns "<img src='myimage.jpg'>"

export function convertToPlainText(markdownText) {
  // may need unescape(str)
  const str = htmlDecode(marked(markdownText, plaintextOptions))
  // log(str,'----',htmlDecode(str))
  const words = str
    .replace(/( |<([^>]+)>)/ig, " ")
    .replace(/[*#\-\n\t\,\^\{\}\[\]\`]/gi, " ")
    .toLowerCase()
    .split(" ")
    .map(trim)
  const uniqueWords = [...new Set(words)]
    .filter(w => !filterOut.includes(w))
  const result = uniqueWords.join(" ")
  return result
}
