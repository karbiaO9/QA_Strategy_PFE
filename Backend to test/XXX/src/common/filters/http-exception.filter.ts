import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const isObject =
      typeof exceptionResponse === 'object' && exceptionResponse !== null;
    const extras = isObject ? { ...exceptionResponse } : {};

    const body: Record<string, any> = {
      ...extras,
      statusCode: status,
      error: extras.error ?? exception.name,
      message: extras.message ?? exception.message,
    };

    response.status(status).json(body);
  }
}
