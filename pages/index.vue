<template>
  <div>Home page</div>
</template>

<script setup>
const { find } = useStrapi();
const { data: materials } = await find('materials');

console.log('materials');
console.log(materials);
</script>
