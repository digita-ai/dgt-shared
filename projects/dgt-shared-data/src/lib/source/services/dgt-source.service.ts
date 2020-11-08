import { DGTSource } from '../models/dgt-source.model';
import { Observable } from 'rxjs';
import { DGTErrorArgument, DGTInjectable, DGTLoggerService } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
import { DGTLDResourceService } from '../../linked-data/services/dgt-ld-resource.service';
import { DGTLDFilter } from '../../linked-data/models/dgt-ld-filter.model';

@DGTInjectable()
export abstract class DGTSourceService implements DGTLDResourceService<DGTSource<any>> {

  constructor(
    protected logger: DGTLoggerService,
  ) { }

  public abstract get(id: string): Observable<DGTSource<any>>;
  public abstract query(filter?: DGTLDFilter): Observable<DGTSource<any>[]>;
  public abstract save(resource: DGTSource<any>): Observable<DGTSource<any>>;
  public abstract delete(resource: DGTSource<any>): Observable<DGTSource<any>>;

  /**
   * Returns a list of sources matching query
   * @param query string to match
   * @param sources sources to filter
   */
  public filterSources(query: string, sources: DGTSource<any>[]): DGTSource<any>[] {
    return sources.filter((source: DGTSource<any>) => {
      const issuer: string = source.configuration.issuer.toLowerCase();
      const desc: string = source.description.toLowerCase();
      return issuer.includes(query)
        || desc.includes(query)
        || query.includes(issuer.split('//')[1]);
      // "https://dirk.solid.community/profile/card#me"
      // should not show an external source because solid.community is known
    });
  }

  /**
   * Checks if a given uri has a solid server running
   * @param query uri to check
   */
  public isExternalSource(query: string): Observable<{ success: boolean, uri: string }> {
    const uri = this.parseUri(query);
    throw new DGTErrorArgument('not implemented', 'isExternalSource');
  }

  /**
   * Parses a uri
   */
  public parseUri(uri: string): string {
    // Add http prefix if necessary
    if (!/^https?:\/\//.test(uri)) {
      uri = 'https://'.concat(uri);
    }
    try {
      return new URL(uri).origin;
    } catch (err) {
      this.logger.debug(DGTSourceService.name, 'URL is not valid', uri);
      return null;
    }
  }
}
