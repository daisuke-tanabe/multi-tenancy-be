import {MetadataBearer} from "@smithy/types/dist-types/response";

import {CognitoError} from "../types";

// Object判定する型ガード
// { key: value } なオブジェクトだけで判定し、Array・function・Dateは含まない
export function isObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && x.constructor === Object;
}

export function isResponseCognitoError(x: unknown): x is CognitoError {
  return x !== null && typeof x === 'object' && x instanceof Error && 'message' in x && '$metadata' in x && '__type' in x;
}