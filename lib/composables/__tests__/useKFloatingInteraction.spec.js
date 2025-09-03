import { nextTick } from 'vue';
import { render } from '@testing-library/vue';
import VueRouter from 'vue-router';
import useKFloatingInteraction, {
  _floatingInteractions,
  _floatingCache,
  _delegateUsage,
} from '../useKFloatingInteraction';

const FLOATING_PARAMS = {
  'floating-1': { activateOn: ['focus'], delegateTo: 'delegate-1' },
  'floating-2': { activateOn: ['focus', 'touch'], delegateTo: 'delegate-1' },
  'floating-3': { activateOn: ['hover'], delegateTo: 'delegate-2' },
  'floating-4': {},
  'floating-5': { activateOn: ['keyboardfocus', 'hover'] },
  'floating-6': { activateOn: ['touch'], delegateTo: 'root' },
};
const components = {};

/*
  Prepare test DOM:

  <div id="delegate-1">
    <span id="trigger-1" data-floating-id="floating-1">Trigger 1</span>
    <span id="floating-1">Floating 1</span>
    <span id="trigger-2" data-floating-id="floating-2">Trigger 2</span>
    <span id="floating-2">Floating 2</span>
  </div>

  <div id="delegate-2">
    <span id="trigger-3" data-floating-id="floating-3">Trigger 3</span>
    <span id="floating-3">Floating 3</span>
  </div>

  <!-- won't delegate -->
  <span id="trigger-4" data-floating-id="floating-4">Trigger 4</span>
  <span id="floating-4">Floating 4</span>
  <span id="trigger-5" data-floating-id="floating-5">Trigger 4</span>
  <span id="floating-5">Floating 5</span>

  <!-- will delegate to root -->
  <span id="trigger-6" data-floating-id="floating-6">Trigger 5</span>
  <span id="floating-6">Floating 6</span>
*/
function setupDOM(document) {
  const delegate1 = createDelegate('delegate-1');
  const trigger1 = createTrigger('trigger-1', 'floating-1', 'Trigger 1');
  delegate1.appendChild(trigger1);
  const floating1 = createFloating('floating-1', 'Floating 1');
  delegate1.appendChild(floating1);
  const trigger2 = createTrigger('trigger-2', 'floating-2', 'Trigger 2');
  delegate1.appendChild(trigger2);
  const floating2 = createFloating('floating-2', 'Floating 2');
  delegate1.appendChild(floating2);

  const delegate2 = createDelegate('delegate-2');
  const trigger3 = createTrigger('trigger-3', 'floating-3', 'Trigger 3');
  delegate2.appendChild(trigger3);
  const floating3 = createFloating('floating-3', 'Floating 3');
  delegate2.appendChild(floating3);

  const trigger4 = createTrigger('trigger-4', 'floating-4', 'Trigger 4');
  document.body.appendChild(trigger4);
  const floating4 = createFloating('floating-4', 'Floating 4');
  document.body.appendChild(floating4);

  const trigger5 = createTrigger('trigger-5', 'floating-5', 'Trigger 5');
  document.body.appendChild(trigger5);
  const floating5 = createFloating('floating-5', 'Floating 5');
  document.body.appendChild(floating5);

  const trigger6 = createTrigger('trigger-6', 'floating-6', 'Trigger 6');
  document.body.appendChild(trigger6);
  const floating6 = createFloating('floating-6', 'Floating 6');
  document.body.appendChild(floating6);

  return {
    delegates: {
      1: delegate1,
      2: delegate2,
    },
    triggers: {
      1: trigger1,
      2: trigger2,
      3: trigger3,
      4: trigger4,
      5: trigger5,
      6: trigger6,
    },
    floatings: {
      1: floating1,
      2: floating2,
      3: floating3,
      4: floating4,
      5: floating5,
      6: floating6,
    },
  };
}

function createTrigger(id, floatingId, text) {
  const trigger = document.createElement('span');
  trigger.id = id;
  trigger.setAttribute('data-floating-id', floatingId);
  trigger.textContent = text;
  return trigger;
}

function createFloating(id, text) {
  const floating = document.createElement('span');
  floating.id = id;
  floating.textContent = text;
  return floating;
}

function createDelegate(delegateId) {
  const delegate = document.createElement('div');
  delegate.id = delegateId;
  document.body.appendChild(delegate);
  return delegate;
}

