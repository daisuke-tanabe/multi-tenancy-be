export class AppError extends Error {
  readonly statusCode;

  readonly name;

  constructor(
    message: Error['message'],
    options: ErrorOptions & {
      statusCode?: number;
      name?: string;
    },
  ) {
    const { statusCode = 500, name = 'Error', ...opts } = options;

    super(message, opts);

    this.statusCode = statusCode;
    this.name = name;
  }
}
