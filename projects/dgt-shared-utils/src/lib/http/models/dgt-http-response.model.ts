import { HttpHeaders } from '@angular/common/http';

export interface DGTHttpResponse<T> {
    data: T;
    success: boolean;
    status: number;
    headers?: HttpHeaders | Headers;
}
