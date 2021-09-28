import * as path from 'path';
import { ComponentsManager } from 'componentsjs';
import { DGTLoggerLevel } from '../models/dgt-logger-level.model';
import { DGTLoggerConsoleService } from './dgt-logger-console.service';

describe('DGTLoggerConsoleService', () => {

  let service: DGTLoggerConsoleService;
  let manager: ComponentsManager<any>;

  beforeAll(async () => {

    const mainModulePath = path.join(__dirname, '../../../');
    const configPath = path.join(mainModulePath, 'config/config-test.json');
    manager = await ComponentsManager.build({ mainModulePath });
    await manager.configRegistry.register(configPath);

  });

  beforeEach(async () => {

    service = await manager.instantiate('urn:dgt-utils:test:DGTLoggerConsoleService');

  });

  afterEach(() => {

    // clear spies
    jest.clearAllMocks();

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  // describe('log', () => {

  //   const levels = [ 'info', 'debug', 'warn', 'error' ];

  //   it('DGTLoggerLevel.silly should call console.log', () => {
  //     const consoleSpy = jest.spyOn(console, 'log');
  //     service.log(DGTLoggerLevel.silly, 'TestService', 'test message', 'data');
  //     expect(consoleSpy).toHaveBeenCalled();
  //   });

  //   for (const level of levels) {
  //     if (level) {
  //       it(`DGTLoggerLevel.${level} should call console.${level}`, () => {
  //         const consoleSpy = jest.spyOn(console, level as any);
  //         service.log(DGTLoggerLevel[level], 'TestService', 'test message', 'data');
  //         expect(consoleSpy).toHaveBeenCalled();
  //       });
  //     }
  //   }

  //   const params = {
  //     level: DGTLoggerLevel.info,
  //     typeName: ' TestService',
  //     message: 'test message',
  //   };
  //   const args = Object.keys(params);
  //   args.forEach((argument) => {
  //     it(`should throw error when ${argument} is null or undefined`, () => {
  //       const testArgs = args.map((arg) => arg === argument ? null : arg);
  //       expect(() => service.log.apply(service.log, testArgs))
  //         .toThrow(`Argument ${argument} should be set`);
  //     });
  //   });
  // });

  // describe('level logs', () => {

  //   const levels = [ 'info', 'debug', 'warn', 'error' ];

  //   for (const level of levels) {
  //     if (level) {
  //       it(`should log a ${level} message`, () => {
  //         const loggerSpy = jest.spyOn(service, 'log');
  //         if (level === 'error') {
  //           service[level]('TestService', 'test message', 'test error', 'error');
  //           expect(loggerSpy).toHaveBeenCalledWith(DGTLoggerLevel.error, 'TestService', 'test message', { error: 'test error', caught: 'error' });
  //         } else {
  //           service[level]('TestService', 'test message', 'test data');
  //           expect(loggerSpy).toHaveBeenCalledWith(DGTLoggerLevel[level], 'TestService', 'test message', 'test data');
  //         }
  //       });

  //       // test arguments for null or undefined
  //       const params = {
  //         level: DGTLoggerLevel.info,
  //         typeName: ' TestService',
  //       };
  //       const args = Object.keys(params);
  //       args.forEach((argument) => {
  //         it(`should throw error when ${argument} is null or undefined`, () => {
  //           const testArgs = args.map((arg: string) => arg === argument ? null : arg);
  //           expect(() => service.log.apply(service[level], testArgs))
  //             .toThrow(`Argument ${argument} should be set`);
  //         });
  //       });
  //     }
  //   }
  // });

});
