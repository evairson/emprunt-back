function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const env = {
  JWT_SECRET: required('JWT_SECRET'),
  REZEL_AUTH_URL: required('REZEL_AUTH_URL'),
  REZEL_TOKEN_URL: required('REZEL_TOKEN_URL'),
  REZEL_USERINFO_URL: required('REZEL_USERINFO_URL'),
  REZEL_CLIENT_ID: required('REZEL_CLIENT_ID'),
  REZEL_CLIENT_SECRET: required('REZEL_CLIENT_SECRET'),
  REZEL_CALLBACK_URL: required('REZEL_CALLBACK_URL'),
};
