import { async } from '@angular/core/testing';
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import { configuration } from '../../../test.configuration';
import { DGTLDResource } from '../models/dgt-ld-resource.model';
import { DGTLDTriple } from '../models/dgt-ld-triple.model';
import { DGTLDUtils } from './dgt-ld-utils.service';

describe('DGTLDUtilsService', () => {
  const tripleA: DGTLDTriple = { predicate: 'a', object: null, subject: null };
  const tripleB: DGTLDTriple = { predicate: 'b', object: null, subject: null };
  const tripleC: DGTLDTriple = { predicate: 'c', object: null, subject: null };
  const triples: DGTLDTriple[] = [tripleA, tripleB, tripleC];
  const predicatesAC: string[] = [ 'a', 'c' ];
  const predicatesD: string[] = [ 'd' ];

  const resource: DGTLDResource = { uri: '', exchange: null, triples };
  const resourceTriplesNull: DGTLDResource = { uri: '', exchange: null, triples: null };

  const testService = new DGTTestRunnerService<DGTLDUtils>(configuration);
  testService.setup(DGTLDUtils);

  it('should be correctly instantiated', async(() => {
    expect(testService.service).toBeTruthy();
  }));

  describe('filterResourceByPredicates', () => {
    it('should error when resource is null', async(() => {
      expect(() => {
        testService.service.filterResourceByPredicates(null, [])
      }).toThrowError(DGTErrorArgument);
    }));
    it('should error when resource.triples is null', async(() => {
      expect(() => {
        testService.service.filterResourceByPredicates(resourceTriplesNull, [])
      }).toThrowError(DGTErrorArgument);
    }));
    it('should error when predicates is null', async(() => {
      expect(() => {
        testService.service.filterResourceByPredicates(resource, null)
      }).toThrowError(DGTErrorArgument);
    }));
    it('should filter correctly AC', async(() => {
      expect(testService.service.filterResourceByPredicates(resource, predicatesAC)).toEqual({...resource, triples: [tripleA, tripleC]})
    }));
    it('should filter correctly D', async(() => {
      expect(testService.service.filterResourceByPredicates(resource, predicatesD)).toEqual({...resource, triples: []})
    }));
  });

  describe('filterTriplesByPredicates', () => {
    it('should error when triples is null', async(() => {
      expect(() => {
        testService.service.filterTriplesByPredicates(null, [])
      }).toThrowError(DGTErrorArgument);
    }));
    it('should error when predicates is null', async(() => {
      expect(() => {
        testService.service.filterTriplesByPredicates([], null)
      }).toThrowError(DGTErrorArgument);
    }));
    it('should filter correctly AC', async(() => {
      expect(testService.service.filterTriplesByPredicates(triples, predicatesAC)).toEqual([tripleA, tripleC])
    }));
    it('should filter correctly D', async(() => {
      expect(testService.service.filterTriplesByPredicates(triples, predicatesD)).toEqual([])
    }));
  });
});
