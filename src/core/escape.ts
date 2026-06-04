const NEEDS_ESCAPE = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g;

export const escapeSelector = (raw: string): string => {
  return raw.replace(NEEDS_ESCAPE, (m) => `\\${m}`);
};
