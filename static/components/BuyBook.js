const BuyBook = {
    template: 
    `
    <div>
        <h2>Are you sure you want to buy {{name}}?</h2>
        <div v-if="errorMessage">{{ errorMessage }}</div>
        
        <form @submit.prevent="buyBook">
            <button type="submit" class="btn btn-success">Buy</button>
        </form>

        <button @click="goBack" class="btn btn-dark">Back</button>
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
        const bookId = this.$route.params.bookid; // Assuming you're using Vue Router
        this.fetchBook(bookId);
    },

    methods: {
        goBack() {
            this.$router.go(-1)
        },

        async fetchBook(bookId) {
            try {

            const res = await fetch(`/buy-book/${bookId}`)

            if (res.ok) {
                const data = await res.json()
                if (data.errorMessage) {
                    this.errorMessage = data.errorMessage
                } else {
                    this.name = data.book.name
                }
            } else {
                const errorData = await res.json();
                this.errorMessage = errorData.errorMessage || "An error occurred while fetching the book details.";
            }

        } catch (error) {
            this.errorMessage = "An error occurred while fetching the book details.";
        }
        },

        async buyBook() {
            try {
                const res = await fetch(`/buy-book/${this.$route.params.bookid}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });

                if (res.ok) {
                    const data = await res.json()

                    if (data.book && data.book.name && data.userid) {
                        this.name = data.book.name;
                        this.userid = data.userid

                        console.log("Purchase successful:", data);
                    }

                    // this.$router.push({ name: `/my_books/${this.userid}` })
                    this.$router.go(-1)

                } else {
                    console.error("Failed to fetch buy book data")
                }
            } catch (error) {
                console.error("Error fetching buy book data", error)
            }
        }
    },
}

export default BuyBook