import { MetadataBearer } from '@smithy/types';

export type CognitoError = Error & MetadataBearer & { __type: string };
