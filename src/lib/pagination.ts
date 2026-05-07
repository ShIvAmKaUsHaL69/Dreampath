type PaginationOptions = {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
};

function toSafePositiveInt(value: string | null, fallback: number): number {
  if (value === null) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return parsed;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
  options: PaginationOptions = {}
) {
  const defaultPage = options.defaultPage ?? 1;
  const defaultLimit = options.defaultLimit ?? 20;
  const maxLimit = options.maxLimit ?? 100;

  const page = toSafePositiveInt(searchParams.get('page'), defaultPage);
  const limit = Math.min(
    toSafePositiveInt(searchParams.get('limit'), defaultLimit),
    maxLimit
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
