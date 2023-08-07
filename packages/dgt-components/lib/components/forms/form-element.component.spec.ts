/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentError } from '@useid/dgt-utils';
import { createMachine, interpret, Interpreter } from 'xstate';
import { define } from '../../util/define';
import { hydrate } from '../../util/hydrate';
import { FormElementComponent } from './form-element.component';
import { FormEvent, FormEvents, FormSubmittedEvent } from './form.events';
import { FormContext, formMachine, FormState, FormStateSchema, FormSubmissionStates } from './form.machine';

interface TData {
  name: string;
  uri: string;
  description: string;
}

describe('FormElementComponent', () => {

  let component: FormElementComponent<TData>;
  let machine: Interpreter<FormContext<TData>, FormStateSchema<TData>, FormEvent, FormState<TData>>;
  let input: HTMLInputElement | HTMLTextAreaElement;

  beforeEach(async () => {

    machine = interpret(
      createMachine<FormContext<TData>, FormEvent, FormState<TData>>(formMachine<TData>(
        async (context: FormContext<TData>) => [
          ... context.data && context.data.name ? [] : [ { field: 'name', message: 'demo-form.name.required' } ],
          ... context.data && context.data.uri ? [] : [ { field: 'uri', message: 'demo-form.uri.required' } ],
        ],
      ))
        .withContext({
          data: { uri: '', name: 'Test', description: 'description' },
          original: { uri: '', name: 'Test', description: 'description' },
          validation: [],
        }),
    );

    define('form-element', hydrate(FormElementComponent)(machine));
    component = window.document.createElement('form-element') as FormElementComponent<TData>;

    component.actor = machine;
    component.field = 'name';
    component.data = { uri: '', name: 'Test', description: 'description' };

    const label = window.document.createElement('label');
    label.innerHTML = 'Foo';
    label.slot = 'label';
    component.appendChild(label);

    const help = window.document.createElement('div');
    help.innerHTML = 'Bar';
    help.slot = 'help';
    component.appendChild(help);

    const icon = window.document.createElement('div');
    icon.innerHTML = 'x';
    icon.slot = 'icon';
    component.appendChild(icon);

    const action = window.document.createElement('button');
    action.innerHTML = 'go';
    action.slot = 'action';
    component.appendChild(action);

    input = window.document.createElement('input');
    input.type = 'text';
    input.slot = 'input';
    component.appendChild(input);

    jest.clearAllMocks();

    window.document.body.appendChild(component);
    await component.updateComplete;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should set default value on slotted input field', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect((component.shadowRoot.querySelector<HTMLSlotElement>('.field slot').assignedElements()[0] as HTMLInputElement).value).toBe('Test');

  });

  it.skip('should send SUBMITTED event when enter keypress', async () => {

    const prom = new Promise<void>((resolve) => {

      machine.onEvent(((event) => {

        if (event.type === FormEvents.FORM_SUBMITTED) {

          resolve();

        }

      }));

    });

    window.document.body.appendChild(component);
    await component.updateComplete;

    input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

    await expect(prom).resolves.toBeUndefined();

  });

  it.skip('should send event when updating slotted input field', async () => {

    const prom = new Promise<void>((resolve) => {

      machine.onEvent(((event) => {

        if (event.type === FormEvents.FORM_UPDATED) {

          resolve();

        }

      }));

    });

    window.document.body.appendChild(component);
    await component.updateComplete;

    // const input = window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.input slot').assignedElements()[0] as HTMLInputElement;

    input.value = 'Lorem';
    input.dispatchEvent(new Event('input'));

    await expect(prom).resolves.toBeUndefined();

  });

  it('should show validation results', async () => {

    component.validationResults = [ { field: 'name', message: 'lorem' } ];

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelectorAll<HTMLSlotElement>('.results .result')).toHaveLength(1);
    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelectorAll<HTMLSlotElement>('.help[hidden]')).toHaveLength(1);

  });

  it('should show static slotted content', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.help slot').assignedElements()).toHaveLength(1);
    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.label slot').assignedElements()).toHaveLength(1);
    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.icon slot').assignedElements()).toHaveLength(1);
    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.action slot').assignedElements()).toHaveLength(1);

  });

  it('should show loading when validating is true', async () => {

    component.showLoading = true;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon .loading')).toHaveLength(1);

  });

  it('should not show loading when validating is false', async () => {

    component.showLoading = false;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon .loading')).toHaveLength(0);

  });

  it('should show icon when not loading', async () => {

    component.showLoading = false;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon slot[name="icon"]')).toHaveLength(1);

  });

  it('should not show icon when loading', async () => {

    component.showLoading = true;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon slot[name="icon"]')).toHaveLength(0);

  });

  it.skip('should disable input when locked', async () => {

    const prom = new Promise<void>((resolve) => {

      machine.onTransition((state) => {

        if (state.matches(FormSubmissionStates.SUBMITTED)) {

          resolve();

        }

      });

    });

    window.document.body.appendChild(component);
    await component.updateComplete;
    machine.start();
    machine.send(new FormSubmittedEvent());

    await expect(prom).resolves.toBeUndefined();
    expect(input.disabled).toBe(true);

  });

  it('should enable input when not locked', async () => {

    component.lockInput = false;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(input.disabled).toBeFalsy();

  });

  describe('bindActorToInput', () => {

    const slot: HTMLSlotElement = {
      ... window.document.createElement('input') as any,
      assignedElements: jest.fn(),
      assignedNodes: jest.fn(),
    };

    const actor: Interpreter<FormContext<TData>, FormStateSchema<TData>, FormEvent, FormState<TData>> = interpret(
      createMachine<FormContext<TData>, FormEvent, FormState<TData>>(formMachine<TData>(
        async () => [],
      )),
    );

    const data = { name: '', description: '', uri: '' };

    it('should throw when slot in undefined', async() => {

      expect(() => component.bindActorToInput(
        undefined, actor, 'name', data,
      )).toThrow(ArgumentError);

    });

    it('should throw when actor in undefined', async() => {

      expect(() => component.bindActorToInput(
        slot, undefined, 'name', data,
      )).toThrow(ArgumentError);

    });

    it('should throw when field in undefined', async() => {

      expect(() => component.bindActorToInput(
        slot, actor, undefined, data,
      )).toThrow(ArgumentError);

    });

    it('should throw when data in undefined', async() => {

      expect(() => component.bindActorToInput(
        slot, actor, 'name', undefined,
      )).toThrow(ArgumentError);

    });

  });

});
