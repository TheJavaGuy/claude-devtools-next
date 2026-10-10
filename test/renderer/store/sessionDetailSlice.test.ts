/**
 * Session detail slice unit tests.
 * Tests tab label sync from session titles.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { installMockElectronAPI, type MockElectronAPI } from '../../mocks/electronAPI';

import { createTestStore, type TestStore } from './storeTestUtils';

describe('sessionDetailSlice tab labels', () => {
  let store: TestStore;
  let mockAPI: MockElectronAPI;

  function detailWithTitle(sessionId: string, customTitle?: string) {
    return {
      session: { id: sessionId, firstMessage: 'first message', customTitle },
      chunks: [],
      processes: [],
    } as never;
  }

  function openSessionTab(sessionId: string): string {
    store.getState().openTab({
      type: 'session',
      sessionId,
      projectId: 'project-1',
      label: 'first message',
    });
    return store.getState().activeTabId!;
  }

  function tabLabel(tabId: string): string | undefined {
    return store.getState().openTabs.find((tab) => tab.id === tabId)?.label;
  }

  beforeEach(() => {
    mockAPI = installMockElectronAPI();
    store = createTestStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('labels the tab with the session title on fetch', async () => {
    const tabId = openSessionTab('fetch-session');
    store.setState({ selectedSessionId: 'fetch-session' });
    mockAPI.getSessionDetail.mockResolvedValue(detailWithTitle('fetch-session', 'Renamed'));

    await store.getState().fetchSessionDetail('project-1', 'fetch-session', tabId);

    expect(tabLabel(tabId)).toBe('Renamed');
  });

  it('updates the tab label on refresh even when chunks are unchanged', async () => {
    const tabId = openSessionTab('refresh-session');
    mockAPI.getSessionDetail.mockResolvedValueOnce(detailWithTitle('refresh-session'));
    await store.getState().refreshSessionInPlace('project-1', 'refresh-session');
    expect(tabLabel(tabId)).toBe('first message');

    mockAPI.getSessionDetail.mockResolvedValueOnce(
      detailWithTitle('refresh-session', 'Renamed later')
    );
    await store.getState().refreshSessionInPlace('project-1', 'refresh-session');

    expect(tabLabel(tabId)).toBe('Renamed later');
  });

  it('keeps a label the user set by hand', async () => {
    const tabId = openSessionTab('manual-session');
    store.getState().updateTabLabel(tabId, 'My label', { setByUser: true });
    mockAPI.getSessionDetail.mockResolvedValueOnce(
      detailWithTitle('manual-session', 'Generated title')
    );

    await store.getState().refreshSessionInPlace('project-1', 'manual-session');

    expect(tabLabel(tabId)).toBe('My label');
  });
});
