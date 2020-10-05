import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { DGTMap } from '@digita/dgt-shared-utils';
import { DGTSourceConnector } from '../../source/models/dgt-source-connector.model';
import { DGTSourceType } from '../../source/models/dgt-source-type.model';

@Injectable()
export class DGTConnectorService {

  private connectors: DGTMap<DGTSourceType, DGTSourceConnector<any, any>>;

  constructor() { }

  public register(sourceType: DGTSourceType, connector: DGTSourceConnector<any, any>) {
    if (!this.connectors) {
      this.connectors = new DGTMap<DGTSourceType, DGTSourceConnector<any, any>>();
    }

    this.connectors.set(sourceType, connector);
  }

  public get(sourceType: DGTSourceType) {
    return this.connectors.get(sourceType);
  }
}
