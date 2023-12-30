
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
            <div class="quiz-item__question">
              {{index}}. {{ question }}
            </div>
            <form>
              <div v-for="response in responses" class="quiz-item__response-row">
                <span class="quiz-item__result">
                  <span v-show="selection === response">
                    <span v-show="response === correctResponse" class="quiz-item__correct">Excellent!</span>
                    <span v-show="response !== correctResponse" class="quiz-item__incorrect">Wrong</span>
                  </span>
                </span>
                <label>
                  <input type="radio" :name="index" v-model="selection" :value="response">
                  {{ response }}
                </label>
              </div>
            </form>
            <div class="quiz-item__hint">
              <div class="quiz-item__button-container">
                <quiz-button
                  @button-click="toggleShowHint"
                  name="Hint"
                  :isActive="isShowingHint"
                ></quiz-button>
              </div>
              <div v-show="isShowingHint" class="quiz-item__hint-text">
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
        <div v-show="active" class="page">
          <div class="page__title">
            {{ page.title }}
          </div>
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
    this.loadJSON('/quizData.json')
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
