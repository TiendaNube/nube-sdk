<template>
  <div class="card-grid">
    <Card v-for="(item, index) in items" :key="index" :title="item.title" :description="item.description"
      :link="item.link" />
  </div>
</template>

<script setup>
import Card from './Card.vue'
defineProps({
  items: Array
})
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
</style>
