import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = exception.message || 'Resource not found';
    }

    if (
      exception instanceof Error &&
      'code' in exception &&
      exception.code === '23505'
    ) {
      statusCode = HttpStatus.CONFLICT;
      message = 'Duplicate entry error';
    }

    if (exception instanceof PayloadTooLargeException) {
      statusCode = HttpStatus.PAYLOAD_TOO_LARGE;
      message = exception.message || 'File size exceeds the limit';
    }

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
    }

    console.error(`An error occurred in ${req.method} ${req.url}:`, exception);

    return res.status(statusCode).json({
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      message,
    });
  }
}
