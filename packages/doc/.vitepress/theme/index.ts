import DefaultTheme from 'vitepress/theme'
import Card from './components/Card.vue'
import CardGrid from './components/CardGrid.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Card', Card)
    app.component('CardGrid', CardGrid)
  }
}
