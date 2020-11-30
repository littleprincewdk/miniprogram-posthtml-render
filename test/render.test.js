const fs = require('fs');
const path = require('path');

const { it } = require('mocha');
const { expect } = require('chai');
const { describe } = require('mocha');

const render = require('../lib');

const tree = require('./templates/parser.js');
const html = fs.readFileSync(
  path.resolve(__dirname, 'templates/render.html'),
  'utf8'
);

describe('PostHTML Render', () => {
  it('{String}', () => {
    expect(render('Hello world!')).to.eql('Hello world!');
  });

  it('{Number}', () => {
    expect(render(555)).to.eql('555');
  });

  it('{Array}', () => {
    expect(render(['Hello world!'])).to.eql('Hello world!');
  });

  describe('Tags', () => {
    it('Empty', () => {
      expect(render({ content: ['Test'] })).to.eql('<view>Test</view>');
    });

    it('{Boolean} (false) -> {String}', () => {
      expect(render({ tag: false, content: 'Test' })).to.eql('Test');
      expect(render({ tag: false, content: ['Test'] })).to.eql('Test');
    });

    it('{Boolean} (false) -> {Number}', () => {
      expect(render({ tag: false, content: 555 })).to.eql('555');
      expect(render({ tag: false, content: [555] })).to.eql('555');
    });
  });

  describe('Attrs', () => {
    it('Empty', () => {
      const fixture = { attrs: { alt: '' } };
      // const expected = '<view alt=""></view>';
      const expected = '<view alt></view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('Single', () => {
      const fixture = {
        attrs: {
          id: 'header',
        },
      };
      const expected = '<view id="header"></view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('Multiple', () => {
      const fixture = {
        attrs: {
          id: 'header',
          style: 'color:red',
          'data-id': 'header',
        },
      };
      const expected =
        '<view id="header" style="color:red" data-id="header"></view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('{Boolean} (true)', () => {
      const fixture = {
        attrs: {
          disabled: true,
        },
      };
      const expected = '<view disabled></view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('{Boolean} (false)', () => {
      const fixture = {
        attrs: {
          disabled: false,
        },
      };
      const expected = '<view></view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('{Number}', () => {
      const fixture = {
        attrs: {
          val: 5,
        },
      };
      const expected = '<view val="5"></view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('{String} (double quotes)', () => {
      const fixture = {
        attrs: {
          onclick: 'alert("hello world")',
        },
      };
      const expected = '<view onclick="alert(&quot;hello world&quot;)"></view>';

      expect(render(fixture)).to.eql(expected);
    });
  });

  describe('Content', () => {
    it('{String}', () => {
      const fixture = { content: 'Hello world!' };
      const expected = '<view>Hello world!</view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('{Array<String>}', () => {
      const fixture = { content: ['Hello world!'] };
      const expected = '<view>Hello world!</view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('{Number}', () => {
      expect(render({ content: 555 })).to.eql('<view>555</view>');
      expect(render({ content: [555] })).to.eql('<view>555</view>');
    });

    it('{Array<Number>}', () => {
      expect(render({ content: [555] })).to.eql('<view>555</view>');
    });

    it('{Array}', () => {
      const fixture = {
        content: [[555, { tag: 'view', content: 666 }, 777]],
      };
      const expected = '<view>555<view>666</view>777</view>';

      expect(render(fixture)).to.eql(expected);
    });

    it('Nested', () => {
      const fixture = {
        content: [
          {
            content: [
              {
                content: ['Test', {}],
              },
            ],
          },
        ],
      };
      const expected =
        '<view><view><view>Test<view></view></view></view></view>';

      expect(render(fixture)).to.eql(expected);
    });
  });

  describe('Tree', () => {
    it('Empty', () => {
      expect(render()).to.eql('');
    });

    // it('HTML', () => {
    //   expect(html).to.eql(render(tree));
    // });

    it('Immutable', () => {
      const t = [
        {
          tag: 'view',
          content: [
            {
              tag: false,
              content: [{ tag: 'view' }, { tag: 'span', content: ['Text'] }],
            },
          ],
        },
      ];

      const t1 = JSON.stringify(t);

      render(t);

      const t2 = JSON.stringify(t);

      expect(t1).to.eql(t2);
    });
  });

  describe('Options', () => {
    describe('singleTag', () => {
      it('Defaults', () => {
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

        expect(
          render(
            SINGLE_TAGS.map((tag) => {
              return { tag };
            })
          )
        ).to.eql(
          SINGLE_TAGS.map((tag) => {
            return '<' + tag + '>';
          }).join('')
        );
      });

      it('Custom {String}', () => {
        const options = { singleTags: ['rect'] };

        const fixture = { tag: 'rect' };
        const expected = '<rect>';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Custom {RegExp}', () => {
        const options = { singleTags: [/^%.*%$/] };

        const fixture = { tag: '%=title%' };
        const expected = '<%=title%>';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Attrs', () => {
        const options = { singleTags: ['rect'] };

        const fixture = { tag: 'rect', attrs: { id: 'id' } };
        const expected = '<rect id="id">';

        expect(render(fixture, options)).to.eql(expected);
      });
    });

    describe('closingSingleTag', () => {
      it('Tag', () => {
        const options = { closingSingleTag: 'tag' };

        const fixture = { tag: 'image' };
        const expected = '<image></image>';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Slash', () => {
        const options = { closingSingleTag: 'slash' };

        const fixture = { tag: 'image' };
        const expected = '<image />';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Slash with content', () => {
        const options = { closingSingleTag: 'slash' };

        const fixture = { tag: 'image', content: ['test'] };
        const expected = '<image />test';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Default', () => {
        const options = { closingSingleTag: 'default' };

        const fixture = { tag: 'image' };
        const expected = '<image>';

        expect(render(fixture, options)).to.eql(expected);
      });
    });

    describe('quoteAllAttributes', () => {
      it('True', () => {
        const options = { quoteAllAttributes: true };

        const fixture = { tag: 'a', attrs: { href: '/about/me/' } };
        const expected = '<a href="/about/me/"></a>';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('False', () => {
        const options = { quoteAllAttributes: false };

        const fixture = { tag: 'a', attrs: { href: '/about/me/' } };
        const expected = '<a href=/about/me/></a>';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Required Space', () => {
        const options = { quoteAllAttributes: false };

        const fixture = { tag: 'p', attrs: { id: 'asd adsasd' } };
        const expected = '<p id="asd adsasd"></p>';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Required Tab', () => {
        const options = { quoteAllAttributes: false };

        const fixture = { tag: 'a', attrs: { href: '/about-\t-characters' } };
        const expected = '<a href="/about-\t-characters"></a>';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Required Empty', () => {
        const options = { quoteAllAttributes: false };

        const fixture = { tag: 'script', attrs: { async: '' } };
        const expected = '<script async></script>';

        expect(render(fixture, options)).to.eql(expected);
      });

      it('Closing slash', () => {
        const options = {
          closingSingleTag: 'slash',
          quoteAllAttributes: false,
        };

        // Note that <area href=foobar/> is incorrect as that is parsed as
        // <area href="foobar/">.

        const fixture = { tag: 'area', attrs: { href: 'foobar' } };
        const expected = '<area href=foobar />';

        expect(render(fixture, options)).to.eql(expected);
      });
    });

    describe('replaceQuote', () => {
      it('replace quote', () => {
        const options = { replaceQuote: false };

        const fixture = {
          tag: 'image',
          attrs: { src: '<?php echo $foo["bar"] ?>' },
        };
        const expected = '<image src="<?php echo $foo["bar"] ?>">';
        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('replace quote ternary operator', () => {
        const options = { replaceQuote: false };

        const fixture = {
          tag: 'image',
          attrs: {
            src: '<?php echo isset($foo["bar"]) ? $foo["bar"] : ""; ?>',
          },
        };
        const expected =
          '<image src="<?php echo isset($foo["bar"]) ? $foo["bar"] : ""; ?>">';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });
    });

    describe('quoteStyle', () => {
      it('1 - single quote', () => {
        const options = { replaceQuote: false, quoteStyle: 1 };

        const fixture = {
          tag: 'image',
          attrs: {
            src: 'https://example.com/example.png',
            onload: 'testFunc("test")',
          },
        };
        const expected =
          "<image src='https://example.com/example.png' onload='testFunc(\"test\")'>";

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('2 - double quote', () => {
        const options = { replaceQuote: false, quoteStyle: 2 };

        const fixture = {
          tag: 'image',
          attrs: {
            src: 'https://example.com/example.png',
            onload: 'testFunc("test")',
          },
        };
        const expected =
          '<image src="https://example.com/example.png" onload="testFunc("test")">';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('0 - smart quote', () => {
        const options = { replaceQuote: false, quoteStyle: 0 };

        const fixture = {
          tag: 'image',
          attrs: {
            src: 'https://example.com/example.png',
            onload: 'testFunc("test")',
          },
        };
        const expected =
          '<image src="https://example.com/example.png" onload=\'testFunc("test")\'>';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });
    });

    describe('removeSpaceBetweenAttributes', () => {
      it('remove space between attributes', () => {
        const options = { removeSpaceBetweenAttributes: true };

        const fixture = {
          tag: 'image',
          attrs: {
            class: 'avatar',
            src: 'https://example.com/example.png',
          },
        };
        const expected =
          '<image class="avatar"src="https://example.com/example.png">';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('remove space between attributes with true value at middle', () => {
        const options = { removeSpaceBetweenAttributes: true };

        const fixture = {
          tag: 'image',
          attrs: {
            class: 'avatar',
            'lazy-load': '',
            src: 'https://example.com/example.png',
          },
        };
        const expected =
          '<image class="avatar" lazy-load src="https://example.com/example.png">';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('remove space between attributes with true value at middle', () => {
        const options = { removeSpaceBetweenAttributes: true };

        const fixture = {
          tag: 'image',
          attrs: {
            class: 'avatar',
            'lazy-load': '',
            src: 'https://example.com/example.png',
          },
        };
        const expected =
          '<image class="avatar" lazy-load src="https://example.com/example.png">';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('remove space between attributes with true value at start', () => {
        const options = { removeSpaceBetweenAttributes: true };

        const fixture = {
          tag: 'image',
          attrs: {
            'lazy-load': '',
            class: 'avatar',
            src: 'https://example.com/example.png',
          },
        };
        const expected =
          '<image lazy-load class="avatar"src="https://example.com/example.png">';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('remove space between attributes with true value at end', () => {
        const options = { removeSpaceBetweenAttributes: true };

        const fixture = {
          tag: 'image',
          attrs: {
            class: 'avatar',
            src: 'https://example.com/example.png',
            'lazy-load': '',
          },
        };
        const expected =
          '<image class="avatar"src="https://example.com/example.png" lazy-load>';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('remove space between attributes with closingSingleTag slash', () => {
        const options = {
          removeSpaceBetweenAttributes: true,
          closingSingleTag: 'slash',
        };

        const fixture = {
          tag: 'image',
          attrs: {
            class: 'avatar',
            src: 'https://example.com/example.png',
          },
        };
        const expected =
          '<image class="avatar"src="https://example.com/example.png"/>';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('remove space between attributes with closingSingleTag slash and true value at end', () => {
        const options = {
          removeSpaceBetweenAttributes: true,
          closingSingleTag: 'slash',
        };

        const fixture = {
          tag: 'image',
          attrs: {
            class: 'avatar',
            src: 'https://example.com/example.png',
            'lazy-load': '',
          },
        };
        const expected =
          '<image class="avatar"src="https://example.com/example.png" lazy-load/>';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });

      it('remove space between attributes with quoteAllAttributes false', () => {
        const options = {
          removeSpaceBetweenAttributes: true,
          quoteAllAttributes: false,
        };

        const fixture = {
          tag: 'image',
          attrs: {
            class: 'avatar',
            src: 'https://example.com/example.png',
          },
        };
        const expected =
          '<image class=avatar src=https://example.com/example.png>';

        fs.writeFileSync('test.html', render(fixture, options));
        expect(render(fixture, options)).to.eql(expected);
      });
    });
  });
});
