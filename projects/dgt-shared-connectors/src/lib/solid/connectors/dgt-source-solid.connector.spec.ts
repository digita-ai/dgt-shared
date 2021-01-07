/* tslint:disable:no-unused-variable */

<<<<<<< HEAD
=======
import { async } from '@angular/core/testing';
import { DGTConnectionSolid, DGTExchange, DGTLDTermType, DGTLDTriple, DGTSourceSolid } from '@digita-ai/dgt-shared-data';
>>>>>>> develop
import { DGTTestRunnerService } from '@digita-ai/dgt-shared-test';
import { DGTError, DGTErrorArgument } from '@digita-ai/dgt-shared-utils';
import * as _ from 'lodash';
<<<<<<< HEAD
import * as _ from 'lodash';
import { configuration } from '../../../test.configuration';
import { DGTSourceSolidConnector } from './dgt-source-solid.connector';
=======
>>>>>>> develop

describe('DGTSourceSolidConnector', () => {
    const testService = new DGTTestRunnerService<DGTSourceSolidConnector>(configuration);
    testService.setup(DGTSourceSolidConnector);

<<<<<<< HEAD
    it('should be correctly instantiated', (() => {
        expect(testService.service).toBeTruthy();
    }));
=======
    describe('query', () => {
        it('should throw error when arguments are incorrect', (() => {
            expect(() => {
                testService.service.query(null, null, null, null, null, null);
            }).toThrowError(DGTErrorArgument);

            expect(() => {
                testService.service.query('bla', null, null, null, null, null);
            }).toThrowError(DGTErrorArgument);

            expect(() => {
                testService.service.query('bla', {
                    uri: null,
                    icon: null,
                    description: null,
                    fields: null,
                }, null, null, null, null);
            }).toThrowError(DGTError);
        }));
    });

    describe('convert', () => {
        it('should convert simple turtle', async(() => {
            const response = `@prefix : <#>.
        @prefix dgt-events: <http://digita.ai/voc/events#>.
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

       :me dgt-events:event :1.`;
            const webId = 'https://john.my.id/';
            const exchange: DGTExchange = {
                uri: 'e-1',
                exchange: null,
                triples: null,
                purpose: null,
                holder: null,
                source: 's-1',
                connection: 'c-1',
            };
            const source: DGTSourceSolid = {
                uri: 's-1',
                exchange: null,
                triples: null,
                icon: null,
                description: null,
                type: null,
                configuration: null,
            };
            const connection: DGTConnectionSolid = {
                uri: 'c-1',
                exchange: null,
                triples: null,
                configuration: null,
                state: null,
                source: 's-1',
            };

            const expectedResult: DGTLDTriple[] = [
                {
                    exchange: 'e-1',
                    predicate: 'http://digita.ai/voc/events#event',
                    subject: {
                        termType: DGTLDTermType.REFERENCE,
                        value: 'https://john.my.id/',
                    },
                    object: {
                        termType: DGTLDTermType.REFERENCE,
                        value: 'https://john.my.id/#1',
                    },
                    originalValue: {
                        termType: DGTLDTermType.REFERENCE,
                        value: 'https://john.my.id/#1',
                    },
                    source: 's-1',
                    connection: 'c-1',
                },
            ];

            const result = testService.service.convert(response, webId, exchange, source, connection);
            delete result[0].id;

            // expect(_.isEqual(result, expectedResult)).toBeTruthy();
            expect(result).toEqual(expectedResult);
        }));
    });
>>>>>>> develop
});
