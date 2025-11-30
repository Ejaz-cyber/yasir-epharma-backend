export class ApiResponse {
  statusCode: number;
  data?: any;
  message: string;
  success: boolean;

  constructor(statusCode: number, data?: any, message = "Success") {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;

    if (data !== null && data !== undefined) {
      this.data = data;
    }
  }
}
