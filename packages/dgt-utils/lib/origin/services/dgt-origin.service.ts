import { Injectable } from '@angular/core';

@Injectable()
export abstract class DGTOriginService {

  public abstract get(): string;

}
