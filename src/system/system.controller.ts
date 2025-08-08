import { Controller, Get } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';  

@Controller()
export class SystemController {
  @Public()
  @Get('status')
  getSystemStatus() {
    return {
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
