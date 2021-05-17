let str = '';
let idx = 0;

const peek = () => str.charCodeAt(idx) | 0;
const next = () => str.charCodeAt(idx++) | 0;

export const init = (_str: string) => {
  str = _str;
  idx = 0;
};

export const takeEmpty = (): void => {
  let char: number;
  while ((char = peek()) && char <= 32 /*'\n'*/) next();
};

export const takeNull = (): null | undefined => {
  switch (next()) {
    case 110 /*'n'*/:
      idx += 3;
      return null;
    default:
      idx--;
      return;
  }
};

export const takeBoolean = (): boolean | undefined => {
  switch (next()) {
    case 102 /*'f'*/:
      idx += 4;
      return false;
    case 116 /*'t'*/:
      idx += 3;
      return true;
    default:
      idx--;
      return;
  }
};

export const takeDelimiter = (): number => {
  let char: number;
  switch ((char = next())) {
    case 0 /*'\0'*/:
    case 44 /*','*/:
    case 91 /*'['*/:
    case 93 /*']'*/:
    case 123 /*'{'*/:
    case 125 /*'}'*/:
      return char;
    default:
      idx--;
      return 0;
  }
};

const takeDigits = () => {
  let char: number;
  while ((char = next())) {
    if (char < 48 /*'0'*/ || char > 57 /*'9'*/) {
      idx--;
      break;
    }
  }
};

export const takeInteger = (): number | undefined => {
  // FIXME: Is it faster to just read until the next delimiter?
  const prevIdx = idx;
  if (next() !== 45 /*'-'*/) idx--;
  takeDigits();
  if (prevIdx === idx) return;
  return parseInt(str.slice(prevIdx, idx), 10) || 0;
};

export const takeFloat = (): number | undefined => {
  // FIXME: Is it faster to just read until the next delimiter?
  const prevIdx = idx;
  if (peek() === 45 /*'-'*/ || peek() === 43 /*'+'*/) next();
  takeDigits();

  if (peek() === 46 /*'.'*/) {
    next();
    takeDigits();
  }

  if (peek() === 101 /*'e'*/ || peek() === 69 /*'E'*/) {
    next(); // skips sign
    takeDigits();
  }

  if (prevIdx === idx) return;
  return parseFloat(str.slice(prevIdx, idx)) || 0;
};

export const takeString = (): string | undefined => {
  if (peek() !== 34 /*'"'*/) return;

  let prevIdx = idx;
  let out = '';
  let char: number;
  while ((char = next())) {
    switch (char) {
      case 92 /*'\\'*/:
        const end = idx - 1;
        switch ((char = next())) {
          case 98 /*'\b'*/:
            char = 8;
            break;
          case 102 /*'\f'*/:
            char = 12;
            break;
          case 110 /*'\n'*/:
            char = 10;
            break;
          case 114 /*'\r'*/:
            char = 13;
            break;
          case 116 /*'\r'*/:
            char = 9;
            break;
          case 117 /*'\u'*/:
            char = parseInt(str.slice(idx, idx += 4), 16) | 0;
            break;
        }

        out += str.slice(prevIdx, end) + String.fromCharCode(char);
        prevIdx = idx;
        break;

      case 34 /*'"'*/:
        out += str.slice(prevIdx, idx - 1);
        prevIdx = idx;
        break;
      default:
        continue;
    }
  }

  return out;
};

export const takeProperty = (): string | undefined => {
  if (peek() !== 34 /*'"'*/) return;

  const prevIdx = ++idx;
  while (next() !== 34);
  const prop = str.slice(prevIdx, idx - 1);

  takeEmpty();
  if (next() !== 58 /*':'*/) {
    idx = prevIdx - 1;
    return;
  }

  return prop;
};

export const takeAny = (): any | undefined => {
  const prevIdx = idx;

  let depth = 0;
  let char: number;
  loop: while (char = next()) {
    switch (char) {
      case 123 /*'{'*/:
      case 91 /*'['*/:
        depth++;
        break;
      case 125 /*'}'*/:
      case 93 /*']'*/:
        if (depth) {
          if (--depth) break;
          break loop;
        } else {
          idx--;
          break loop;
        }
      case 34 /*'"'*/:
        while ((char = next()) && char !== 34 /*'"'*/)
          if (char === 92 /*'\\'*/) next();
        break;
      case 44 /*','*/:
        if (depth) continue;
        break loop;
      case 0 /*'\0'*/:
        break loop;
    }
  }

  return JSON.parse(str.slice(prevIdx, idx));
};
