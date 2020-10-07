import { DGTFileService, DGTFileType, DGTFile } from '@digita/dgt-shared-data';
import { Observable, from } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { AngularFireStorage } from 'angularfire2/storage';


@DGTInjectable()
export class DGTVentureFileService extends DGTFileService {

    constructor(
        private logger: DGTLoggerService,
        private storage: AngularFireStorage
      ) {
        super();
      }

    public uploadFile(type: DGTFileType, name: string, file: DGTFile):
        Observable<{ totalBytes: number, bytesTransferred: number, type: DGTFileType, name: string }> {
        const path = type + name;

        this.logger.debug(DGTVentureFileService.name, 'Starting file upload to path ' + path, file);

        return from(this.storage.upload(path, file.asBlob, {
            contentType: file.type
        }))
            .pipe(
                filter(snapshot => snapshot.bytesTransferred === snapshot.totalBytes),
                map(snapshot => ({
                    totalBytes: snapshot.totalBytes,
                    bytesTransferred: snapshot.bytesTransferred,
                    type,
                    name
                }))
            );
    }

    public downloadFileURI(type: DGTFileType, name: string): Observable<string> {
        const path = type + name;

        this.logger.debug(DGTVentureFileService.name, 'Starting to retrieve download URI for path ' + path);

        return this.storage.ref(path).getDownloadURL();
    }
}
