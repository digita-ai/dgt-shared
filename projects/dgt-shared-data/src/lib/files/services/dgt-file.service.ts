import { Observable } from 'rxjs';
import { DGTFileType } from '../models/dgt-file-type.model';
import { DGTFile } from '../models/dgt-file.model';

export abstract class DGTFileService {
    public abstract uploadFile(type: DGTFileType, name: string, file: DGTFile)
        : Observable<{ totalBytes: number, bytesTransferred: number, type: DGTFileType, name: string }>;
    public abstract downloadFileURI(type: DGTFileType, name: string): Observable<string>;
}
