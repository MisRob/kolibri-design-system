<template>

  <div>
    <KButton @click="openModal">Open modal</KButton>
    <KModal
      v-if="showModal"
      title="Title"
    >
      <template #actions>
        <KIconButton
          icon="close"
          @click="closeModal"
        />
      </template>
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
