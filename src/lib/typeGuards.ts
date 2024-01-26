import { CognitoError } from '../types';

export function isResponseCognitoError(x: unknown): x is CognitoError {
  return (
    x !== null && typeof x === 'object' && x instanceof Error && 'message' in x && '$metadata' in x && '__type' in x
  );
}
