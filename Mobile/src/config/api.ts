function resolveBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envBaseUrl && envBaseUrl.trim().length > 0) {
    return envBaseUrl;
  }

  return 'http://localhost:4000';
}

export const BASE_URL = resolveBaseUrl();
