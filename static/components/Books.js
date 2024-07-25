const Books = {
    template: 

    `

<div class="container">
      <h2 style="text-align: center; margin-top: 20px; color: darkgreen;">Available Books</h2>
      <hr><br>

      <div v-for="section in sections" :key="section.id" class="section">
        <h1 style="text-align: center; color: crimson;"> • {{ section.section_name }} •</h1>
        <br><br><br>

        <div class="row">
          <div v-for="(book, index) in section" :key="book.id">
            <div class="col-md-4" v-if="!userBooks.includes(book.id)">
              <div class="card mb-4 shadow-sm">
                <img v-if="book.book_img" class="card-img-top" :src="getBookImage(book.book_img)" alt="Card image cap">
                <img v-else class="card-img-top" src="/static/images/not_available.png" alt="Card image cap">
                <div class="card-body" style="text-align: center;">
                  <h5 class="card-title">{{ book.name }}</h5>
                  <p class="card-text">Author: {{ book.authors }}</p>
                  <p class="card-text">Section: {{ section.section_name }}</p>
                  <p class="card-text">Rating: {{ bookRatingDict[book.id] || 0 }}</p>
                  <router-link :to="{ name: 'buyBook', params: { bookid: book.id } }" class="btn btn-primary">Buy</router-link>

                  <div v-if="countConnection >= 5">
                    <form @submit.prevent="requestBook(book.id)">
                      <button type="submit" class="btn btn-dark" disabled>Request</button>
                      <p style="color: crimson;">Books request limit reached</p>
                    </form>
                  </div>
                  <div v-else>
                    <form @submit.prevent="requestBook(book.id)">
                      <button type="submit" class="btn btn-dark">Request</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-100" v-if="(index + 1) % 3 === 0"></div>
          </div>
        </div>
      </div>
    </div>
`,

data() {
    return {
      sections: [],
      userBooks: [],
      bookRatingDict: {},
      countConnection: 0,
    };
  },
  created() {
    this.fetchBooks();
  },

  methods: {
    async fetchBooks() {
      try {
        const response = await fetch('/books');
        const data = await response.json();

        console.log('Fetched data:', data);

        this.sections = data.sections;
        this.bookRatingDict = data.book_rating_dict;
        this.countConnection = data.count_connection;
        this.userBooks = data.user_feedbacks.map(feedback => feedback.book_id);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    },

    getBookImage(book_img) {
        return `/static/images/${book_img}`;
      },

    requestBook(bookId) {
      // Add your request book logic here
      console.log("Requesting book with ID:", bookId);
    }
  }
};


export default Books