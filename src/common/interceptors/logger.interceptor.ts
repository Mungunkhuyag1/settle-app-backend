import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { AppLogger } from '../logger/app-logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers, body, query, params } = request;
    const user = request.user;
    const startTime = Date.now();

    const requestContext = {
      requestId: uuidv4(),
      userId: user?.userId || user?.cognitoId,
      username: user?.username,
      email: user?.email,
      ip: ip || headers['x-forwarded-for'] || headers['x-real-ip'],
      userAgent: headers['user-agent'],
      method,
      url,
    };

    // Log incoming request
    const requestLog = {
      timestamp: new Date().toISOString(),
      requestId: requestContext.requestId,
      method,
      url,
      ip: requestContext.ip,
      userAgent: requestContext.userAgent,
      user: user
        ? {
            userId: requestContext.userId,
            username: requestContext.username,
            email: requestContext.email,
          }
        : 'Anonymous',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      query: Object.keys(query || {}).length > 0 ? query : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      params: Object.keys(params || {}).length > 0 ? params : undefined,
      body: this.sanitizeBody(body),
    };

    this.logger.log(`Request: ${JSON.stringify(requestLog, null, 2)}`);

    return new Observable((subscriber) => {
      AppLogger.run(requestContext, () => {
        next
          .handle()
          .pipe(
            tap({
              next: (responseData) => {
                const duration = Date.now() - startTime;
                const sanitizedResponse = this.sanitizeBody(responseData);
                const responseLog = {
                  timestamp: new Date().toISOString(),
                  requestId: requestContext.requestId,
                  method,
                  url,
                  statusCode: response.statusCode,
                  duration: `${duration}ms`,
                  user: requestContext.username || 'Anonymous',
                  responseBody: this.truncateResponseBody(
                    sanitizedResponse,
                    600,
                  ),
                };
                this.logger.log(
                  `Response: ${JSON.stringify(responseLog, null, 2)}`,
                );
              },
              error: (error) => {
                const duration = Date.now() - startTime;
                const errorLog = {
                  timestamp: new Date().toISOString(),
                  requestId: requestContext.requestId,
                  method,
                  url,
                  statusCode: error.status || 500,
                  duration: `${duration}ms`,
                  error: error.message,
                  user: requestContext.username || 'Anonymous',
                };
                this.logger.error(
                  `Error Response: ${JSON.stringify(errorLog, null, 2)}`,
                );
              },
            }),
          )
          .subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          });
      });
    });
  }

  /**
   * Sanitize request body to hide sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'currentPassword',
      'newPassword',
      'temporaryPassword',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Truncate response body to specified character limit
   */
  private truncateResponseBody(data: any, maxLength: number): any {
    if (!data) {
      return data;
    }

    const jsonString = JSON.stringify(data);
    if (jsonString.length <= maxLength) {
      return data;
    }

    return jsonString.substring(0, maxLength) + '... (truncated)';
  }
}
