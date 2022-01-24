import { addProtocolPrefix } from './add-protocol-prefix';

describe('addProtocolPrefix()', () => {

  it('should return uri with https when https is working', async () => {

    const uri = 'example.com';
    const response = addProtocolPrefix(uri);
    await expect(response).resolves.toBe('https://' + uri);

  });

  it('should return uri with http when https is not working', async () => {

    const uri = 'info.cern.ch';
    const response = addProtocolPrefix(uri);
    await expect(response).resolves.toBe('http://' + uri);

  });

  it('should throw when uri cannot be fetched', async () => {

    const uri = 'unknownuri.org';
    const response = addProtocolPrefix(uri);
    await expect(response).rejects.toThrowError(`Could not add protocol prefix to ${uri}`);

  });

});

