import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ZonasFrancasModule } from '../zonas-francas/zonas-francas.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [ZonasFrancasModule, LeadsModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
