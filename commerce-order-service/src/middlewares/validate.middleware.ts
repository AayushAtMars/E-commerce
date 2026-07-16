import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const validated = schemas.query.parse(req.query);
        // req.query is a getter in Express, so we can't reassign it directly.
        // We'll just replace its properties in-place.
        for (const key in req.query) delete req.query[key];
        Object.assign(req.query, validated);
      }
      if (schemas.params) {
        const validated = schemas.params.parse(req.params);
        for (const key in req.params) delete req.params[key];
        Object.assign(req.params, validated);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message ?? 'Validation error',
          code: 'VALIDATION_ERROR',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
}
