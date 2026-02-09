import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration } from '../metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
  });

  next();
};
