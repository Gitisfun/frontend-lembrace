<template>
  <div class="rich-content">
    <div v-for="(block, index) in content" :key="index" class="content-block">
      <!-- Paragraph -->
      <p v-if="block.type === 'paragraph'" class="paragraph">
        <span v-for="(child, childIndex) in block.children" :key="childIndex" :class="getTextClasses(child)">
          {{ child.text }}
        </span>
      </p>

      <!-- Unordered List -->
      <ul v-else-if="block.type === 'list' && block.format === 'unordered'" class="unordered-list">
        <li v-for="(item, itemIndex) in block.children" :key="itemIndex" class="list-item">
          <span v-for="(child, childIndex) in item.children" :key="childIndex" :class="getTextClasses(child)">
            {{ child.text }}
          </span>
        </li>
      </ul>

      <!-- Ordered List -->
      <ol v-else-if="block.type === 'list' && block.format === 'ordered'" class="ordered-list">
        <li v-for="(item, itemIndex) in block.children" :key="itemIndex" class="list-item">
          <span v-for="(child, childIndex) in item.children" :key="childIndex" :class="getTextClasses(child)">
            {{ child.text }}
          </span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const getTextClasses = (textNode) => {
  const classes = [];

  if (textNode.bold) classes.push('bold');
  if (textNode.italic) classes.push('italic');
  if (textNode.underline) classes.push('underline');

  return classes;
};
</script>

<style scoped>
.rich-content {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
}

.content-block {
  margin-bottom: 1rem;
}

.content-block:last-child {
  margin-bottom: 0;
}

.paragraph {
  margin: 0;
}

.unordered-list,
.ordered-list {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.list-item {
  margin-bottom: 0.5rem;
}

.list-item:last-child {
  margin-bottom: 0;
}

.bold {
  font-weight: 600;
}

.italic {
  font-style: italic;
}

.underline {
  text-decoration: underline;
}
</style>
