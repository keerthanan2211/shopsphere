import { ApiError } from '../utils/api-error.js';

/**
 * Validates req[source] against a Zod schema and replaces it with the parsed (typed, trimmed) value.
 * Usage: router.post('/', validate(schema), handler)
 */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(new ApiError(400, details[0]?.message ?? 'Invalid request', details));
    }
    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;
    next();
  };
