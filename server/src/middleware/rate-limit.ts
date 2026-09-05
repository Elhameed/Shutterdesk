import rateLimit from "express-rate-limit";

const skipInTest = () => process.env.NODE_ENV === "test";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Too many authentication attempts. Please try again later.",
    statusCode: 429,
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Too many upload requests. Please try again later.",
    statusCode: 429,
  },
});

/**
 * Gallery PINs are short and numeric, so the verify endpoint is the most
 * brute-forceable route in the API. Tighter than the auth limiter because a
 * legitimate client types the PIN once.
 */
export const galleryPinRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Too many PIN attempts. Please try again later.",
    statusCode: 429,
  },
});

export const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Too many requests. Please try again later.",
    statusCode: 429,
  },
});
