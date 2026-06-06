import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { envBool, requireEnv } from '../config/env';
import { S3_CLIENT, StorageService, resolveStorageProvider } from './storage.service';

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): S3Client => {
        const provider = resolveStorageProvider();
        const region = requireEnv('S3_REGION');
        const accessKeyId = requireEnv('S3_ACCESS_KEY_ID');
        const secretAccessKey = requireEnv('S3_SECRET_ACCESS_KEY');
        const endpoint = config.get<string>('S3_ENDPOINT') || undefined;
        const forcePathStyle = envBool('S3_FORCE_PATH_STYLE', false);

        if (provider === 'ovh-hds' && !endpoint) {
          throw new Error(
            'STORAGE_PROVIDER="ovh-hds" requires S3_ENDPOINT to be set ' +
              '(e.g. https://s3.<region>.io.cloud.ovh.net). Refusing to boot against the AWS default endpoint.',
          );
        }

        return new S3Client({
          region,
          endpoint,
          forcePathStyle,
          credentials: { accessKeyId, secretAccessKey },
        });
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
