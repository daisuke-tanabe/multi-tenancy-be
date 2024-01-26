import {MetadataBearer} from "@smithy/types/dist-types/response";

export type CognitoError = Error & MetadataBearer & { __type: string }