export const isDevelopment = process.env.NODE_ENV === 'development';

export const API_HOST =
  process.env.REACT_APP_API_HOST ||
  (isDevelopment ? 'http://locahost:4000' : 'http://example.com/api');
