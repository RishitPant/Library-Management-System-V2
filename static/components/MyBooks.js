const MyBooks = {
  template: `
  <div>
  <h2 v-if="error" style="text-align: center; color: red;">{{ error }}</h2>
    <div v-if="!error" class="container">
      <h2 style="margin-top: 5px; text-decoration: underline;">Hi, {{ currentuser }}!</h2>
      <h2 style="margin-top: 30px; color: green;">Your Current Books:</h2>
      <div class="row">
        <!-- Display user books -->
        <div v-if="userBooks.length > 0" v-for="book in userBooks" :key="book.id" class="col-md-4">
          <div class="card mb-4 shadow-sm">
            <img class="card-img-top" :src="bookImage(book.book_img)" alt="Card image cap">
            <div class="card-body">
              <h5 class="card-title">
                <router-link :to="'/view/' + book.id">{{book.name}}</router-link> 
              </h5>
              <p class="card-text">Author: {{ book.authors }}</p>
              <p class="card-text">Section: {{ book.section }}</p>
              <router-link :to="'/' + book.id + '/ratings'">Ratings</router-link>
              <p class="card-text">Rating: {{ bookRatingDict[book.id] || 'No rating' }}/5</p>
              <router-link :to="'/buy-book/' + book.id" class="btn btn-primary">Buy</router-link>
              <button @click="returnBook(book.id)" class="btn btn-danger">Return</button>
              <button @click="markAsCompleted(book.id)" class="btn btn-success">Mark as Completed</button>
              <router-link :to="'/view/' + book.id"><button class="btn btn-primary">View</button></router-link>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No user books available.</p>
        </div>
      </div>
      <h2>Completed Books</h2>
      <div class="row">
        <!-- Display completed books -->
        <div v-if="completedBooks.length > 0" v-for="book in completedBooks" :key="book.id" class="col-md-4">
          <div class="card mb-4 shadow-sm">
            <img class="card-img-top" :src="bookImage(book.book_img)" alt="Card image cap">
            <div class="card-body">
              <h5 class="card-title">{{ book.name }}</h5>
              <p class="card-text">Author: {{ book.authors }}</p>
              <p class="card-text">Section: {{ book.section.section_name }}</p>
              <router-link :to="'/buy-book/' + book.id" class="btn btn-primary">Buy</router-link>
              <button @click="viewBook(book.id)" class="btn btn-secondary">View</button>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No completed books available.</p>
        </div>
      </div>
      <div v-if="showBook">
        <div id="pdf">
          <embed :src="pdf" type="application/pdf" width="100%" height="700px"/>
        </div>
      </div>
    </div>
    </div>
  `,

  data() {
    return {
      userBooks: [],
      completedBooks: [],
      bookRatingDict: {},
      currentuser: null,
      showBook: null,
      pdf: '',
      error: ''
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        const token = localStorage.getItem('authToken')

        console.log(token)

        const response = await fetch(`/my_books/${this.$route.params.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        })

        if (response.status === 403) {
          this.error = 'You are not authorized to view these books.'
          return
        }

        if (!response.ok) {
          throw new Error("Network response was not ok" + response.statusText)
        }

        const data = await response.json()

        console.log(data)

        this.userBooks = data.user_books || []
        this.completedBooks = data.completed_books || []
        this.bookRatingDict = data.book_Rating_dict || {}
        this.currentuser = data.currentuser

        console.log('User Books:', this.userBooks);
        console.log('Completed Books:', this.completedBooks);
        console.log('Book Rating Dict:', this.bookRatingDict);

      } catch (error) {
        this.error = 'Error fetching data.'
        console.error("Error fetching data:", error)
      }
    },

    bookImage(image) {
      console.log(image)
      return `/static/images/${encodeURIComponent(image)}`
    },

    async returnBook(bookId) {
      try {
        const res = await fetch(`/my_books/${this.$route.params.id}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          },
          body: JSON.stringify({
            action: 'return',
            book_id: bookId
          })
        })

        if (res.status === 403) {
          this.error = 'You are not authorized to return this book.'
          return
        }

        const data = await res.json()

        if (data.success) {
          this.userBooks = this.userBooks.filter(book => book.id !== bookId)
          console.log("RETURNED")

        } else {
          console.log("ERROR")
        }

      } catch (error) {
        this.error = 'Error returning book.'
        console.error("Error returning book:", error)
      }
    },

    async markAsCompleted(bookId) {
      try {
        const res = await fetch(`/my_books/${this.$route.params.id}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          },

          body: JSON.stringify({
            action: "mark_as_completed",
            book_id: bookId,
          })
        })

        if (res.status === 403) {
          this.error = 'You are not authorized to mark this book as completed.'
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to mark book as completed")
        }

        const data = await res.json()

        if (data.success) {
          const book = this.userBooks.find(book => book.id === bookId)

          if (book) {
            this.userBooks = this.userBooks.filter(book => book.id !== bookId)
            this.completedBooks.push(book)
          }
        }

      } catch (error) {
        this.error = 'Error marking book as completed.'
        console.error("Error marking book as completed:", error)
      }
    },

    viewBook(bookId) {
      const bookIdStr = String(bookId)
      console.log(bookIdStr)
      this.$router.push(`/view/${bookIdStr}`)
    },

    buyBook() {
      // Implementation for buying a book
    }
  }
}

export default MyBooks
