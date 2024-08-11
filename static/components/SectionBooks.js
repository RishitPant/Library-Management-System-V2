const SectionBooks = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage" >
        <h2 style="text-align: center; margin-top: 20px;">Books in {{ section.section_name }}</h2>
        <hr><br>
        <div style="text-align: center;">
          <table border="1" padding="2" style="border-collapse: collapse; margin: auto; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 2px solid black; padding: 10px;">Book Name</th>
                <th style="border: 2px solid black; padding: 10px;">Book Author</th>
                <th style="border: 2px solid black; padding: 10px;">Edit Book</th>
                <th style="border: 2px solid black; padding: 10px;">Delete Book</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books" :key="book.id">
                <td style="border: 2px solid black; padding: 10px;">{{ book.name }}</td>
                <td style="border: 2px solid black; padding: 10px;">{{ book.authors }}</td>
                <td style="border: 2px solid black; padding: 10px;">
                  <button class="btn btn-primary" @click="editBook(book.id)">Edit</button>
                </td>
                <td style="border: 2px solid black; padding: 10px;">
                  <button class="btn btn-danger" @click="deleteBook(book.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
      </div>
      </div>
    `,
  
    data() {
      return {
        section: {},
        books: [],
        errorMessage: null
      }
    },
  
    created() {
      this.fetchData()
    },
  
    methods: {
      async fetchData() {
        try {
          const res = await fetch(`/section/${this.$route.params.section_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          })
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to view this information."
            return
          }
  
          if (!res.ok) throw new Error('Network response was not ok')
  
          const data = await res.json()
          this.section = data.section
          this.books = data.books
  
        } catch (error) {
          console.error('Error fetching section books:', error);
          this.errorMessage = "An error occurred while fetching the books."
        }
      },
  
      editBook(bookId) {
        this.$router.push(`/edit-book/${bookId}`)
      },
  
      deleteBook(bookId) {
        this.$router.push(`/delete-book/${bookId}`)
      }
    }
  }
  
  export default SectionBooks
  