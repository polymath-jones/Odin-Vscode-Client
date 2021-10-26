<template>
  <div class="home">
    <ToolSpace/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import ToolSpace from '@/components/ToolSpace.vue'; // @ is an alias to /src

@Options({
  components: {
    ToolSpace,
  },
})
export default class Home extends Vue {}
</script>
