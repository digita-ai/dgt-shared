import * as path from 'path';
import { ComponentsManager } from 'componentsjs';
import { DGTLoggerLevel } from '../models/dgt-logger-level.model';
import { DGTLoggerWinstonService } from './dgt-logger-winston.service';

describe('DGTLoggerWinstonService', () => {

  let service: DGTLoggerWinstonService;
  let manager: ComponentsManager<any>;

  beforeAll(async () => {

    const mainModulePath = path.join(__dirname, '../../../');
    const configPath = path.join(mainModulePath, 'config/config-test.json');
    manager = await ComponentsManager.build({ mainModulePath });
    await manager.configRegistry.register(configPath);

  });

  beforeEach(async () => {

    service = await manager.instantiate('urn:dgt-utils:test:DGTLoggerWinstonService');

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('log', () => {

    it('should call logger.log', () => {

      const consoleSpy = jest.spyOn<any, string>((service as any).logger, 'log');
      service.log(DGTLoggerLevel.info, 'TestService', 'test message', 'test data');

      expect(consoleSpy).toHaveBeenCalledWith(expect.objectContaining(
        {
          data: 'test data',
          message: 'test message',
          typeName: 'TestService',
          level: DGTLoggerLevel[DGTLoggerLevel.info],
          printData: true,
        },
      ));

    });

    it('should not log when level > minimumLevel', async () => {

      service = await manager.instantiate('urn:dgt-utils:test:DGTLoggerWinstonServiceInfoLevel');
      const consoleSpy = jest.spyOn<any, string>((service as any).logger, 'log');
      service.log(DGTLoggerLevel.debug, 'TestService', 'test message', 'test data');
      expect(consoleSpy).not.toHaveBeenCalled();

    });

    it('should not log data when level > minimumLevelPrintData', async () => {

      service = await manager.instantiate('urn:dgt-utils:test:DGTLoggerWinstonServiceDebugLevel');
      const consoleSpy = jest.spyOn<any, string>((service as any).logger, 'log');
      service.log(DGTLoggerLevel.silly, 'TestService', 'test message', 'test data');
      expect(consoleSpy).toHaveBeenCalledWith(expect.objectContaining({ printData: false }));

    });

    // test arguments for null or undefined
    const params = {
      level: DGTLoggerLevel.info,
      typeName: ' TestService',
      message: 'test message',
    };

    const args = Object.keys(params);

    args.forEach((argument) => {

      it(`should throw error when ${argument} is null or undefined`, () => {

        const testArgs = args.map((arg) => arg === argument ? null : arg);

        expect(() => service.log.apply(service.log, testArgs))
          .toThrow(`Argument ${argument} should be set`);

      });

    });

  });

  describe('level logs', () => {

    const levels = [ 'info', 'debug', 'warn', 'error' ];

    for (const level of levels) {

      if (level) {

        it(`should log a ${level} message`, () => {

          const loggerSpy = jest.spyOn(service, 'log');

          if (level === 'error') {

            service[level]('TestService', 'test message', 'test error', 'error');
            expect(loggerSpy).toHaveBeenCalledWith(DGTLoggerLevel.error, 'TestService', 'test message', { error: 'test error', caught: 'error' });

          } else {

            service[level]('TestService', 'test message', 'test data');
            expect(loggerSpy).toHaveBeenCalledWith(DGTLoggerLevel[level], 'TestService', 'test message', 'test data');

          }

        });

        // test arguments for null or undefined
        const params = {
          level: DGTLoggerLevel.info,
          typeName: ' TestService',
          message: 'test message',
        };

        const args = Object.keys(params);

        args.forEach((argument) => {

          it(`should throw error when ${argument} is null or undefined`, () => {

            const testArgs = args.map((arg) => arg === argument ? null : arg);

            expect(() => service.log.apply(service[level], testArgs))
              .toThrow(`Argument ${argument} should be set`);

          });

        });

      }

    }

  });

  describe('formatLog', () => {

    it('should not include data when printData is false', () => {

      const mockInfo = {
        level: 0,
        message: 'test message',
        timestamp: '0000-00-00:00:00.000Z',
        typeName: 'TestService',
        data: 'test data',
        printData: false,
      };

      expect((service as any).formatLog(mockInfo).includes(mockInfo.data))
        .toBe(false);

    });

    it('should include data when log level > minimumLevelPrintData', () => {

      const mockInfo = {
        level: 6,
        message: 'test message',
        timestamp: '0000-00-00:00:00.000Z',
        typeName: 'TestService',
        data: 'test data',
        printData: true,
      };

      expect((service as any).formatLog(mockInfo).includes(mockInfo.data))
        .toBe(true);

    });

  });

});
