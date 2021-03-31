import KModal from '../lib/KModal.vue'
import KCircularLoader from '../lib/loaders/KCircularLoader.vue'
import WithLoaderMdNotes from './KModal.WithLoader.notes.md'
import WithTextContentMdNotes from './KModal.WithTextContent.notes.md'

export default {
  component: KModal,
  title: 'KModal',
};


export const WithLoader = () => ({
  components: { KModal, KCircularLoader },
  template: '<KModal title="Title"><KCircularLoader/></KModal>'
});
WithLoader.story = {
  parameters: {
    notes: { WithLoaderMdNotes }
  }
};

export const WithTextContent = () => ({
  components: { KModal, KCircularLoader },
  template: '<KModal title="Title">Hello, friend :)!</KModal>'
});
WithTextContent.story = {
  parameters: {
    notes: { WithTextContentMdNotes }
  }
};