import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      name: 'settle-app-backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
