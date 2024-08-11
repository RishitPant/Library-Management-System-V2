const BuyBook = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage">
        <h2>Are you sure you want to buy {{ name }}?</h2>
        <div v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>
        <form @submit.prevent="buyBook">
          <button type="submit" class="btn btn-success">Buy</button>
        </form>
        <button @click="goBack" class="btn btn-dark">Back</button>
      </div>
      </div>
    `,
  
    data() {
      return {
        name: null,
        errorMessage: null,
        userid: null
      }
    },
  
    created() {
      const bookId = this.$route.params.bookid
      this.fetchBook(bookId)
    },
  
    methods: {
      goBack() {
        this.$router.go(-1)
      },
  
      async fetchBook(bookId) {
        try {
          const res = await fetch(`/buy-book/${bookId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          })
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to buy this book."

          } else if (res.ok) {

            const data = await res.json();
            if (data.errorMessage) {
              this.errorMessage = data.errorMessage

            } else {
              this.name = data.book.name
            }
            
          } else {
            console.log("Error occurred while fetching books")
          }

        } catch (error) {
          this.errorMessage = "An error occurred while fetching the book details."
        }
      },
  
      async buyBook() {
        try {
          const res = await fetch(`/buy-book/${this.$route.params.bookid}`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            },
            body: JSON.stringify({})
          })
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to purchase this book."

          } else if (res.ok) {
            const data = await res.json()

            if (data.book && data.book.name && data.userid) {
              this.name = data.book.name
              this.userid = data.userid

              console.log("Purchase successful:", data)

              this.$router.push({ name: 'my_books', params: { userid: this.userid } })

            } else {
              this.errorMessage = "An error occurred while processing the purchase."
            }

          } else {
            console.log("Error occurred during purchase")
          }

        } catch (error) {
          console.error("Error fetching buy book data", error)
          this.errorMessage = "An error occurred while processing the purchase."
        }
      }
    }
  }
  
  export default BuyBook;
  