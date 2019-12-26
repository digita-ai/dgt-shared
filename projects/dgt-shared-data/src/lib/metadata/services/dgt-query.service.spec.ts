/* tslint:disable:no-unused-variable */

import { async } from '@angular/core/testing';
import { DGTQueryService } from './dgt-query.service';
import { DGTTestRunnerService } from '@digita/dgt-shared-test';
import { configuration } from '../../../test.configuration';
import { DGTQuery } from '../models/dgt-query.model';

describe('DGTQueryService', () => {
    const testService = new DGTTestRunnerService<DGTQueryService>(configuration);
    testService.setup(DGTQueryService);

    it('should execute with a single condition on a single string field', async(() => {
        const entities: { field1: string }[] = [
            { field1: 'hello' },
            { field1: 'hello' },
            { field1: null },
            { field1: 'hello1' }
        ];
        const query: DGTQuery = {
            conditions: [
                {
                    field: 'field1',
                    operator: '==',
                    value: 'hello'
                }
            ]
        };

        const result = testService.service.execute<{ field1: string }[]>(entities, query);

        expect(result.length).toEqual(2);
    }));

    it('should execute with a single condition on a single number field', async(() => {
        const entities: { field1: number }[] = [
            { field1: 5 },
            { field1: 5 },
            { field1: null },
            { field1: 7 }
        ];
        const query: DGTQuery = {
            conditions: [
                {
                    field: 'field1',
                    operator: '==',
                    value: 5
                }
            ]
        };

        const result = testService.service.execute<{ field1: number }[]>(entities, query);

        expect(result.length).toEqual(2);
    }));

    it('should execute with a single condition on a single nested field', async(() => {
        const entities: { field1: { field2: string } }[] = [
            { field1: { field2: 'hello' } },
            { field1: { field2: 'hello' } },
            { field1: null },
            { field1: { field2: 'hello1' } }
        ];
        const query: DGTQuery = {
            conditions: [
                {
                    field: 'field1.field2',
                    operator: '==',
                    value: 'hello'
                }
            ]
        };

        const result = testService.service.execute<{ field1: { field2: string } }[]>(entities, query);

        expect(result.length).toEqual(2);
    }));

    it('should execute with multiple conditions on multiple string fields', async(() => {
        const entities: { field1: string, field2: string }[] = [
            { field1: 'hello', field2: 'world' },
            { field1: 'hello', field2: 'world1' },
            { field1: null, field2: 'world' },
            { field1: 'hello1', field2: 'world' }
        ];
        const query: DGTQuery = {
            conditions: [
                {
                    field: 'field1',
                    operator: '==',
                    value: 'hello'
                },
                {
                    field: 'field2',
                    operator: '==',
                    value: 'world'
                }
            ]
        };

        const result = testService.service.execute<{ field1: string, field2: string }[]>(entities, query);

        expect(result.length).toEqual(1);
    }));
});
