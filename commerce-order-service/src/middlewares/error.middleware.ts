import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// Centralised error handler — every error funnelled here
export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  
  // Mask generic 500 errors so we don't leak raw database/internal info to users
  const isInternal = statusCode === 500;
  const message = err.message || 'Internal Server Error';

  // Always log the full trace server-side for debugging
  console.error(`[ERROR] ${statusCode}: ${err.message ?? 'Internal Error'}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code ?? 'INTERNAL_ERROR',
  });
}

// Helper to create typed errors
export function createError(
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR'
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
