import {
  normalizeInteractions,
  normalizeDeactivateOn,
  warnIfManyNonDelegated,
  _resetWarnings,
} from '../validation.js';
import { NON_DELEGATED_WARN_LIMIT } from '../constants.js';

describe('useKFloatingInteraction validation', () => {
  describe('normalizeInteractions', () => {
    it.each([undefined, null, false])('normalizes %p to no interactions', value => {
      expect(normalizeInteractions(value)).toEqual({});
    });

    it('fills in defaults for an array of names', () => {
      expect(normalizeInteractions(['hover', 'click', 'touch', 'focus'])).toEqual({
        hover: { activateDelay: 300, deactivateDelay: 250 },
        click: { deactivateOnOutside: true, toggle: true },
        touch: { deactivateOnOutside: true, toggle: true },
        focus: { keyboardOnly: false, activateDelay: 300, deactivateDelay: 250 },
      });
    });

    it.each([true, undefined, null])('treats an option value of %p as defaults', value => {
      expect(normalizeInteractions({ click: value })).toEqual({
        click: { deactivateOnOutside: true, toggle: true },
      });
    });

    it('leaves out interactions set to false', () => {
      expect(normalizeInteractions({ hover: false, click: true })).toEqual({
        click: { deactivateOnOutside: true, toggle: true },
      });
    });

    it('merges given options over defaults', () => {
      expect(normalizeInteractions({ focus: { keyboardOnly: true, activateDelay: 0 } })).toEqual({
        focus: { keyboardOnly: true, activateDelay: 0, deactivateDelay: 250 },
      });
    });

    it.each([
      ['a string', 'hover', `'interactions' needs to be an array`],
      ['a number', 1, `'interactions' needs to be an array`],
      ['an unsupported name in an array', ['drag'], `unsupported interaction 'drag'`],
      ['an unsupported name in an object', { drag: true }, `unsupported interaction 'drag'`],
      ['non-object options', { hover: 'yes' }, `Options for interaction 'hover' need to be`],
      [
        'an unsupported option',
        { hover: { toggle: true } },
        `'toggle' is not a supported option for interaction 'hover'. Supported options are: activateDelay, deactivateDelay.`,
      ],
      [
        'a wrongly typed option',
        { click: { toggle: 'no' } },
        `'toggle' for interaction 'click' needs to be a boolean.`,
      ],
    ])('throws for %s', (_, interactions, message) => {
      expect(() => normalizeInteractions(interactions)).toThrow(message);
    });
  });

  describe('normalizeDeactivateOn', () => {
    it.each([undefined, null])('normalizes %p to defaults', value => {
      expect(normalizeDeactivateOn(value)).toEqual({ esc: true, scroll: false });
    });

    it('merges given keys over defaults', () => {
      expect(normalizeDeactivateOn({ scroll: true })).toEqual({ esc: true, scroll: true });
    });

    it.each([
      ['true', true, `'deactivateOn' needs to be an object.`],
      ['false', false, `'deactivateOn' needs to be an object.`],
      ['an array', ['esc'], `'deactivateOn' needs to be an object.`],
      [
        'an unsupported key',
        { click: true },
        `'deactivateOn' contains unsupported key(s): click. Supported keys are: esc, scroll`,
      ],
      ['a wrongly typed key', { esc: 'yes' }, `'deactivateOn.esc' needs to be a boolean.`],
    ])('throws for %s', (_, deactivateOn, message) => {
      expect(() => normalizeDeactivateOn(deactivateOn)).toThrow(message);
    });
  });

  describe('warnIfManyNonDelegated', () => {
    const nodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      jest.restoreAllMocks();
      process.env.NODE_ENV = nodeEnv;
      _resetWarnings();
    });

    it('warns once in development when over the limit', () => {
      process.env.NODE_ENV = 'development';
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      warnIfManyNonDelegated(NON_DELEGATED_WARN_LIMIT);
      expect(warn).not.toHaveBeenCalled();

      warnIfManyNonDelegated(NON_DELEGATED_WARN_LIMIT + 1);
      warnIfManyNonDelegated(NON_DELEGATED_WARN_LIMIT + 2);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it.each(['production', 'test'])('does not warn when NODE_ENV is %s', env => {
      process.env.NODE_ENV = env;
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      warnIfManyNonDelegated(NON_DELEGATED_WARN_LIMIT + 1);
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
