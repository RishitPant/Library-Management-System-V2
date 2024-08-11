const Books = {
  template: `
  <div>
  <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
    <div v-if="!errorMessage" class="container">
      <h2 style="text-align: center; margin-top: 20px; color: darkgreen;">Available Books</h2>
      <hr><br>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div v-for="(section, index) in sections" :key="index" class="section">
        <h3 style="text-align: center; color: crimson;"> • {{ section.section_name }} •</h3>
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
    </div>
  `,

  data() {
    return {
      sections: [],
      books: [],
      userBooks: [],
      bookRatingDict: {},
      countConnection: 0,
      errorMessage: null
    };
  },

  created() {
    this.fetchBooks()
  },

  methods: {
    async fetchBooks() {
      try {
        const response = await fetch('/books', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (response.status === 403) {
          this.errorMessage = "You are not authorized to view this page."
          return
        }

        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json();

        this.sections = data.sections
        this.books = data.recommended
        this.bookRatingDict = data.book_rating_dict
        this.countConnection = data.count_connection
        this.userBooks = data.user_feedbacks.map(feedback => feedback.book_id)

        console.log(bookRatingDict)

      } catch (error) {
        console.error('Error fetching books:', error)
        this.errorMessage = "An error occurred while fetching book data."
      }
    },

    getBooksBySection(sectionId) {
      return this.books.filter(book => book.section_id === sectionId)
    },

    getBookImage(bookImg) {
      return `/static/images/${bookImg}`
    },

    async requestBook(bookId) {
      try {
        const res = await fetch(`/request_book/${bookId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authentication-Token': sessionStorage.getItem('token')
          },

          body: JSON.stringify({ action: "request", book_id: bookId })
        })

        if (res.status === 403) {
          this.errorMessage = "You are not authorized to make this request."
          return
        }

        if (res.ok) {
          const data = await res.json()
          console.log("Request sent:", data.message || "Request was successful.")

        } else {
          console.log("Failed to send request")
        }
      } catch (error) {
        console.error("Error sending request:", error)
      }
    }
  }
}

export default Books
