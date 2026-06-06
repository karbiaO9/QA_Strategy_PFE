import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

export interface MailboxConfig {
  user: string;
  password: string;
  host: string;
  port: number;
}

export interface OtpCaptureOptions {
  /** Only accept mail from this sender address (substring match). */
  fromContains: string;
  /** Ignore messages received before this time (defends against stale codes). */
  receivedAfter: Date;
  /** Total time to keep polling for the mail, ms. Default 60_000. */
  timeoutMs?: number;
  /** Delay between inbox polls, ms. Default 3_000. */
  pollIntervalMs?: number;
  /** Regex used to pull the code out of the body. Default: first 6 digits. */
  codePattern?: RegExp;
  /** Mailboxes to scan, in order. Default: INBOX then Gmail spam. */
  mailboxes?: string[];
}

/**
 * Reads IMAP credentials from the environment. Returns null when not
 * configured so callers can fall back to a manual VERIFICATION_CODE or skip.
 */
export function getMailboxConfig(): MailboxConfig | null {
  const user = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;
  if (!user || !password) {
    return null;
  }
  return {
    user,
    password,
    host: process.env.GMAIL_IMAP_HOST ?? 'imap.gmail.com',
    port: Number(process.env.GMAIL_IMAP_PORT ?? 993),
  };
}

interface OtpCandidate {
  code: string;
  receivedAt: Date;
}

/**
 * Returns the newest matching OTP candidate in a single mailbox, or null.
 * Each forgot-password call invalidates the previous code, so the caller
 * must compare candidates across mailboxes and use the most recent one —
 * never the first one found (a stale code moved out of Spam can otherwise
 * shadow the fresh one).
 */
async function scanMailboxForOtp(
  client: ImapFlow,
  mailbox: string,
  options: Required<Pick<OtpCaptureOptions, 'fromContains' | 'receivedAfter' | 'codePattern'>>
): Promise<OtpCandidate | null> {
  let lock;
  try {
    lock = await client.getMailboxLock(mailbox);
  } catch {
    // Mailbox (e.g. [Gmail]/Spam) may not exist on this account.
    return null;
  }

  try {
    // IMAP SINCE is day-granular, so we re-filter on internalDate below.
    const sinceDay = new Date(options.receivedAfter);
    sinceDay.setHours(0, 0, 0, 0);
    const uids = await client.search({ since: sinceDay }, { uid: true });
    if (!uids || uids.length === 0) {
      return null;
    }

    let best: OtpCandidate | null = null;
    // Newest first; keep scanning to always retain the most recent match.
    const ordered = [...uids].sort((a, b) => b - a);
    for (const uid of ordered) {
      const message = await client.fetchOne(
        String(uid),
        { source: true, internalDate: true, envelope: true },
        { uid: true }
      );
      if (!message || !message.source || !message.internalDate) {
        continue;
      }
      // imapflow types internalDate as string | Date depending on server.
      const receivedAt = new Date(message.internalDate);
      if (receivedAt < options.receivedAfter) {
        continue;
      }
      if (best && receivedAt <= best.receivedAt) {
        continue;
      }

      const parsed = await simpleParser(message.source);
      const from = parsed.from?.text ?? '';
      if (!from.toLowerCase().includes(options.fromContains.toLowerCase())) {
        continue;
      }

      const haystack = `${parsed.subject ?? ''}\n${parsed.text ?? ''}\n${parsed.html || ''}`;
      const match = haystack.match(options.codePattern);
      if (match) {
        best = { code: match[1] ?? match[0], receivedAt };
      }
    }
    return best;
  } finally {
    lock.release();
  }
}

/**
 * Polls the mailbox until an OTP email from the expected sender (received
 * after `receivedAfter`) appears, then returns the extracted code.
 * Throws if no code is found within `timeoutMs`.
 */
export async function fetchLatestOtp(
  config: MailboxConfig,
  options: OtpCaptureOptions
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? 60_000;
  const pollIntervalMs = options.pollIntervalMs ?? 3_000;
  const codePattern = options.codePattern ?? /\b(\d{6})\b/;
  const mailboxes = options.mailboxes ?? ['INBOX', '[Gmail]/Spam'];

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: true,
      auth: { user: config.user, pass: config.password },
      logger: false,
    });

    try {
      await client.connect();
      let newest: OtpCandidate | null = null;
      for (const mailbox of mailboxes) {
        const candidate = await scanMailboxForOtp(client, mailbox, {
          fromContains: options.fromContains,
          receivedAfter: options.receivedAfter,
          codePattern,
        });
        if (candidate && (!newest || candidate.receivedAt > newest.receivedAt)) {
          newest = candidate;
        }
      }
      if (newest) {
        return newest.code;
      }
    } finally {
      await client.logout().catch(() => undefined);
    }

    if (Date.now() + pollIntervalMs >= deadline) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(
    `OTP email from "${options.fromContains}" not found within ${timeoutMs}ms ` +
      `(received after ${options.receivedAfter.toISOString()})`
  );
}

interface EmailMatchCandidate {
  match: string;
  receivedAt: Date;
}

/**
 * Polls the mailbox until an email matches `bodyPattern` in subject/body/html.
 * Returns the first capture group when the pattern has one, otherwise the full match.
 */
export async function fetchLatestEmailMatch(
  config: MailboxConfig,
  options: OtpCaptureOptions & { bodyPattern: RegExp }
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? 90_000;
  const pollIntervalMs = options.pollIntervalMs ?? 3_000;
  const mailboxes = options.mailboxes ?? ['INBOX', '[Gmail]/Spam'];
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: true,
      auth: { user: config.user, pass: config.password },
      logger: false,
    });

    try {
      await client.connect();
      let newest: EmailMatchCandidate | null = null;

      for (const mailbox of mailboxes) {
        let lock;
        try {
          lock = await client.getMailboxLock(mailbox);
        } catch {
          continue;
        }

        try {
          const sinceDay = new Date(options.receivedAfter);
          sinceDay.setHours(0, 0, 0, 0);
          const uids = await client.search({ since: sinceDay }, { uid: true });
          if (!uids || uids.length === 0) {
            continue;
          }

          const ordered = [...uids].sort((a, b) => b - a);
          for (const uid of ordered) {
            const message = await client.fetchOne(
              String(uid),
              { source: true, internalDate: true },
              { uid: true }
            );
            if (!message || message === false || !('source' in message) || !message.source) {
              continue;
            }
            if (!message.internalDate) {
              continue;
            }

            const receivedAt = new Date(message.internalDate);
            if (receivedAt < options.receivedAfter) {
              continue;
            }
            if (newest && receivedAt <= newest.receivedAt) {
              continue;
            }

            const parsed = await simpleParser(message.source);
            const from = parsed.from?.text ?? '';
            if (!from.toLowerCase().includes(options.fromContains.toLowerCase())) {
              continue;
            }

            const haystack = `${parsed.subject ?? ''}\n${parsed.text ?? ''}\n${parsed.html || ''}`;
            const matched = haystack.match(options.bodyPattern);
            if (matched) {
              newest = { match: matched[1] ?? matched[0], receivedAt };
            }
          }
        } finally {
          lock.release();
        }
      }

      if (newest) {
        return newest.match;
      }
    } finally {
      await client.logout().catch(() => undefined);
    }

    if (Date.now() + pollIntervalMs >= deadline) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(
    `Email from "${options.fromContains}" matching ${options.bodyPattern} not found within ${timeoutMs}ms`
  );
}
