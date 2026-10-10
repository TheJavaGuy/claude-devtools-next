/**
 * Session title resolution for display (sidebar, tabs, command palette).
 */

import type { Session } from '@renderer/types/data';

/**
 * Returns the session's display title: custom title (user rename or
 * Claude-generated) when non-empty, otherwise the first user message.
 */
export function getSessionTitle(
  session: Pick<Session, 'customTitle' | 'firstMessage'>
): string | undefined {
  return session.customTitle?.trim() || session.firstMessage;
}
