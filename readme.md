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
]
```

2. 添加`removeSpaceBetweenAttributes`选项用于压缩, `quoteAllAttributes`同时为`true`生效。
```html
  <image class="avatar" src="https://example.com/example.png" />
```
->
```html
<image class="avatar"src="https://example.com/example.png"/>
```
```html
<image class="avatar" src="https://example.com/example.png" lazy-load />
```
->
```html
<image class="avatar"src="https://example.com/example.png" lazy-load/>
```
3. 将属性值为空字符串的属性只保留`key`, 以支持`<image lazy-load />`写法。`posthtml-parser`会将`autoplay`解释为`{ "lazy-load": "" }`
4. 指定`closingSingleTag`且内容为空的标签视为单标签：`<view></view>` => `<view />`

## Usage

```bash
$ yarn add miniprogram-posthtml-render -D
```

```javascript
const render = require('miniprogram-posthtml-render');

render(true, options);
```
