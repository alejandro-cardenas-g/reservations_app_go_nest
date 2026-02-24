export type ResultCodes =
  | 'RESOURCE_NOT_FOUND'
  | 'UNEXPECTED_ERROR'
  | 'CONFLICT_ERROR'
  | 'FORBIDDEN_ERROR'
  | 'UNAUTHORIZED_ERROR'
  | 'INVALID_ERROR'
  | 'OPERATION_NOT_EXECUTED';

export type TResult<T> =
  | {
      isSuccess: true;
      value: T;
    }
  | {
      isSuccess: false;
      error: string;
      code: ResultCodes;
    };

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly error!: string;
  private readonly value!: T;
  public readonly code!: ResultCodes;

  private constructor(
    isSuccess: boolean,
    error?: string,
    code?: ResultCodes,
    value?: T,
  ) {
    if (isSuccess && error) {
      throw new Error(
        'InvalidOperation: A result cannot be successful and contain an error',
      );
    }
    if (!isSuccess && !error) {
      throw new Error(
        'InvalidOperation: A failing result needs to contain an error message',
      );
    }

    this.isSuccess = isSuccess;
    if (this.isSuccess) {
      this.value = value!;
    } else {
      this.error = error!;
      this.code = code!;
    }
  }

  public static Success<U>(value?: U): TResult<U> {
    return new Result<U>(true, undefined, undefined, value) as TResult<U>;
  }

  public static Failure<U>(
    error: string,
    code: ResultCodes = 'UNEXPECTED_ERROR',
  ): TResult<U> {
    return new Result<U>(false, error || code, code) as TResult<U>;
  }
}
