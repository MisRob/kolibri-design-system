import { ref, nextTick } from 'vue';
import { render, screen, cleanup } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import VueRouter from 'vue-router';
import globalThemeState from '../../../styles/globalThemeState';
import useKFloatingInteraction, {
  _registry,
  _active,
  _nonDelegated,
  _delegateUsage,
} from '../index.js';

const FLOATING_ID = 'floating-1';
const ACTIVATOR_ID = 'activator-1';

/*
  Test DOM:

  <button id="activator-1" data-floating-id="floating-1">Activator</button>  <- 'createActivator'
  <span id="floating-1">                                                     <- 'FloatingElement'
    Floating content, rendered only while active
  </span>

  The activator element is created directly, as it belongs to whatever renders it
  rather than to the floating element. The floating element is rendered by a
  component, as a component is what calls the composable.
*/

// Stands in for a component representing a floating element: renders it with the
// required 'id', hands the composable a ref to it, and shows what it returns —
// content only while active, anchored to the activator element it reports.
const FloatingElement = {
  props: {
    floatingId: { type: String, required: true },
    activateOn: { type: Array, default: undefined },
    delegate: { type: Boolean, default: false },
  },
  setup(props) {
    const floatingRef = ref(null);
    const { isActive, activatorEl } = useKFloatingInteraction(props.floatingId, floatingRef, {
      activateOn: props.activateOn,
      delegate: props.delegate,
    });
    return { floatingRef, isActive, activatorEl };
  },
  template: `
    <span :id="floatingId" ref="floatingRef" data-testid="floating">
      <template v-if="isActive">
        <button data-testid="floating-content">Floating content</button>
        <span data-testid="anchored-to">{{ activatorEl.id }}</span>
      </template>
    </span>
  `,
};

// Lets a test replace the floating element with another one of the same floating
// ID by changing 'floatingKey', or take it away with 'show'
const Harness = {
  components: { FloatingElement },
  props: {
    floatingId: { type: String, default: FLOATING_ID },
    floatingKey: { type: [String, Number], default: 'a' },
    activateOn: { type: Array, default: undefined },
    delegate: { type: Boolean, default: false },
    show: { type: Boolean, default: true },
  },
  template: `
    <FloatingElement
      v-if="show"
      :key="floatingKey"
      :floating-id="floatingId"
      :activate-on="activateOn"
      :delegate="delegate"
    />
  `,
};

function createActivator(floatingId = FLOATING_ID, id = ACTIVATOR_ID) {
  const activator = document.createElement('button');
  activator.id = id;
  activator.setAttribute('data-floating-id', floatingId);
  activator.setAttribute('data-testid', id);
  activator.textContent = 'Activator';
  document.body.appendChild(activator);
  return activator;
}

async function renderFloatingElement(props = {}) {
  const utils = render(Harness, { props, routes: new VueRouter() });
  // Activation listeners are attached on the tick after mount
  await nextTick();
  return utils;
}

function isFloatingActive() {
  return screen.queryByTestId('floating-content') !== null;
}

// 'onFocusActivate' waits a frame on the input modality before deciding
function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

// The activators observer reports in a microtask, so anything it deactivates or
// attaches has happened by the time a task after it runs
async function flushObserver() {
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
}

