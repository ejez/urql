import * as tokenizer from './tokenizer';
import { IntrospectionTypeRef } from 'graphql';

import { SchemaTypes } from './schema';

const _obj = 'obj';

const _tokens = {
  ws: 'tokens._ws',
  null: 'tokens._null',
  bool: 'tokens._bool',
  delim: 'tokens._delim',
  int: 'tokens._int',
  float: 'tokens._float',
  str: 'tokens._str',
  prop: 'tokens._prop',
  any: 'tokens._any',
};

let types: SchemaTypes;

const js = (str: TemplateStringsArray, ...interpolations: ReadonlyArray<string>) => {
  let body = str[0];
  for (let i = 0; i < interpolations.length; i++)
    body = body + interpolations[i] + str[i];
  return body.trim();
};
