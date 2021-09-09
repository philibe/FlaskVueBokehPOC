<template>
  <div class="about2">
    <h1>
      This page displays a config variable from flask ( [[ mon_message]] ).
    </h1>
  </div>
</template>
<script>
export default {
  data() {
    return {
      mon_message: process.env.CONFIG_PORTFLASK,
    };
  },
};
</script>
