export interface DGTHttpResponse<T> {
  data?: T;
  success: boolean;
  status: number;
  headers?: { [name: string]: string };
}
