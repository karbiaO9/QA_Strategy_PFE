import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as path from 'path';
import { envBool, envNumber, requireEnv } from '../config/env';
import { StoredFileRef, UploadContext, UploadInputFile } from './storage.types';

export const S3_CLIENT = 'S3_CLIENT';

export type StorageProvider = 'aws' | 'ovh-hds' | 'minio';

const SAFE_EXTS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

const STORAGE_TIER: Record<StorageProvider, string> = {
  aws: 'aws-standard',
  'ovh-hds': 'hds-ovh',
  minio: 'minio-dev',
};

export function resolveStorageProvider(): StorageProvider {
  const raw = (process.env.STORAGE_PROVIDER || 'ovh-hds').trim().toLowerCase();
  if (raw === 'aws' || raw === 'ovh-hds' || raw === 'minio') return raw;
  throw new Error(
    `Invalid STORAGE_PROVIDER="${raw}". Allowed values: "aws" | "ovh-hds" | "minio".`,
  );
}

@Injectable()
export class StorageService {
  private readonly provider: StorageProvider;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly forcePathStyle: boolean;
  private readonly publicUrlBase?: string;
  private readonly usePresignedGet: boolean;
  private readonly presignedGetTtl: number;
  private readonly sse?: 'AES256' | 'aws:kms';

  constructor(
    @Inject(S3_CLIENT) private readonly s3: S3Client,
    private readonly config: ConfigService,
  ) {
    this.provider = resolveStorageProvider();
    this.bucket = requireEnv('S3_BUCKET');
    this.region = requireEnv('S3_REGION');
    this.endpoint = this.config.get<string>('S3_ENDPOINT') || undefined;
    this.forcePathStyle = envBool('S3_FORCE_PATH_STYLE', false);
    this.publicUrlBase =
      this.config.get<string>('S3_PUBLIC_URL_BASE')?.replace(/\/+$/, '') ||
      undefined;
    this.usePresignedGet = envBool('S3_USE_PRESIGNED_GET', true);
    this.presignedGetTtl = envNumber('S3_PRESIGNED_GET_TTL_SECONDS', 900);
    this.sse = this.resolveSse(this.config.get<string>('S3_SSE'));
  }

  async uploadSupportingDocument(
    file: UploadInputFile,
    ctx: UploadContext,
  ): Promise<StoredFileRef> {
    const key = this.buildKey(file.originalname, ctx);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
        ServerSideEncryption: this.sse,
        Metadata: {
          'storage-tier': STORAGE_TIER[this.provider],
          'data-class': `health-${ctx.kind}`,
          'uploaded-by-service': 'service1-identity',
          'owner-id': ctx.ownerId,
        },
      }),
    );

    const url = this.usePresignedGet
      ? await this.getSignedDownloadUrl(key)
      : this.getPublicUrl(key);

    return { key, url };
  }

  getPublicUrl(key: string): string {
    if (this.publicUrlBase) {
      return `${this.publicUrlBase}/${key}`;
    }
    if (this.endpoint) {
      const host = this.endpoint.replace(/\/+$/, '');
      return this.forcePathStyle
        ? `${host}/${this.bucket}/${key}`
        : `${host.replace('://', `://${this.bucket}.`)}/${key}`;
    }
    if (this.provider !== 'aws') {
      throw new Error(
        `getPublicUrl: provider="${this.provider}" has neither S3_PUBLIC_URL_BASE nor S3_ENDPOINT configured. ` +
          'Refusing to fall back to the AWS host pattern on a non-AWS provider — set S3_USE_PRESIGNED_GET=true ' +
          'or configure S3_PUBLIC_URL_BASE.',
      );
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async getSignedDownloadUrl(key: string, ttlSeconds?: number): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: ttlSeconds ?? this.presignedGetTtl },
    );
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  private buildKey(originalName: string, ctx: UploadContext): string {
    const ext = (path.extname(originalName) || '').toLowerCase();
    const safeExt = SAFE_EXTS.has(ext) ? ext : '.bin';
    const rand = crypto.randomBytes(20).toString('hex');
    const ts = Date.now();
    return `${ctx.kind}s/${ctx.ownerId}/${ts}-${rand}${safeExt}`;
  }

  private resolveSse(value?: string): 'AES256' | 'aws:kms' | undefined {
    if (value === 'AES256') return 'AES256';
    if (value === 'aws:kms') {
      if (this.provider !== 'aws') {
        throw new Error(
          `S3_SSE="aws:kms" is only supported on STORAGE_PROVIDER=aws (got "${this.provider}"). ` +
            'OVH HDS S3 / MinIO do not implement KMS-backed SSE — use AES256 or leave S3_SSE empty.',
        );
      }
      return 'aws:kms';
    }
    return undefined;
  }
}