describe('useKFloatingInteraction', () => {
  afterEach(async () => {
    // Unmounting is what makes the composable let go of everything, so it has to
    // happen before the state is reset
    cleanup();
    await nextTick();

    Object.keys(_registry).forEach(id => delete _registry[id]);
    Object.keys(_delegateUsage).forEach(eventType => delete _delegateUsage[eventType]);
    _active.clear();
    _nonDelegated.clear();

    document.body.innerHTML = '';
    globalThemeState.inputModality = null;
  });

  describe('validation', () => {
    it(`throws without a 'floatingId'`, () => {
      expect(() => useKFloatingInteraction(undefined, ref(null))).toThrow(
        `[useKFloatingInteraction] 'floatingId' is required.`,
      );
    });

    it(`throws without a 'floatingRef'`, () => {
      expect(() => useKFloatingInteraction(FLOATING_ID, undefined)).toThrow(
        `[useKFloatingInteraction] 'floatingRef' is required.`,
      );
    });

    it(`throws on an unsupported interaction`, () => {
      expect(() =>
        useKFloatingInteraction(FLOATING_ID, ref(null), { activateOn: ['nope'] }),
      ).toThrow(/'activateOn' contains unsupported interaction/);
    });
  });

  describe('hover', () => {
    it('activates the floating element while the activator element is hovered', async () => {
      createActivator();
      await renderFloatingElement();
      expect(isFloatingActive()).toBe(false);

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));

      expect(isFloatingActive()).toBe(true);
    });

    it('is the interaction it defaults to', async () => {
      createActivator();
      await renderFloatingElement({ activateOn: undefined });

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));

      expect(isFloatingActive()).toBe(true);
    });

    it('deactivates it once the pointer leaves the activator element', async () => {
      createActivator();
      await renderFloatingElement();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));
      await userEvent.unhover(screen.getByTestId(ACTIVATOR_ID));

      expect(isFloatingActive()).toBe(false);
    });

    it('stays active while the pointer is on the floating element itself', async () => {
      createActivator();
      await renderFloatingElement();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));
      await userEvent.hover(screen.getByTestId('floating-content'));

      expect(isFloatingActive()).toBe(true);
    });

    it('deactivates once the pointer leaves the floating element', async () => {
      createActivator();
      await renderFloatingElement();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));
      await userEvent.hover(screen.getByTestId('floating-content'));
      await userEvent.unhover(screen.getByTestId('floating-content'));

      expect(isFloatingActive()).toBe(false);
    });
  });

  describe('activatorEl', () => {
    it('is the activator element the floating element was activated by', async () => {
      createActivator();
      await renderFloatingElement();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));

      expect(screen.getByTestId('anchored-to')).toHaveTextContent(ACTIVATOR_ID);
    });
  });

  describe('click', () => {
    it('activates on a click and stays active until one outside', async () => {
      createActivator();
      await renderFloatingElement({ activateOn: ['click'] });

      await userEvent.click(screen.getByTestId(ACTIVATOR_ID));
      expect(isFloatingActive()).toBe(true);

      await userEvent.click(document.body);

      expect(isFloatingActive()).toBe(false);
    });

    it('stays active when the click lands inside the floating element', async () => {
      createActivator();
      await renderFloatingElement({ activateOn: ['click'] });

      await userEvent.click(screen.getByTestId(ACTIVATOR_ID));
      await userEvent.click(screen.getByTestId('floating-content'));

      expect(isFloatingActive()).toBe(true);
    });
  });

  describe('focus', () => {
    it('activates on focus and deactivates on blur', async () => {
      createActivator();
      await renderFloatingElement({ activateOn: ['focus'] });

      screen.getByTestId(ACTIVATOR_ID).focus();
      await nextFrame();
      await nextTick();
      expect(isFloatingActive()).toBe(true);

      screen.getByTestId(ACTIVATOR_ID).blur();
      await nextTick();

      expect(isFloatingActive()).toBe(false);
    });
  });

  describe('keyboardfocus', () => {
    it('activates when the input modality is the keyboard', async () => {
      createActivator();
      await renderFloatingElement({ activateOn: ['keyboardfocus'] });
      globalThemeState.inputModality = 'keyboard';

      screen.getByTestId(ACTIVATOR_ID).focus();
      await nextFrame();
      await nextTick();

      expect(isFloatingActive()).toBe(true);
    });

    it('does not activate when it is not', async () => {
      createActivator();
      await renderFloatingElement({ activateOn: ['keyboardfocus'] });
      globalThemeState.inputModality = null;

      screen.getByTestId(ACTIVATOR_ID).focus();
      await nextFrame();
      await nextTick();

      expect(isFloatingActive()).toBe(false);
    });
  });

  describe('when the activator element changes', () => {
    it('attaches to an activator element that appears only later', async () => {
      await renderFloatingElement();
      expect(document.querySelector(`[data-floating-id="${FLOATING_ID}"]`)).toBeNull();

      createActivator();
      await flushObserver();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));

      expect(isFloatingActive()).toBe(true);
    });

    it('deactivates when the activator element is removed while active', async () => {
      const activator = createActivator();
      await renderFloatingElement();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));
      expect(isFloatingActive()).toBe(true);

      // No deactivating event fires for a removed element
      activator.remove();
      await flushObserver();

      expect(isFloatingActive()).toBe(false);
    });
  });

  describe('when the floating element is replaced by one with the same floating ID', () => {
    it('stays active, as the interaction is still in progress', async () => {
      createActivator();
      const { updateProps } = await renderFloatingElement();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));
      expect(isFloatingActive()).toBe(true);

      await updateProps({ floatingKey: 'b' });
      await nextTick();

      expect(isFloatingActive()).toBe(true);
    });

    it('deactivates once the pointer leaves the floating element that replaced it', async () => {
      createActivator();
      const { updateProps } = await renderFloatingElement();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));
      await updateProps({ floatingKey: 'b' });
      await nextTick();

      await userEvent.hover(screen.getByTestId('floating-content'));
      expect(isFloatingActive()).toBe(true);

      await userEvent.unhover(screen.getByTestId('floating-content'));

      expect(isFloatingActive()).toBe(false);
    });

    it('drops an interaction the replacement is not configured for', async () => {
      createActivator();
      const { updateProps } = await renderFloatingElement({ activateOn: ['click'] });

      await userEvent.click(screen.getByTestId(ACTIVATOR_ID));
      expect(_registry[FLOATING_ID].activeInteractions.value).toEqual(['click']);

      await updateProps({ floatingKey: 'b', activateOn: ['hover'] });
      await nextTick();

      expect(_registry[FLOATING_ID].activeInteractions.value).toEqual([]);
      expect(isFloatingActive()).toBe(false);
    });

    it('keeps the entry, which the replacement takes over', async () => {
      createActivator();
      const { updateProps } = await renderFloatingElement();

      const entry = _registry[FLOATING_ID];
      await updateProps({ floatingKey: 'b' });
      await nextTick();

      expect(_registry[FLOATING_ID]).toBe(entry);
      expect(entry.callers.size).toBe(1);
    });
  });

  describe('when delegating', () => {
    beforeEach(() => {
      jest.spyOn(document, 'addEventListener');
    });

    afterEach(() => {
      document.addEventListener.mockRestore();
    });

    it('listens on the document rather than on the activator element', async () => {
      const activator = createActivator();
      jest.spyOn(activator, 'addEventListener');

      await renderFloatingElement({ activateOn: ['click'], delegate: true });

      expect(activator.addEventListener).not.toHaveBeenCalled();
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), true);
    });

    it('still activates the floating element', async () => {
      createActivator();
      await renderFloatingElement({ activateOn: ['click'], delegate: true });

      await userEvent.click(screen.getByTestId(ACTIVATOR_ID));

      expect(isFloatingActive()).toBe(true);
    });

    it(`counts the delegated event type in '_delegateUsage'`, async () => {
      createActivator();
      await renderFloatingElement({ activateOn: ['click'], delegate: true });

      expect(_delegateUsage).toEqual({ click: 1 });
    });

    it(`counts 'focus' and 'keyboardfocus' once, as they share an event`, async () => {
      createActivator();
      await renderFloatingElement({ activateOn: ['focus', 'keyboardfocus'], delegate: true });

      expect(_delegateUsage).toEqual({ focus: 1 });
    });
  });

  describe('clean-up', () => {
    it('lets go of everything once the floating element unmounts', async () => {
      createActivator();
      const { updateProps } = await renderFloatingElement();

      await userEvent.hover(screen.getByTestId(ACTIVATOR_ID));
      expect(_registry[FLOATING_ID]).toBeDefined();
      expect(_active.has(FLOATING_ID)).toBe(true);
      expect(_nonDelegated.has(FLOATING_ID)).toBe(true);

      await updateProps({ show: false });
      await nextTick();

      expect(_registry[FLOATING_ID]).toBeUndefined();
      expect(_active.has(FLOATING_ID)).toBe(false);
      expect(_nonDelegated.has(FLOATING_ID)).toBe(false);
    });

    it('removes the delegated listener with the last floating element using it', async () => {
      createActivator();
      const { updateProps } = await renderFloatingElement({
        activateOn: ['click'],
        delegate: true,
      });
      expect(_delegateUsage).toEqual({ click: 1 });

      await updateProps({ show: false });
      await nextTick();

      expect(_delegateUsage).toEqual({});
    });
  });
});
