import { describe, expect, it } from 'vitest';

import { highlightLine } from '@renderer/components/chat/viewers/syntaxHighlighter';

describe('highlightLine language lookup', () => {
  it.each(['constructor', 'toString', 'hasOwnProperty', '__proto__'])(
    'should treat Object.prototype key "%s" as an unknown language',
    (language) => {
      expect(highlightLine('const x = 1;', language)).toEqual(['const x = 1;']);
    }
  );

  it('should still highlight known languages', () => {
    expect(highlightLine('const x = 1;', 'typescript').length).toBeGreaterThan(1);
  });
});
