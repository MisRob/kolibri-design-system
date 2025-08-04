<template>

  <KTextbox
    v-model="numericInput"
    label="Numbers only"
    :invalid="!isNumeric(numericInput)"
    invalidText="Please enter a valid number."
  />

</template>


<script>

  export default {
    data() {
      return {
        numericInput: '',
      };
    },
    methods: {
      isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
      },
    },
  };

</script>
