import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    root() {
        return {
            status: 'ok',
            service: 'activity-service',
            timestamp: new Date().toISOString()
        };
    }

    @Get('health')
    health() {
        return { status: 'ok' };
    }
}