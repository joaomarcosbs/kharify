import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = Array.isArray((exceptionResponse as any)['message'])
          ? ((exceptionResponse as any)['message'] as string[]).join(', ')
          : (exceptionResponse as any)['message'];
      } else {
        message = exception.message;
      }

      code = exception.constructor.name.replace('Exception', '').toUpperCase();
    }

    response.status(status).json({
      data: null,
      meta: {},
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
