import { API_BASE_URL } from '@/constants/api';

const API_ORIGIN = new URL(API_BASE_URL).origin;
const BLOB_PREFIX = 'blob:';
const DATA_PREFIX = 'data:';
const FILE_PREFIX = 'file://';
const CONTENT_PREFIX = 'content://';

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function resolveMediaUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const lowerValue = trimmedValue.toLowerCase();

  if (lowerValue.startsWith(BLOB_PREFIX) || lowerValue.startsWith(DATA_PREFIX)) {
    return null;
  }

  if (lowerValue.startsWith(FILE_PREFIX) || lowerValue.startsWith(CONTENT_PREFIX)) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith('/uploads/')) {
    return `${API_ORIGIN}${trimmedValue}`;
  }

  if (trimmedValue.startsWith('uploads/')) {
    return `${API_ORIGIN}/${trimmedValue}`;
  }

  const parsedUrl = parseUrl(trimmedValue);

  if (!parsedUrl) {
    return trimmedValue;
  }

  if (parsedUrl.pathname.startsWith('/uploads/')) {
    return `${API_ORIGIN}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }

  return trimmedValue;
}