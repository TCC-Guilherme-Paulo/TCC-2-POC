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

    @Get('status')
    status() {
        return { status: 'ok', service: 'activity-service', 'hostname': process.env.HOSTNAME };
    }

    @Get('health')
    health() {
        return { status: 'ok' };
    }
}