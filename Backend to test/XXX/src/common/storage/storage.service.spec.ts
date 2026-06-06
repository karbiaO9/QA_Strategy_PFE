import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

const mockGetSignedUrl = jest.fn();

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: any[]) => mockGetSignedUrl(...args),
}));

import { StorageService, S3_CLIENT } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let s3: any;
  let config: any;
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(async () => {
    process.env.STORAGE_PROVIDER = 'minio';
    process.env.S3_BUCKET = 'test-bucket';
    process.env.S3_REGION = 'eu-west-3';
    process.env.S3_FORCE_PATH_STYLE = 'true';
    process.env.S3_USE_PRESIGNED_GET = 'true';
    process.env.S3_PRESIGNED_GET_TTL_SECONDS = '900';

    s3 = {
      send: jest.fn().mockResolvedValue({}),
    };
    config = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'S3_ENDPOINT') return 'http://localhost:9000';
        if (key === 'S3_PUBLIC_URL_BASE') return undefined;
        if (key === 'S3_SSE') return undefined;
        return undefined;
      }),
    };

    mockGetSignedUrl.mockReset();
    mockGetSignedUrl.mockResolvedValue('https://signed.url/x');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: S3_CLIENT, useValue: s3 },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(StorageService);
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('getPublicUrl', () => {
    it('uses S3_PUBLIC_URL_BASE when set (CDN in front of bucket)', async () => {
      config.get.mockImplementation((key: string) => {
        if (key === 'S3_PUBLIC_URL_BASE') return 'https://cdn.example.com';
        return undefined;
      });
      const m: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          { provide: S3_CLIENT, useValue: s3 },
          { provide: ConfigService, useValue: config },
        ],
      }).compile();
      const svc = m.get(StorageService);
      expect(svc.getPublicUrl('foo/bar.pdf')).toBe(
        'https://cdn.example.com/foo/bar.pdf',
      );
    });

    it('builds a path-style URL when force_path_style=true', () => {
      const url = service.getPublicUrl('justifs/marie/abc.pdf');
      expect(url).toBe(
        'http://localhost:9000/test-bucket/justifs/marie/abc.pdf',
      );
    });

    it('builds a virtual-host URL when force_path_style=false', async () => {
      process.env.S3_FORCE_PATH_STYLE = 'false';
      const m: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          { provide: S3_CLIENT, useValue: s3 },
          { provide: ConfigService, useValue: config },
        ],
      }).compile();
      const svc = m.get(StorageService);
      const url = svc.getPublicUrl('foo.pdf');
      expect(url).toBe('http://test-bucket.localhost:9000/foo.pdf');
    });

    it('falls back to AWS host when provider=aws and no endpoint configured', async () => {
      process.env.STORAGE_PROVIDER = 'aws';
      config.get.mockImplementation(() => undefined); // no endpoint, no public base
      const m: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          { provide: S3_CLIENT, useValue: s3 },
          { provide: ConfigService, useValue: config },
        ],
      }).compile();
      const svc = m.get(StorageService);
      const url = svc.getPublicUrl('x.pdf');
      expect(url).toBe(
        'https://test-bucket.s3.eu-west-3.amazonaws.com/x.pdf',
      );
    });

    it('refuses on non-AWS provider when neither endpoint nor public base is set', async () => {
      process.env.STORAGE_PROVIDER = 'ovh-hds';
      config.get.mockImplementation(() => undefined);
      const m: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          { provide: S3_CLIENT, useValue: s3 },
          { provide: ConfigService, useValue: config },
        ],
      }).compile();
      const svc = m.get(StorageService);
      expect(() => svc.getPublicUrl('x.pdf')).toThrow(
        /provider="ovh-hds" has neither/,
      );
    });
  });

  describe('getSignedDownloadUrl', () => {
    it('delegates to s3-request-presigner with the configured TTL by default', async () => {
      const url = await service.getSignedDownloadUrl('foo/bar.pdf');
      expect(url).toBe('https://signed.url/x');
      const opts = mockGetSignedUrl.mock.calls[0][2];
      expect(opts.expiresIn).toBe(900);
    });

    it('honours an explicit ttlSeconds override', async () => {
      await service.getSignedDownloadUrl('foo.pdf', 60);
      const opts = mockGetSignedUrl.mock.calls[0][2];
      expect(opts.expiresIn).toBe(60);
    });
  });

  describe('delete', () => {
    it('issues a DeleteObjectCommand to the bucket', async () => {
      await service.delete('foo/bar.pdf');
      expect(s3.send).toHaveBeenCalled();
      const cmd = s3.send.mock.calls[0][0];
      expect(cmd.constructor.name).toBe('DeleteObjectCommand');
      expect((cmd as any).input).toEqual({
        Bucket: 'test-bucket',
        Key: 'foo/bar.pdf',
      });
    });
  });

  describe('uploadSupportingDocument (covers private buildKey)', () => {
    it('produces a key in <kind>s/<ownerId>/<ts>-<rand>.<ext> shape', async () => {
      const file = {
        originalname: 'justif.pdf',
        buffer: Buffer.from('x'),
        mimetype: 'application/pdf',
        size: 1,
      } as any;
      const ref = await service.uploadSupportingDocument(file, {
        kind: 'justificatif',
        ownerId: 'kine_id_42',
      });
      expect(ref.key).toMatch(
        /^justificatifs\/kine_id_42\/\d+-[0-9a-f]{40}\.pdf$/,
      );
      expect(ref.url).toBe('https://signed.url/x');
    });

    it('strips unknown extensions to .bin', async () => {
      const file = {
        originalname: 'sneaky.exe',
        buffer: Buffer.from('x'),
        mimetype: 'application/octet-stream',
        size: 1,
      } as any;
      const ref = await service.uploadSupportingDocument(file, {
        kind: 'justificatif',
        ownerId: 'kine_id_42',
      });
      expect(ref.key).toMatch(/\.bin$/);
    });
  });
});
