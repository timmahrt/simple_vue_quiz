
Vue.component('quiz-button', {
  props: ['name', 'isActive'],
  template: `
    <button
      @click="onClick"
      class="quiz-button"
      :class="{ 'quiz-button__active': isActive }"
    >{{ name }}</button>
  `,
  methods: {
    onClick() {
      this.$emit('button-click', this.name);
    }
  }
});

Vue.component('quiz-selector', {
  props: ['quizzes', 'selectedQuiz'],
  template: `
        <div class="quiz-selector">
          <quiz-button
            v-for="quiz in quizzes"
            @button-click="onClick"
            :name="quiz"
            :isActive="selectedQuiz === quiz"
            :key="quiz"
          ></quiz-button>
        </div>
      `,
  methods: {
    onClick(name) {
      this.$emit('select-quiz', name);
    }
  }
});

Vue.component('quiz-item', {
  props: ['index', 'question', 'responses', 'correctResponse', 'hint'],
  template: `
          <div class="item">
            <p>{{index}}. {{ question }}</p>
            <div v-for="response in responses">
              <span class="quiz-item__result">
                <span v-if="selection === response">
                  <span v-if="response === correctResponse" class="quiz-item__correct">Excellent!</span>
                  <span v-else class="quiz-item__incorrect">Wrong</span>
                </span>
              </span>
              <input type="radio" v-model="selection" :value="response">
              <label>{{ response }}</label>
            </div>
            <div class="quiz-item__hint">
              <div class="quiz-item__button-container">
                <quiz-button
                  @button-click="toggleShowHint"
                  name="Hint"
                  :isActive="isShowingHint"
                ></quiz-button>
              </div>
              <div v-if="isShowingHint" class="quiz-item__hint-text">
                {{ hint }}
              </div>
            </div>
          </div>
        </div>
      `,
  methods: {
    toggleShowHint() {
      this.isShowingHint = !this.isShowingHint
    }
  },
  data() {
    return {
      selection: null,
      isShowingHint: false
    }
  }
});

Vue.component('quiz-items', {
  props: ['page', 'active'],
  template: `
        <div v-if="active" class="page">
          <h3>{{ page.title }}</h3>
          <div v-for="(item, index) in page.items">
            <quiz-item
              :index="index + 1"
              :question="item.question"
              :responses="item.responses"
              :correct-response="item.correctResponse"
              :hint="item.hint"
            ></quiz-item>
          </div>
        </div>
      `
});

Vue.component('quiz', {
  props: ['pageNames', 'pages', 'selectedPage'],
  template: `
    <div>
      <quiz-selector 
        :quizzes="pageNames"
        :selected-quiz="selectedPage"
        @select-quiz="onClick"
      ></quiz-selector>
      <quiz-items
        v-for="page in pages"
        :page="page"
        :active="page.title === selectedPage"
        :key="page.title"
      ></quiz-items>
    </div>
`,
  computed: {
    quizzes() {
      const result = []
      this.pages.forEach(page => {
        result.push(page.title)
      })
      return result
    }
  },
  methods: {
    onClick(name) {
      this.$emit('select-page', name);
    }
  }
})

new Vue({
  el: '#app',
  data: {
    pages: [],
    activePageName: null
  },
  mounted() {
    this.loadJSON('quizData.json')
  },
  computed: {
    pageNames() {
      const result = []
      this.pages.forEach(page => {
        result.push(page.title)
      })
      return result
    }
  },
  methods: {
    loadJSON(url) {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.pages = data['pages']
          if (this.pages.length > 0) {
            this.activePageName = this.pages[0].title;
            console.log(this.activePageName)
          }
        })
        .catch(error => {
          // This shouldn't happen in production
          console.error(error);
        });
    },
    setActivePage(pageName) {
      this.activePageName = pageName
    }
  }
});
