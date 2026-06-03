export class ApiError extends Error {
  status: number;
  code: string;
  detail?: string;
  errors?: Record<string, string[]>;

  constructor(
    status: number,
    code: string,
    message: string,
    detail?: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.errors = errors;
  }
}
