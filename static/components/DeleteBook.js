const DeleteBook = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage" >
        <h2>Delete Book</h2>
        <p>Are you sure you want to delete {{ book.name }}?</p>
        <form @submit.prevent="submitForm">
          <input type="submit" class="btn btn-danger" value="Yes, Delete">
        </form>
        <button class="btn btn-dark" @click="goBack">No, Cancel</button>
        <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
      </div>
      </div>
    `,
  
    data() {
      return {
        book: {
          id: "",
          name: "",
          authors: "",
          book_img: "",
          section: "",
          is_available: ""
        },
        errorMessage: ''
      }
    },
  
    mounted() {
      this.fetchData();
    },
  
    methods: {
      goBack() {
        this.$router.go(-1)
      },
  
      async fetchData() {
        try {
          const res = await fetch(`/delete-book/${this.$route.params.id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          });
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to view or delete this book."
          } else if (res.ok) {
            const data = await res.json()
            this.book = data.book
            this.errorMessage = ''
          } else {
            console.error("Error response: " + res.status)
            this.errorMessage = "Failed to fetch book data."
          }
        } catch (error) {
          console.error("Error fetching data", error)
          this.errorMessage = "An error occurred while fetching book data."
        }
      },
  
      async submitForm() {
        try {
          const res = await fetch(`/delete-book/${this.$route.params.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          })
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to delete this book."
            
          } else if (res.ok) {
            const data = await res.json();
            this.$router.push('/admin_dashboard')
            this.errorMessage = ''

          } else {

            console.error("Error response: " + res.status)
            this.errorMessage = "Error deleting book."
          }
        } catch (error) {

          console.error("Error deleting book", error)
          this.errorMessage = "An error occurred while deleting the book."
        }
      }
    }
  };
  
  export default DeleteBook;
  