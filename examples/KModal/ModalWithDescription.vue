<template>

  <div>
    <KButton @click="openModal">Open modal</KButton>
    <KModal
      v-if="showModal"
      title="Title"
      cancelText="Close"
      @cancel="closeModal"
    >
      Description
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
