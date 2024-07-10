import useKLiveRegion from '../index.js';

const { _mountLiveRegion, sendPoliteMessage, sendAssertiveMessage } = useKLiveRegion();
function removeWhitespaceFromHtml(htmlString) {
  // https://stackoverflow.com/a/33108909
  return htmlString.replace(/>\s+|\s+</g, function(m) {
    return m.trim();
  });
}

// check that document.body.innerHTML includes html string
function assertDocumentBodyIncludes(htmlString) {
  expect(
    removeWhitespaceFromHtml(document.body.innerHTML).includes(removeWhitespaceFromHtml(htmlString))
  ).toBeTruthy();
}

const originalHTML = `
  <div id="#test-app">
  </div>
`;
document.body.innerHTML = originalHTML;

describe('useKLiveRegion', () => {
  it(`'_mountLiveRegion' inserts the live regions to a given element`, () => {
    expect(document.body.innerHTML).toEqual(originalHTML);
    _mountLiveRegion(document.getElementById('#test-app'));
    assertDocumentBodyIncludes(`
      <div id="#test-app">
        <div id="k-live-region" class="visuallyhidden">
          <div aria-live="polite">
          </div>
          <div aria-live="assertive">
          </div>
        </div>
      </div>
    `);
  });

  it(`'sendPoliteMessage' updates the live region with the message`, async () => {
    assertDocumentBodyIncludes(`
      <div id="k-live-region" class="visuallyhidden">
        <div aria-live="polite">
        </div>
        <div aria-live="assertive">
        </div>
      </div>
    `);

    sendPoliteMessage('Polite message');
    await new Promise(resolve => setTimeout(resolve, 100));
    assertDocumentBodyIncludes(`
      <div id="k-live-region" class="visuallyhidden">
        <div aria-live="polite">
          Polite message
        </div>
        <div aria-live="assertive">
        </div>
      </div>
    `);

    // cleanup
    sendPoliteMessage('');
  });

  it(`'sendAssertiveMessage' updates the live region with the message`, async () => {
    assertDocumentBodyIncludes(`
      <div id="k-live-region" class="visuallyhidden">
        <div aria-live="polite">
        </div>
        <div aria-live="assertive">
        </div>
      </div>
    `);

    sendAssertiveMessage('Assertive message');
    await new Promise(resolve => setTimeout(resolve, 100));
    assertDocumentBodyIncludes(`
      <div id="k-live-region" class="visuallyhidden">
        <div aria-live="polite">
        </div>
        <div aria-live="assertive">
          Assertive message
        </div>
      </div>
    `);

    // cleanup
    sendAssertiveMessage('');
  });
});