function mountFloating(floatingEl) {
  const floatingId = floatingEl.id;
  const params = FLOATING_PARAMS[floatingId];

  const el = document.getElementById(floatingId);
  const TestComponent = {
    setup() {
      useKFloatingInteraction(floatingId, params.activateOn, params.delegateTo);
    },
  };
  const instance = render(TestComponent, {
    container: el,
    routes: new VueRouter(),
  });
  if (!components[floatingId]) {
    components[floatingId] = instance;
  }
  return instance;
}

function unmountFloating(floatingEl) {
  const floatingId = floatingEl.id;
  if (components[floatingId]) {
    components[floatingId].unmount();
    delete components[floatingId];
  }
}

function mountAllFloatings(dom) {
  for (const el of Object.values(dom.floatings)) {
    mountFloating(el);
  }
}

function unmountAllFloatings(dom) {
  for (const el of Object.values(dom.floatings)) {
    unmountFloating(el);
  }
}

describe('useKFloatingInteraction', () => {
  let dom;

  beforeAll(() => {
    dom = setupDOM(document);
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
    jest.spyOn(document, 'addEventListener');
    jest.spyOn(document, 'removeEventListener');
    Object.values(dom).forEach(group => {
      Object.values(group).forEach(el => {
        jest.spyOn(el, 'addEventListener');
        jest.spyOn(el, 'removeEventListener');
      });
    });
  });

  afterEach(() => {
    unmountAllFloatings(dom);

    for (const key in _delegateUsage) {
      delete _delegateUsage[key];
    }
    for (const key in _floatingInteractions) {
      delete _floatingInteractions[key];
    }
    for (const key in _floatingCache) {
      delete _floatingCache[key];
    }

    window.addEventListener.mockClear();
    window.removeEventListener.mockClear();
    document.addEventListener.mockClear();
    document.removeEventListener.mockClear();
    Object.values(dom).forEach(group => {
      Object.values(group).forEach(el => {
        el.addEventListener.mockClear();
        el.removeEventListener.mockClear();
      });
    });
  });

  afterAll(() => {
    document.body.innerHTML = '';
    window.addEventListener.mockRestore();
    window.removeEventListener.mockRestore();
    document.addEventListener.mockRestore();
    document.removeEventListener.mockRestore();
    Object.values(dom).forEach(group => {
      Object.values(group).forEach(el => {
        el.addEventListener.mockRestore();
        el.removeEventListener.mockRestore();
      });
    });
  });

  it(`updates '_floatingInteractions'`, async () => {
    mountAllFloatings(dom);
    await nextTick();

    expect(Object.keys(_floatingInteractions).length).toBe(6);
    expect(_floatingInteractions).toEqual({
      'floating-1': {
        activateOn: ['focus'],
      },
      'floating-2': {
        activateOn: ['focus', 'touch'],
      },
      'floating-3': {
        activateOn: ['hover'],
      },
      'floating-4': {
        activateOn: ['hover'], // default
      },
      'floating-5': {
        activateOn: ['keyboardfocus', 'hover'],
      },
      'floating-6': {
        activateOn: ['touch'],
      },
    });
  });

  it(`cleans '_floatingInteractions'`, async () => {
    mountAllFloatings(dom);
    await nextTick();

    unmountFloating(dom.floatings[1]);
    await nextTick();

    expect(Object.keys(_floatingInteractions).length).toBe(5);
    expect(_floatingInteractions['floating-1']).toBeUndefined();

    unmountFloating(dom.floatings[2]);
    await nextTick();

    expect(Object.keys(_floatingInteractions).length).toBe(4);
    expect(_floatingInteractions['floating-2']).toBeUndefined();
  });

  it(`updates '_floatingCahe'`, async () => {
    mountAllFloatings(dom);
    await nextTick();

    expect(Object.keys(_floatingCache).length).toBe(5);
    expect(_floatingCache).toEqual({
      'floating-1': {
        'delegate-1': expect.any(HTMLDivElement),
      },
      'floating-2': {
        'delegate-1': expect.any(HTMLDivElement),
      },
      'floating-3': {
        'delegate-2': expect.any(HTMLDivElement),
      },
      'floating-4': {
        '[data-floating-id="floating-4"]': expect.any(HTMLSpanElement),
      },
      'floating-5': {
        '[data-floating-id="floating-5"]': expect.any(HTMLSpanElement),
      },
    });
  });

  it(`cleans '_floatingCahe'`, async () => {
    mountAllFloatings(dom);
    await nextTick();

    unmountFloating(dom.floatings[1]);
    await nextTick();

    expect(Object.keys(_floatingCache).length).toBe(4);
    expect(_floatingCache['floating-1']).toBeUndefined();

    unmountFloating(dom.floatings[2]);
    await nextTick();

    expect(Object.keys(_floatingCache).length).toBe(3);
    expect(_floatingCache['floating-2']).toBeUndefined();
  });

  it(`updates '_delegateUsage'`, async () => {
    mountAllFloatings(dom);
    await nextTick();

    expect(_delegateUsage).toEqual({
      'delegate-1': {
        focus: 2,
        touchstart: 1,
      },
      'delegate-2': {
        mouseenter: 1,
      },
      root: {
        touchstart: 1,
      },
    });
  });

  it(`cleans '_delegateUsage'`, async () => {
    mountAllFloatings(dom);
    await nextTick();

    expect(_delegateUsage['delegate-1']).toEqual({
      focus: 2,
      touchstart: 1,
    });

    unmountFloating(dom.floatings[1]);
    await nextTick();

    expect(_delegateUsage['delegate-1']).toEqual({
      focus: 1,
      touchstart: 1,
    });

    unmountFloating(dom.floatings[2]);
    await nextTick();

    expect(_delegateUsage['delegate-1']).toBeUndefined();
  });

  // TODO add case for delegating to root
  describe('when delegating events', () => {
    it(`attaches / removes event listeners on the delegate element`, async () => {
      // trigger1 events are delegated to delegate1 =>
      // check that we don't listen on the trigger element
      // but only on the delegate element
      mountFloating(dom.floatings[1]);
      await nextTick();

      expect(dom.triggers[1].addEventListener.mock.calls.length).toEqual(0);
      expect(dom.delegates[1].addEventListener.mock.calls.length).toEqual(1);
      expect(dom.delegates[1].addEventListener.mock.calls[0][0]).toEqual('focus');

      // trigger2 events are too delegated to delegate1 =>
      // - check that we don't add listeners on delegate1
      //   for event types that it already listens to ('focus')
      // - check that we add listeners on delegate1
      //   for event types that it doesn't yet listen to ('touchstart')
      dom.delegates[1].addEventListener.mockClear();
      mountFloating(dom.floatings[2]);
      await nextTick();

      expect(dom.triggers[2].addEventListener.mock.calls.length).toEqual(0);
      expect(dom.delegates[1].addEventListener.mock.calls.length).toEqual(1);
      expect(dom.delegates[1].addEventListener.mock.calls[0][0]).toEqual('touchstart');

      // check that 'focus' listener is not removed
      // from delegate1 since it is still needed for trigger2
      unmountFloating(dom.floatings[1]);
      await nextTick();

      expect(dom.delegates[1].removeEventListener.mock.calls.length).toEqual(0);

      // check that both 'focus' and 'touchstart' listeners
      // are now removed from delegate1 since it doesn't
      // have any children that need it
      dom.delegates[1].removeEventListener.mockClear();
      unmountFloating(dom.floatings[2]);
      await nextTick();

      expect(dom.delegates[1].removeEventListener.mock.calls.length).toEqual(2);
      expect(dom.delegates[1].removeEventListener.mock.calls[0][0]).toEqual('focus');
      expect(dom.delegates[1].removeEventListener.mock.calls[1][0]).toEqual('touchstart');
    });
  });

  describe('when not delegating events', () => {
    it(`attaches / removes event listeners on the trigger element`, async () => {
      mountFloating(dom.floatings[5]);
      await nextTick();

      expect(dom.triggers[5].addEventListener.mock.calls.length).toEqual(2);
      expect(dom.triggers[5].addEventListener.mock.calls[0][0]).toEqual('focus');
      expect(dom.triggers[5].addEventListener.mock.calls[1][0]).toEqual('mouseenter');

      unmountFloating(dom.floatings[5]);
      await nextTick();

      expect(dom.triggers[5].removeEventListener.mock.calls.length).toEqual(2);
      expect(dom.triggers[5].removeEventListener.mock.calls[0][0]).toEqual('focus');
      expect(dom.triggers[5].removeEventListener.mock.calls[1][0]).toEqual('mouseenter');
    });
  });
});
