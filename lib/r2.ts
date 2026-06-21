import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 storage connection.
 *
 * R2 is S3-compatible, so we use the AWS SDK with the R2 endpoint.
 * The public URL is exposed client-side for asset resolution; the
 * API credentials are server-only and used for uploads.
 */

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? '';
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? '';
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? '';
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'crowntunz-music';
const R2_REGION = process.env.CLOUDFLARE_R2_REGION ?? 'auto';

/** Public base URL for serving R2 assets to the browser. */
export const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL ?? '';

/** Whether all R2 API credentials are configured. */
export const r2Configured = Boolean(
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY,
);

/**
 * Resolve an R2 object key to a public URL.
 * Falls back to the original URL if R2 is not configured or the key
 * is already a full URL.
 */
export function r2Url(key: string): string {
  if (!key) return '';
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  if (!R2_PUBLIC_URL) return key;
  const base = R2_PUBLIC_URL.replace(/\/$/, '');
  const clean = key.replace(/^\//, '');
  return `${base}/${clean}`;
}

let _client: S3Client | null = null;

/**
 * Lazily-initialized R2 S3 client (server-side only).
 * Returns null if credentials are missing.
 */
function r2Client(): S3Client | null {
  if (!r2Configured) return null;
  if (!_client) {
    _client = new S3Client({
      region: R2_REGION,
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

/**
 * Upload a file to R2 and return its public URL.
 * Server-side only — requires R2 API credentials.
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<UploadResult | null> {
  const client = r2Client();
  if (!client) {
    console.warn('[r2] not configured — skipping upload');
    return null;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return {
    key,
    url: r2Url(key),
    bucket: R2_BUCKET_NAME,
  };
}

/** R2 connection status for admin/diagnostics panels. */
export const r2Status = {
  configured: r2Configured,
  publicUrl: R2_PUBLIC_URL || '(not set)',
  bucket: R2_BUCKET_NAME,
  region: R2_REGION,
};
