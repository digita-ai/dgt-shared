import * as path from 'path';
import { ComponentsManager } from 'componentsjs';
import { DGTCryptoBrowserService } from './dgt-crypto-browser.service';

describe('DGTCryptoBrowserService', () => {

  let service: DGTCryptoBrowserService;

  beforeEach(async () => {

    const mainModulePath = path.join(__dirname, '../../../');
    const configPath = path.join(mainModulePath, 'config/config-test.json');

    const manager = await ComponentsManager.build({
      mainModulePath,
      logLevel: 'silly',
    });

    await manager.configRegistry.register(configPath);

    service = await manager.instantiate('urn:dgt-utils:test:DGTCryptoBrowserService');

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

});
