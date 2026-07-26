const normalizeEnvValue = (value?: string) => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

export const getEnv = (key: string, fallback?: string) => {
  const value = normalizeEnvValue(process.env[key]);
  return value ?? fallback;
};

export const getSiteUrl = () => getEnv("NEXT_PUBLIC_SITE_URL", "https://shivaxroy.dev");

export const getAnalyticsEndpoint = () => getEnv("NEXT_PUBLIC_ANALYTICS_ENDPOINT", "/analytics/track");

export const getAnalyticsBaseUrl = () => {
  const endpoint = getAnalyticsEndpoint().replace(/\/+$/, "");
  return endpoint || undefined;
};
