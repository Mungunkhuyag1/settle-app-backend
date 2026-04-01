import { Injectable, Scope, Logger as NestLogger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId?: string;
  userId?: string;
  username?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends NestLogger {
  private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  static setContext(context: RequestContext) {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      Object.assign(store, context);
    }
  }

  static getContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  static run<T>(context: RequestContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  private formatMessage(message: any): string {
    const context = AppLogger.getContext();
    if (!context || Object.keys(context).length === 0) {
      return message;
    }

    const contextInfo: string[] = [];

    if (context.requestId) contextInfo.push(`reqId=${context.requestId}`);
    if (context.userId) contextInfo.push(`userId=${context.userId}`);
    if (context.username) contextInfo.push(`user=${context.username}`);
    if (context.email) contextInfo.push(`email=${context.email}`);
    if (context.ip) contextInfo.push(`ip=${context.ip}`);
    if (context.method && context.url)
      contextInfo.push(`${context.method} ${context.url}`);

    return contextInfo.length > 0
      ? `[${contextInfo.join(' | ')}] ${message}`
      : message;
  }

  log(message: any, ...optionalParams: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super.log(this.formatMessage(message), ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super.error(this.formatMessage(message), ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super.warn(this.formatMessage(message), ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super.debug(this.formatMessage(message), ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super.verbose(this.formatMessage(message), ...optionalParams);
  }
}
