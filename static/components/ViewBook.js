const ViewBook = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage" id="pdf">
        <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="700px" style="border: none;"></iframe>
        <p v-if="!pdfUrl && !errorMessage">Loading PDF...</p>
        <p v-if="errorMessage" style="color: red; text-align: center;">{{ errorMessage }}</p>
      </div>
      </div>
    `,
  
    data() {
      return {
        book: [],
        pdfUrl: '',
        errorMessage: ''
      };
    },
  
    created() {
      this.fetchBook();
    },
  
    methods: {
      async fetchBook() {
        try {
          const res = await fetch(`/view/${this.$route.params.bookid}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          });
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to view this book."

          } else if (!res.ok) {
            console.log("Network response was not ok")

          } else {
            const data = await res.json();
            console.log(data);
  
            if (data) {
              this.pdfUrl = `/static/pdf/${encodeURIComponent(data.content)}#toolbar=0`
              console.log("PDF URL:", this.pdfUrl);
            }
          }
          
        } catch (error) {
          console.error("Error fetching book:", error);
          this.errorMessage = "An error occurred while fetching the book.";
        }
      }
    }
  };
  
  export default ViewBook;
  