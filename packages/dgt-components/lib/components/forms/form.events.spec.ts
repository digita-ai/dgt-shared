import { FormUpdatedEvent, FormSubmittedEvent, FormValidatedEvent } from './form.events';
import { FormValidatorResult } from './form-validator-result';

describe('FormUpdatedEvent', () => {

  it('should initialize correctly', () => {

    const event = new FormUpdatedEvent('field', 'value');

    expect(event).toBeTruthy();

  });

});

describe('FormSubmittedEvent', () => {

  it('should initialize correctly', () => {

    const event = new FormSubmittedEvent();

    expect(event).toBeTruthy();

  });

});

describe('FormValidatedEvent', () => {

  it('should initialize correctly', () => {

    const results: FormValidatorResult[] = [
      { field: 'field1', message: 'msg1' },
      { field: 'field2', message: 'msg2' },
    ];

    const event = new FormValidatedEvent(results);

    expect(event).toBeTruthy();

  });

});
