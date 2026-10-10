import React from 'react';
import { describe, expect, it } from 'vitest';

import { highlightLine } from '@renderer/components/chat/viewers/syntaxHighlighter';

const KEYWORD_COLOR = 'var(--syntax-keyword)';
const COMMENT_COLOR = 'var(--syntax-comment)';

type Segment = React.ReactElement<{ style: { color: string }; children: string }>;

function styledSegments(line: string, language: string): Segment[] {
  return highlightLine(line, language).filter((s): s is Segment => React.isValidElement(s));
}

function colorOf(line: string, language: string, text: string): string | undefined {
  return styledSegments(line, language).find((s) => s.props.children === text)?.props.style.color;
}

function hasComment(line: string, language: string): boolean {
  return styledSegments(line, language).some((s) => s.props.style.color === COMMENT_COLOR);
}

describe('highlightLine', () => {
  it.each([
    ['java', 'public final class Foo implements Bar {', ['public', 'final', 'class', 'implements']],
    ['kotlin', 'data class Foo(val x: Int) : Bar', ['data', 'class', 'val']],
    ['kotlin', 'suspend fun main() {', ['suspend', 'fun']],
    ['swift', 'guard let x = y else { return }', ['guard', 'let', 'else', 'return']],
    ['lua', 'local function foo() end', ['local', 'function', 'end']],
    ['c', 'static int main(void) {', ['static', 'int', 'void']],
    ['cpp', 'template <typename T> class Foo {', ['template', 'typename', 'class']],
    ['hpp', 'namespace foo { constexpr int x = 1; }', ['namespace', 'constexpr', 'int']],
    ['yaml', 'enabled: true', ['true']],
    ['bash', 'if true; then echo hi; fi', ['if', 'then', 'echo', 'fi']],
  ])('highlights %s keywords in %j', (language, line, words) => {
    for (const word of words) {
      expect(colorOf(line, language, word)).toBe(KEYWORD_COLOR);
    }
  });

  it.each(['zsh', 'fish'])('reuses bash keywords for %s', (language) => {
    const line = 'for f in *; do echo $f; done';
    for (const word of ['for', 'in', 'do', 'echo', 'done']) {
      expect(colorOf(line, language, word)).toBe(KEYWORD_COLOR);
    }
    expect(hasComment('# comment', language)).toBe(true);
  });

  it.each(['c', 'cpp', 'hpp'])(
    'does not treat preprocessor directives as comments in %s',
    (language) => {
      expect(hasComment('#include <stdio.h>', language)).toBe(false);
      expect(hasComment('#define MAX 10', language)).toBe(false);
      expect(colorOf('#include <stdio.h>', language, 'include')).toBe(KEYWORD_COLOR);
    }
  );

  it('treats # as a comment in yaml', () => {
    expect(colorOf('# foo', 'yaml', '# foo')).toBe(COMMENT_COLOR);
    expect(colorOf('key: value # trailing', 'yaml', '# trailing')).toBe(COMMENT_COLOR);
  });

  it('treats -- as a comment in lua and sql', () => {
    expect(colorOf('-- foo', 'lua', '-- foo')).toBe(COMMENT_COLOR);
    expect(colorOf('x = 1 -- trailing', 'lua', '-- trailing')).toBe(COMMENT_COLOR);
    expect(colorOf('-- foo', 'sql', '-- foo')).toBe(COMMENT_COLOR);
  });

  it('does not treat -- as a comment in languages without that syntax', () => {
    expect(hasComment('i--', 'c')).toBe(false);
  });

  it.each([
    ['yaml', 'url: https://example.com/path'],
    ['bash', 'curl https://example.com'],
    ['zsh', 'curl https://example.com'],
    ['fish', 'curl https://example.com'],
    ['lua', 'local x = a // b'],
    ['python', 'x = a // b'],
  ])('does not treat // as a comment in %s', (language, line) => {
    expect(hasComment(line, language)).toBe(false);
  });

  it.each(['typescript', 'java', 'kotlin', 'swift', 'c', 'cpp', 'php'])(
    'treats // as a comment in %s',
    (language) => {
      expect(colorOf('x = 1; // note', language, '// note')).toBe(COMMENT_COLOR);
    }
  );

  it('returns unsupported languages as plain text', () => {
    expect(highlightLine('public class Foo', 'text')).toEqual(['public class Foo']);
  });
});
