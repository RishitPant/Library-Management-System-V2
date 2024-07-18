const MyBooks = {
    template: 
    `
    <div class="container">
          <h2 style="margin-top: 5px; text-decoration: underline;">Hi, {{ currentuser }}!</h2>
        <h2 style="margin-top: 30px; color: green;">Your Current Books:</h2>
        <div class="row">
          <!-- Display user books -->
          <div v-if="userBooks.length > 0" v-for="book in userBooks" :key="book.id" class="col-md-4">
            <div class="card mb-4 shadow-sm">
              <img class="card-img-top" :src="bookImage(book.book_img)" alt="Card image cap">
              <div class="card-body">
                <h5 class="card-title">
                  <a :href="'/view/' + book.id">{{ book.name }}</a>
                </h5>
                <p class="card-text">Author: {{ book.authors }}</p>
                <p class="card-text">Section: {{ book.section }}</p>
                <router-link :to="'/' + book.id + '/ratings'">Ratings</router-link>
                  <p class="card-text">Rating: {{ bookRatingDict[book.id] || 'No rating' }}/5</p>
                </a>
                <a :href="'/buy_book/' + book.id" class="btn btn-primary">Buy</a>
                <button @click="returnBook(book.id)" class="btn btn-danger">Return</button>
                <button @click="markAsCompleted(book.id)" class="btn btn-success">Mark as Completed</button>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No user books available.</p>
          </div>
        </div>
        <h2> Completed Books </h2>
        <div class="row">
          <!-- Display completed books -->
          <div v-if="completedBooks.length > 0" v-for="book in completedBooks" :key="book.id" class="col-md-4">
            <div class="card mb-4 shadow-sm">
              <img class="card-img-top" :src="bookImage(book.book_img)" alt="Card image cap">
              <div class="card-body">
                <h5 class="card-title">{{ book.name }}</h5>
                <p class="card-text">Author: {{ book.authors }}</p>
                <p class="card-text">Section: {{ book.section.section_name }}</p>
                <a :href="'/buy_book/' + book.id" class="btn btn-primary">Buy</a>
                <button @click="viewBook(book.id)" class="btn btn-secondary">View</button>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No completed books available.</p>
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
        }
    },

    created() {
        this.fetchData()
    },

    methods: {
        async fetchData() {
            try {
                const response = await fetch(`/my_books/${this.$route.params.id}`)
                if (!response.ok) {
                    throw new Error("Network response was not ok" + response.statusText)
                }
                const data = await response.json()
                console.log(data)
                this.userBooks = data.user_books || []
                this.bookRatingDict = data.completed_books || []
                this.bookRatingDict = data.book_Rating_dict || {}
                this.currentuser = data.currentuser
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        },
        bookImage(image) {
            console.log(image)
            return `/static/images/${encodeURIComponent(image)}`
        },
        returnBook(bookId) {

        },
        markAsCompleted(bookId) {

        },
        viewBook(bookId) {

        }
    }

}

export default MyBooks