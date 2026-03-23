export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  statusCode: number;
}

export function successResponse<T>(data: T, message: string = 'Success', statusCode: number = 200): APIResponse<T> {
  return {
    success: true,
    data,
    message,
    statusCode,
  };
}

export function errorResponse(message: string, statusCode: number = 400): APIResponse {
  return {
    success: false,
    message,
    statusCode,
  };
}

export function pagingResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
): APIResponse {
  return {
    success: true,
    data: {
      items: data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
    message,
    statusCode: 200,
  };
}
