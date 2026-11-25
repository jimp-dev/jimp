/**
 * An error with the HTTP status the handler responds with. Throw it from a
 * source to choose the status, e.g. `throw new ImageHandlerError(403,
 * "Private image")`. The message is sent as the response body, except for
 * 5xx errors, which send the status text so internal details don't leak.
 */
export class ImageHandlerError extends Error {
  /** The HTTP status code */
  status: number;

  constructor(status: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ImageHandlerError";
    this.status = status;
  }
}
