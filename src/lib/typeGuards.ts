import {MetadataBearer} from "@smithy/types/dist-types/response";

// Object判定する型ガード
// { key: value } なオブジェクトだけで判定し、Array・function・Dateは含まない
export function isObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && x.constructor === Object;
}

export function isResponseMetadata(x: unknown): x is MetadataBearer & { __type: string } {
  return x !== null && typeof x === 'object' && '$metadata' in x && '__type' in x;
}