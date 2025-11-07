declare module 'jsonwebtoken' {
  export type Algorithm =
    | 'HS256'
    | 'HS384'
    | 'HS512'
    | 'RS256'
    | 'RS384'
    | 'RS512'
    | 'PS256'
    | 'PS384'
    | 'PS512'
    | 'ES256'
    | 'ES256K'
    | 'ES384'
    | 'ES512'
    | 'none';

  export interface SignOptions {
    algorithm?: Algorithm;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    subject?: string;
    issuer?: string;
    jwtid?: string;
    mutatePayload?: boolean;
    header?: Record<string, unknown>;
    noTimestamp?: boolean;
    keyid?: string;
  }

  export type Secret = string | Buffer | { key: Buffer; passphrase: string };

  export function sign(
    payload: string | Buffer | Record<string, unknown>,
    secretOrPrivateKey: Secret,
    options?: SignOptions
  ): string;
}
