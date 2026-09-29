export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> };

export interface ActionError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function errorResult<T = unknown>(
  error: string,
  details?: Record<string, string[]>
): ActionResult<T> {
  return { success: false, error, details };
}
