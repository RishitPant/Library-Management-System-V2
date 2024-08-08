const ViewBook = {
    template: `
    
    

     <div id="pdf">
      <iframe :src="pdfUrl" width="100%" height="700px" style="border: none;"></iframe>
      <p v-if="!pdfUrl">Loading PDF...</p>
    </div>
    
    `,

    // <div id="pdf">
    //     <embed :src="pdfUrl" type="application/pdf" width="100%" height="700px"/>
    // </div>

    data() {
        return {
            book: [],
            pdfUrl: ''
        }
    },

    created() {
        this.fetchBook()
    },

    methods: {
        async fetchBook() {
            try {
                const res = await fetch(`/view/${this.$route.params.bookid}`)
                if (!res.ok) {
                    throw new Error("Network response was not ok" + res.statusText)
                }
                const data = await res.json()
                console.log(data)
                if (data) {
                    this.pdfUrl = `/static/pdf/${encodeURIComponent(data.content)}#toolbar=0`
                    console.log("PDF URL:", this.pdfUrl);
                }
            } catch (error) {
                console.error("Error fetching book:", error)
            }
        }
    }
}

export default ViewBook