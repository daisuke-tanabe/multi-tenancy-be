export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: Error['message'], options: ErrorOptions & {
    statusCode?: number,
  }) {
    const { statusCode = 500, ...ops } = options;

    super(message, ops);
    this.statusCode = statusCode;
  }
}