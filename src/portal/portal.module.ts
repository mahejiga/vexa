import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'vexa-secret', signOptions: { expiresIn: '7d' } })],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
