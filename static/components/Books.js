const Books = {
  template: `
    <div class="container">
      <h2 style="text-align: center; margin-top: 20px; color: darkgreen;">Available Books</h2>
      <hr><br>

      <div v-for="(section, index) in sections" :key="index" class="section">
        <h1 style="text-align: center; color: crimson;"> • {{ section.section_name }} •</h1>
        <br><br><br>

        <div class="row">
          <div v-for="book in getBooksBySection(section.id)" :key="book.id" class="col-md-4">
            <div v-if="!userBooks.includes(book.id)" class="card mb-4 shadow-sm">
              <img v-if="book.book_img" class="card-img-top" :src="getBookImage(book.book_img)" alt="Card image cap">
              <img v-else class="card-img-top" src="/static/images/not_available.png" alt="Card image cap">
              <div class="card-body">
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
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      sections: [],
      books: [],
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
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        console.log('Fetched data:', data);

        this.sections = data.sections;
        this.books = data.recommended; // Assuming 'recommended' contains the list of books
        this.bookRatingDict = data.book_rating_dict;
        this.countConnection = data.count_connection;
        this.userBooks = data.user_feedbacks.map(feedback => feedback.book_id);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    },
    getBooksBySection(sectionId) {
      return this.books.filter(book => book.section_id === sectionId);
    },
    getBookImage(bookImg) {
      return `/static/images/${bookImg}`;
    },
    async requestBook(bookId) {
      try {
        const res = await fetch(`/request_book/${bookId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ action: "request", book_id: bookId }) // Ensure 'action' is sent in the body
        });
    
        if (res.ok) {
          console.log("Request sent:");
        } else {
          console.error("Failed to send request:", res.statusText);
        }
      } catch (error) {
        console.error("Error sending request:", error);
      }
    }
    
  }
};

export default Books;
