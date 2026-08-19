export type TranslateErrorCode =
  | "PARSE_ERROR"
  | "UNSUPPORTED_DOCUMENT_TYPE"
  | "MISSING_REQUIRED_SECTION"
  | "UNMAPPABLE_CODE"
  | "INVALID_DATE";

export class TranslateError extends Error {
  readonly code: TranslateErrorCode;
  // XPath-like location of the failure — never a PHI value.
  readonly path: string;
  override readonly cause?: Error;

  constructor(message: string, code: TranslateErrorCode, path: string, cause?: Error) {
    super(message);
    this.name = "TranslateError";
    this.code = code;
    this.path = path;
    if (cause) this.cause = cause;
  }
}
