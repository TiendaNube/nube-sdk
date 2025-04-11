<template>
  <a class="card" :href="link">
    <h3 class="title">{{ title }}</h3>
    <p class="description">{{ description }}</p>
  </a>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  link: String,
})
</script>

<style scoped>
.card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  background-color: var(--vp-c-bg);
  transition: 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}

.card:hover {
  border-color: var(--vp-c-brand);
}

.title {
  font-size: 1.1rem;
  margin: 0 0 0.25rem;
}

.description {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
</style>
