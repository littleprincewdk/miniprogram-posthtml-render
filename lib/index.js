const SINGLE_TAGS = [
  'wxs',
  'input',
  'textarea',
  'image',
  'audio',
  'video',
  'icon',
  'progress',
  'rich-text',
  'checkbox',
  'input',
  'radio',
  'slider',
  'switch',
  'live-player',
  'live-pusher',
  'voip-room',
  'canvas',
  'ad',
  'ad-custom',
  'official-account',
  'open-data',
  'web-view',
];

const ATTRIBUTE_QUOTES_REQUIRED = /[\t\n\f\r "'`=<>]/;

/** Render PostHTML Tree to HTML
 *
 * @param  {Array|Object} tree PostHTML Tree @param  {Object} options Options
 *
 * @return {String} HTML
 */
function render(tree, options) {
  /** Options
   *
   * @type {Object}
   *
   * @prop {Array<String|RegExp>} singleTags  Custom single tags (selfClosing)
   * @prop {String} closingSingleTag Closing format for single tag @prop
   * @prop {Boolean} quoteAllAttributes If all attributes should be quoted.
   * Otherwise attributes will be unquoted when allowed.
   * @prop {Boolean} replaceQuote Replaces quotes in attribute values with `&quote;`
   *
   * Formats:
   *
   * ``` tag: `<br></br>` ```, slash: `<br />` ```, ```default: `<br>` ```
   */
  options = options || {};

  const singleTags = options.singleTags
    ? SINGLE_TAGS.concat(options.singleTags)
    : SINGLE_TAGS;
  const singleRegExp = singleTags.filter((tag) => {
    return tag instanceof RegExp;
  });

  const { closingSingleTag } = options;
  let { quoteAllAttributes } = options;
  if (quoteAllAttributes === undefined) {
    quoteAllAttributes = true;
  }

  let { replaceQuote } = options;
  if (replaceQuote === undefined) {
    replaceQuote = true;
  }

  let { quoteStyle } = options;
  if (quoteStyle === undefined) {
    quoteStyle = 2;
  }

  const { removeSpaceBetweenAttributes = false } = options;

  return html(tree);

  /** @private */
  function isSingleTag(tag, node) {
    if (singleRegExp.length > 0) {
      return singleRegExp.some((reg) => reg.test(tag));
    }

    if (singleTags.includes(tag)) {
      return true;
    }

    return false;
  }

  /** @private */
  function attrs(object) {
    let attr = '';

    const keys = Object.keys(object);
    keys.forEach((key, index) => {
      if (typeof object[key] === 'string') {
        if (
          quoteAllAttributes ||
          object[key].match(ATTRIBUTE_QUOTES_REQUIRED)
        ) {
          let attrValue = object[key];

          if (replaceQuote) {
            attrValue = object[key].replace(/"/g, '&quot;');
          }

          attr += makeAttr(key, attrValue, keys, index, quoteStyle);
        } else if (object[key] === '') {
          attr += ` ${key}`;
        } else {
          attr += ` ${key}=${object[key]}`;
        }
      } else if (object[key] === true) {
        attr += ` ${key}`;
      } else if (typeof object[key] === 'number') {
        attr += makeAttr(key, object[key], keys, index, quoteStyle);
      }
    });

    return attr;
  }

  /** @private */
  function traverse(tree, cb) {
    if (tree !== undefined) {
      for (let i = 0, { length } = tree; i < length; i++) {
        traverse(cb(tree[i]), cb);
      }
    }
  }
  /** @private */
  function makeAttr(key, attrValue, keys, index, quoteStyle = 1) {
    let quote = '"';

    if (quoteStyle === 1) {
      // Single Quote
      quote = `'`;
    } else if (quoteStyle === 2) {
      // Double Quote
      quote = `"`;
    } else if (`${attrValue}`.includes('"')) {
      // Smart Quote
      quote = `'`;
    }

    if (attrValue === '') {
      return ` ${key}${
        removeSpaceBetweenAttributes && index < keys.length - 1 ? ' ' : ''
      }`;
    } else {
      return `${
        removeSpaceBetweenAttributes && index > 0 ? '' : ' '
      }${key}=${quote}${attrValue}${quote}`;
    }
  }
  /**
   * HTML Stringifier
   *
   * @param  {Array|Object} tree PostHTML Tree
   *
   * @return {String} result HTML
   */
  function html(tree) {
    let result = '';

    if (!Array.isArray(tree)) {
      tree = [tree];
    }

    traverse(tree, (node) => {
      // Undefined, null, '', [], NaN
      if (
        node === undefined ||
        node === null ||
        node === false ||
        node.length === 0 ||
        Number.isNaN(node)
      ) {
        return;
      }

      // Treat as new root tree if node is an array
      if (Array.isArray(node)) {
        result += html(node);

        return;
      }

      if (typeof node === 'string' || typeof node === 'number') {
        result += node;

        return;
      }

      // Skip node
      if (node.tag === false) {
        result += html(node.content);

        return;
      }

      const tag = node.tag || 'view';

      result += `<${tag}`;

      if (node.attrs) {
        result += attrs(node.attrs);
      }

      if (isSingleTag(tag, node)) {
        switch (closingSingleTag) {
          case 'tag':
            result += `></${tag}>`;

            break;
          case 'slash':
            result += `${removeSpaceBetweenAttributes ? '' : ' '}/>`;

            break;
          default:
            result += '>';
        }

        result += html(node.content);
      } else if (!node.content && closingSingleTag) {
        switch (closingSingleTag) {
          case 'tag':
            result += `></${tag}>`;

            break;
          case 'slash':
            result += `${removeSpaceBetweenAttributes ? '' : ' '}/>`;

            break;
          default:
            result += `${removeSpaceBetweenAttributes ? '' : ' '}/>`;
        }
      } else {
        result += `>${html(node.content)}</${tag}>`;
      }
    });

    return result;
  }
}

/**
 * @module posthtml-render
 *
 * @version 1.1.5
 * @license MIT
 */
module.exports = render;
