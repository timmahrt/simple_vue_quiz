
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

// You can use this to select quizzes based on the name of the quiz
// When multiple quizzes are selectable on the same page.
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

// You can use this to break up quizzes into multiple chunks.
Vue.component('quiz-pagination-navigation', {
  props: ['numPages', 'selectedPage'],
  template: `
    <div class="quiz-selector">
    Page Select:
    <quiz-button
      v-for="page in pageNumbers"
      @button-click="onClick"
      :name="page + 1"
      :isActive="selectedPage === page"
      :key="page"
    ></quiz-button>
    </div>
  `,
  computed: {
    pageNumbers() { return Array.from({ length: this.numPages }, (_, index) => index); }
  },
  methods: {
    onClick(page) {
      this.$emit('select-page', page - 1);
    }
  }
});

Vue.component('quiz-item', {
  props: ['index', 'question', 'responses', 'correctResponse', 'hint', 'highlight'],
  template: `
          <div class="item">
            <div class="quiz-item__question">
              {{index}}.
              <span v-if="!hasHighlight">
                {{ question }}
              </span>
              <span v-else>
                {{ preHighlight }} <span class="quiz-item__highlighted">{{ highlight }}</span> {{ postHighlight }}
              </span>
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
  computed: {
    hasHighlight() {
      return this.highlight && this.question.includes(this.highlight)
    },
    preHighlight() {
      if (!this.hasHighlight) {
        return ''
      }

      return this.question.split(this.highlight, 2)[0]
    },
    postHighlight() {
      if (!this.hasHighlight) {
        return ''
      }

      return this.question.split(this.highlight, 2)[1]
    },
  },
  data() {
    return {
      selection: null,
      isShowingHint: false
    }
  }
});

Vue.component('quiz-items', {
  props: ['page', 'active', 'batchSize', 'batchId'],
  template: `
        <div v-show="active" class="page">
          <div class="page__title">
            {{ page.title }}
          </div>
          <div v-for="(item, index) in items">
            <quiz-item
              :index="(index + 1) + startIndex"
              :question="item.question"
              :responses="item.responses"
              :correct-response="item.correctResponse"
              :hint="item.hint"
              :highlight="item.highlight"
            ></quiz-item>
          </div>
        </div>
      `,
  computed: {
    startIndex() { return this.batchId * this.batchSize },
    endIndex() { return (this.batchId + 1) * this.batchSize },
    items() {
      return this.page.items.slice(this.startIndex, this.endIndex)
    }
  }
});

Vue.component('quiz', {
  props: ['pageNames', 'pages', 'selectedPage', 'selectedPageNum', 'batchSize', 'activePagesMaxPageNum'],
  template: `
    <div>
      <quiz-selector 
        v-if="pageNames.length > 1"
        :quizzes="pageNames"
        :selected-quiz="selectedPage"
        @select-quiz="selectQuiz"
      ></quiz-selector>
      <quiz-items
        v-for="page in pages"
        :page="page"
        :active="page.title === selectedPage"
        :key="page.title"
        :batchSize="batchSize"
        :batchId="selectedPageNum"
      ></quiz-items>
      <quiz-pagination-navigation
        v-if="activePagesMaxPageNum > 1"
        :numPages="activePagesMaxPageNum"
        :selected-page="selectedPageNum"
        @select-page="selectPage"
      ></quiz-pagination-navigation>
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
    selectQuiz(name) {
      this.$emit('select-quiz', name);
    },
    selectPage(page) {
      this.$emit('select-page', page);
    }
  }
})

new Vue({
  el: '#app',
  data: {
    pages: [],
    activePageName: null,
    activePageNum: null,
    batchSize: 10
  },
  mounted() {
    this.loadJSON('/quizData.json')
  },
  computed: {
    activePage() {
      if (!this.activePageName) {
        return null
      }

      return this.pages.find(page => page.title === this.activePageName)
    },
    pageNames() {
      const result = []
      this.pages.forEach(page => {
        result.push(page.title)
      })
      return result
    },
    activePagesMaxPageNum() {
      if (!this.activePage) {
        return 0
      }

      return Math.ceil(this.activePage.items.length / this.batchSize)
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
            this.activePageNum = 0;
          }
        })
        .catch(error => {
          // This shouldn't happen in production
          console.error(error);
        });
    },
    setActiveQuiz(pageName) {
      this.activePageName = pageName
    },
    setActivePaginationPage(pageNum) {
      this.activePageNum = pageNum
    }
  }
});
