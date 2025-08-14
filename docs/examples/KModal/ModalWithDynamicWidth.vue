<template>

  <div>
    <KButton @click="openModal">Open modal</KButton>
    <KModal
      v-if="showModal"
      title="Title"
      size="600"
      cancelText="Close"
      @cancel="closeModal"
    >
      Modal with 600px size
    </KModal>
  </div>

</template>


<script>

  export default {
    data() {
      return {
        showModal: false,
      };
    },
    methods: {
      openModal() {
        this.showModal = true;
      },
      closeModal() {
        this.showModal = false;
      },
    },
  };

</script>
