import { describe, expect, it } from 'vitest';

import { getSessionTitle } from '@renderer/utils/sessionTitle';

describe('getSessionTitle', () => {
  it('prefers the custom title over the first message', () => {
    expect(getSessionTitle({ customTitle: 'Renamed', firstMessage: 'hello' })).toBe('Renamed');
  });

  it('trims the custom title', () => {
    expect(getSessionTitle({ customTitle: '  Renamed  ', firstMessage: 'hello' })).toBe('Renamed');
  });

  it('falls back to the first message when the custom title is empty or whitespace', () => {
    expect(getSessionTitle({ customTitle: '   ', firstMessage: 'hello' })).toBe('hello');
    expect(getSessionTitle({ customTitle: '', firstMessage: 'hello' })).toBe('hello');
    expect(getSessionTitle({ firstMessage: 'hello' })).toBe('hello');
  });

  it('returns undefined when neither is set', () => {
    expect(getSessionTitle({})).toBeUndefined();
  });
});
