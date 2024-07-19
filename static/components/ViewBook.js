const ViewBook = {
    template: `
    
    <div id="pdf">
        <embed :src="pdfUrl" type="application/pdf" width="100%" height="700px"/>
    </div>
    
    `,

    data() {
        return {
            book: null,
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
                    throw new Error("Network response was not ok" + response.statusText)
                }
                const data = await res.json()
                console.log(data)
                if (data.book) {
                    this.book = data.book
                    this.pdfUrl = `/static/pdf/${encodeURIComponent(data.book.content)}#toolbar=0`
                }
            } catch (error) {
                console.error("Error fetching book:", error)
            }
        }
    }
}

export default ViewBook