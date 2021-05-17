import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@urql/core';

import { IntrospectionData } from './schema';

export interface JSONParser {
  <T>(query: DocumentNode | TypedDocumentNode<T>): T;
}

export function makeParser(_schema: IntrospectionData): JSONParser {
  // TODO
  return () => ({} as any);
}
