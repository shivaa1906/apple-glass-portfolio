const normalizeEnvValue = (value?: string) => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

export const getEnv = (key: string, fallback: string): string => {
  const value = normalizeEnvValue(process.env[key]);
  return value ?? fallback;
};

export const getSiteUrl = (): string => getEnv("NEXT_PUBLIC_SITE_URL", "https://shivagopiportfolio.netlify.app");

export const getAnalyticsEndpoint = (): string => getEnv("NEXT_PUBLIC_ANALYTICS_ENDPOINT", "/api/analytics");

export const getAnalyticsBaseUrl = () => {
  const endpoint = getAnalyticsEndpoint().replace(/\/+$/, "");
  return endpoint || undefined;
};
