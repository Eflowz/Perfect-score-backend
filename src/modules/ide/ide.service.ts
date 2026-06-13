export class IDEService {
  private sessions = new Map<string, { users: Set<string>; code: string }>();

  async executeCode(code: string, language: string) {
    const isPython = language.toLowerCase() === 'python';
    
    if (code.includes('error') || code.includes('Exception')) {
      return {
        success: false,
        stdout: '',
        stderr: 'RuntimeError: Execution failed due to mock error directive',
        exitCode: 1,
      };
    }

    let stdout = 'Code executed successfully.\n';
    if (isPython) {
      const printRegex = /print\((['"])(.*?)\1\)/g;
      const matches = [...code.matchAll(printRegex)];
      if (matches.length > 0) {
        stdout = matches.map(m => m[2]).join('\n') + '\n';
      }
    }

    return {
      success: true,
      stdout,
      stderr: '',
      exitCode: 0,
    };
  }

  joinSession(sessionId: string, userId: string) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { users: new Set(), code: '' });
    }
    const sess = this.sessions.get(sessionId)!;
    sess.users.add(userId);
    return sess;
  }

  leaveSession(sessionId: string, userId: string) {
    const sess = this.sessions.get(sessionId);
    if (!sess) return;
    sess.users.delete(userId);
    if (sess.users.size === 0) {
      this.sessions.delete(sessionId);
    }
  }

  updateSessionCode(sessionId: string, code: string) {
    const sess = this.sessions.get(sessionId);
    if (sess) {
      sess.code = code;
    }
  }
}
