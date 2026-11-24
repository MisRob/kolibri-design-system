import {
  scheduleChange,
  cancelPendingChange,
  cancelAnyPendingChange,
  isActivationPending,
} from '../delays.js';
import { _registry, createRegistryEntry } from '../registry.js';

const DELAY = 300;

function register(floatingId, delay = DELAY) {
  const options = { activateDelay: delay, deactivateDelay: delay };
  _registry[floatingId] = createRegistryEntry({
    interactions: { hover: options, focus: options },
  });
}

function schedule(floatingId, interaction, shouldRun = () => true) {
  const run = jest.fn();
  scheduleChange(floatingId, interaction, 'activateDelay', shouldRun, run);
  return run;
}

describe('useKFloatingInteraction delays', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    register('a');
    register('b');
  });

  afterEach(() => {
    cancelAnyPendingChange('a');
    cancelAnyPendingChange('b');
    Object.keys(_registry).forEach(id => delete _registry[id]);
    jest.useRealTimers();
  });

  it('runs right away when the delay is 0', () => {
    register('a', 0);
    const run = schedule('a', 'hover');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('runs once the delay is over', () => {
    const run = schedule('a', 'hover');

    jest.advanceTimersByTime(DELAY - 1);
    expect(run).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not run when shouldRun is false once the delay is over', () => {
    const run = schedule('a', 'hover', () => false);
    jest.advanceTimersByTime(DELAY);
    expect(run).not.toHaveBeenCalled();
  });

  it('does not run when the floating element was unregistered during the delay', () => {
    const run = schedule('a', 'hover');
    delete _registry.a;
    jest.advanceTimersByTime(DELAY);
    expect(run).not.toHaveBeenCalled();
  });

  it('rescheduling the same change restarts the wait and drops the earlier one', () => {
    const first = schedule('a', 'hover');
    jest.advanceTimersByTime(DELAY - 1);

    const second = schedule('a', 'hover');
    jest.advanceTimersByTime(DELAY - 1);
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['another floating element', 'b', 'hover'],
    ['another interaction', 'a', 'focus'],
  ])('scheduling for %s runs the pending change right away', (_, floatingId, interaction) => {
    const first = schedule('a', 'hover');
    const second = schedule(floatingId, interaction);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    jest.advanceTimersByTime(DELAY);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('a pending change run early still checks shouldRun', () => {
    const first = schedule('a', 'hover', () => false);
    schedule('b', 'hover');
    expect(first).not.toHaveBeenCalled();
  });

  it('cancelPendingChange cancels only the matching interaction', () => {
    const run = schedule('a', 'hover');

    cancelPendingChange('a', 'focus');
    cancelPendingChange('b', 'hover');
    jest.advanceTimersByTime(DELAY);
    expect(run).toHaveBeenCalledTimes(1);

    const cancelled = schedule('a', 'hover');
    cancelPendingChange('a', 'hover');
    jest.advanceTimersByTime(DELAY);
    expect(cancelled).not.toHaveBeenCalled();
  });

  it('cancelAnyPendingChange cancels any interaction of the floating element only', () => {
    const run = schedule('a', 'focus');

    cancelAnyPendingChange('b');
    jest.advanceTimersByTime(DELAY);
    expect(run).toHaveBeenCalledTimes(1);

    const cancelled = schedule('a', 'focus');
    cancelAnyPendingChange('a');
    jest.advanceTimersByTime(DELAY);
    expect(cancelled).not.toHaveBeenCalled();
  });

  it('isActivationPending is true only while an inactive interaction waits to activate', () => {
    expect(isActivationPending('a', 'hover')).toBe(false);

    schedule('a', 'hover');
    expect(isActivationPending('a', 'hover')).toBe(true);
    expect(isActivationPending('a', 'focus')).toBe(false);
    expect(isActivationPending('b', 'hover')).toBe(false);

    _registry.a.activeInteractions.value = ['hover'];
    expect(isActivationPending('a', 'hover')).toBe(false);

    _registry.a.activeInteractions.value = [];
    jest.advanceTimersByTime(DELAY);
    expect(isActivationPending('a', 'hover')).toBe(false);
  });
});
