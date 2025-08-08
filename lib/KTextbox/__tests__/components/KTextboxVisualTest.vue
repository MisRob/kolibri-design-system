<template>

  <div>
    <p>Label:</p>
    <WithLabel />

    <p>Validation:</p>
    <Validation />

    <p>Character Limit:</p>
    <CharacterLimit />

    <p>Disabled:</p>
    <Disabled />

    <p>Readonly:</p>
    <Readonly />

    <p>Number input:</p>
    <Number />

    <p>Password input:</p>
    <Password />

    <p>Textarea:</p>
    <AsTextarea />

    <p>Clearable:</p>
    <Clearable />

    <p>Invalid Text:</p>
    <InvalidText />
  </div>

</template>


<script>

  import WithLabel from '../../../../docs/examples/KTextbox/WithLabel';
  import Validation from '../../../../docs/examples/KTextbox/Validation';
  import CharacterLimit from '../../../../docs/examples/KTextbox/CharacterLimit';
  import Disabled from '../../../../docs/examples/KTextbox/Disabled';
  import Readonly from '../../../../docs/examples/KTextbox/Readonly';
  import Number from '../../../../docs/examples/KTextbox/Number';
  import Password from '../../../../docs/examples/KTextbox/Password';
  import AsTextarea from '../../../../docs/examples/KTextbox/AsTextarea';
  import Clearable from '../../../../docs/examples/KTextbox/Clearable';
  import InvalidText from '../../../../docs/examples/KTextbox/InvalidText';

  export default {
    name: 'KIconVisualTest',
    components: {
      WithLabel,
      Validation,
      CharacterLimit,
      Disabled,
      Readonly,
      Number,
      Password,
      AsTextarea,
      Clearable,
      InvalidText,
    },
  };

</script>
