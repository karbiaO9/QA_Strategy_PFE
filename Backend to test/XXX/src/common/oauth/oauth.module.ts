import { Global, Module } from '@nestjs/common';
import { OAuthVerifierService } from './oauth-verifier.service';

@Global()
@Module({
  providers: [OAuthVerifierService],
  exports: [OAuthVerifierService],
})
export class OAuthModule {}
