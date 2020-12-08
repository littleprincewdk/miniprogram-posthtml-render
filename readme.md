# miniprogram-posthtml-render

Fork from [posthtml/posthtml-render@1.3.0](https://github.com/posthtml/posthtml-render)

对`posthtml-render`做如下变更

1. 默认单标签元素：
```javascript
[
 'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]
```
替换为适用于小程序的：
```javascript
[
  'wxs',
  'input',
  'textarea',
  'audio',
  'icon',
  'progress',
  'rich-text',
  'checkbox',
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
]
// image, video可以有内容
```

2. 添加`removeSpaceBetweenAttributes`选项用于压缩, `quoteAllAttributes`同时为`true`生效。
```html
  <input class="phone" type="number" />
```
->
```html
<input class="phone"type="number"/>
```
```html
<input class="phone" type="number" disabled />
```
->
```html
<input class="phone"type="number" disabled/>
```
3. 将属性值为空字符串的属性只保留`key`, 以支持`<input disabled />`写法。`posthtml-parser`会将`disabled`解释为`{ "disabled": "" }`
4. 指定`closingSingleTag`且内容为空的标签视为单标签：`<view></view>` => `<view />`

## Usage

```bash
$ yarn add miniprogram-posthtml-render -D
```

```javascript
const render = require('miniprogram-posthtml-render');

render(true, options);
```
