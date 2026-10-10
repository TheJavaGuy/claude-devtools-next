import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import { SubagentLocator } from '../../../../src/main/services/discovery/SubagentLocator';

const PROJECT_ID = '-Users-test-myproject';
const SESSION_ID = 'session-1';

describe('SubagentLocator', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  function createProjectsDir(): string {
    const projectsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'subagent-locator-'));
    tempDirs.push(projectsDir);
    fs.mkdirSync(path.join(projectsDir, PROJECT_ID));
    return projectsDir;
  }

  function writeFile(filePath: string, content: string): string {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  describe('hasSubagents', () => {
    function writeSubagent(projectsDir: string, name: string, content: string): void {
      writeFile(path.join(projectsDir, PROJECT_ID, SESSION_ID, 'subagents', name), content);
    }

    it('returns true when a subagent file has content', async () => {
      const projectsDir = createProjectsDir();
      writeSubagent(projectsDir, 'agent-a.jsonl', '{"sessionId":"session-1"}\n');

      expect(await new SubagentLocator(projectsDir).hasSubagents(PROJECT_ID, SESSION_ID)).toBe(
        true
      );
    });

    it('returns false when all subagent files are empty', async () => {
      const projectsDir = createProjectsDir();
      writeSubagent(projectsDir, 'agent-a.jsonl', '');
      writeSubagent(projectsDir, 'agent-b.jsonl', '');

      expect(await new SubagentLocator(projectsDir).hasSubagents(PROJECT_ID, SESSION_ID)).toBe(
        false
      );
    });

    it('ignores files not matching agent-*.jsonl', async () => {
      const projectsDir = createProjectsDir();
      writeSubagent(projectsDir, 'notes.jsonl', '{"sessionId":"session-1"}\n');
      writeSubagent(projectsDir, 'agent-a.txt', '{"sessionId":"session-1"}\n');

      expect(await new SubagentLocator(projectsDir).hasSubagents(PROJECT_ID, SESSION_ID)).toBe(
        false
      );
    });

    it('returns false when the subagents directory does not exist', async () => {
      const projectsDir = createProjectsDir();

      expect(await new SubagentLocator(projectsDir).hasSubagents(PROJECT_ID, SESSION_ID)).toBe(
        false
      );
    });
  });

  describe('subagentBelongsToSession', () => {
    async function belongs(content: string, sessionId = SESSION_ID): Promise<boolean> {
      const projectsDir = createProjectsDir();
      const filePath = writeFile(path.join(projectsDir, PROJECT_ID, 'agent-a.jsonl'), content);
      return new SubagentLocator(projectsDir).subagentBelongsToSession(filePath, sessionId);
    }

    it('returns true when the first line has a matching sessionId', async () => {
      expect(await belongs('{"sessionId":"session-1"}\n{"sessionId":"other"}\n')).toBe(true);
    });

    it('returns false when the first line has a different sessionId', async () => {
      expect(await belongs('{"sessionId":"other"}\n{"sessionId":"session-1"}\n')).toBe(false);
    });

    it('skips leading blank lines', async () => {
      expect(await belongs('   \n\n{"sessionId":"session-1"}\n{"sessionId":"other"}\n')).toBe(true);
    });

    it('handles CRLF line endings', async () => {
      expect(await belongs('{"sessionId":"session-1"}\r\n{}\r\n')).toBe(true);
    });

    it('returns false for an empty file', async () => {
      expect(await belongs('')).toBe(false);
    });

    it('returns false when the first line is not valid JSON', async () => {
      expect(await belongs('not json\n{"sessionId":"session-1"}\n')).toBe(false);
    });

    it('returns false when the file does not exist', async () => {
      const projectsDir = createProjectsDir();
      const missingPath = path.join(projectsDir, PROJECT_ID, 'agent-missing.jsonl');

      expect(
        await new SubagentLocator(projectsDir).subagentBelongsToSession(missingPath, SESSION_ID)
      ).toBe(false);
    });

    it('reads a first line larger than the stream chunk size', async () => {
      const firstLine = JSON.stringify({ sessionId: SESSION_ID, padding: 'x'.repeat(200_000) });
      expect(await belongs(`${firstLine}\n{}\n`)).toBe(true);
    });
  });

  describe('getProjectRootSubagentFiles', () => {
    it('returns only root agent files belonging to the session', async () => {
      const projectsDir = createProjectsDir();
      const projectDir = path.join(projectsDir, PROJECT_ID);
      const mine = writeFile(
        path.join(projectDir, 'agent-mine.jsonl'),
        '{"sessionId":"session-1"}\n'
      );
      writeFile(path.join(projectDir, 'agent-other.jsonl'), '{"sessionId":"other"}\n');
      writeFile(path.join(projectDir, 'agent-empty.jsonl'), '');
      writeFile(path.join(projectDir, 'session-1.jsonl'), '{"sessionId":"session-1"}\n');

      expect(
        await new SubagentLocator(projectsDir).getProjectRootSubagentFiles(PROJECT_ID, SESSION_ID)
      ).toEqual([mine]);
    });
  });
});
