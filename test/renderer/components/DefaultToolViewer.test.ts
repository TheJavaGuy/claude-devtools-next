import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DefaultToolViewer } from '@renderer/components/chat/items/linkedTool/DefaultToolViewer';

import type { LinkedToolItem } from '@renderer/types/groups';

/** Matches the Input section label element, not arbitrary "Input" text in content */
const INPUT_LABEL = '>Input</div>';

function makeLinkedTool(overrides: Partial<LinkedToolItem>): LinkedToolItem {
  return {
    id: 'tool-1',
    name: 'EnterPlanMode',
    input: {},
    inputPreview: '',
    startTime: new Date('2026-01-01T00:00:00Z'),
    isOrphaned: false,
    ...overrides,
  };
}

function render(linkedTool: LinkedToolItem): string {
  return renderToStaticMarkup(React.createElement(DefaultToolViewer, { linkedTool, status: 'ok' }));
}

describe('DefaultToolViewer', () => {
  it('should not render the Input section when the tool has no arguments', () => {
    const html = render(
      makeLinkedTool({ result: { content: 'Entered plan mode', isError: false } })
    );

    expect(html).not.toContain(INPUT_LABEL);
    expect(html).toContain('Output');
  });

  it('should render the Input section when the tool has arguments', () => {
    const html = render(makeLinkedTool({ name: 'SomeTool', input: { query: 'needle' } }));

    expect(html).toContain(INPUT_LABEL);
    expect(html).toContain('needle');
  });
});
