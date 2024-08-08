const DeleteBook = {
    template:
    `
    <div>
    <h2>Delete Book</h2>

  <p>Are you sure you want to delete {{ book.name }}?</p>

  <form @submit.prevent="submitForm">
    <input type="submit" class="btn btn-danger" value="Yes, Delete">
  </form>

  <button class="btn btn-dark" @click="goBack">No, Cancel</button>
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

            }
        }
    },

    methods: {

    mounted() {
        this.fetchData()
    },

    async fetchData() {
        try {

            const res = await fetch(`/delete-book/${this.$route.params.id}`)
            console.log(res)

            if (res.ok) {
                const data = await res.json()
                console.log(data)
                this.book = data.book.name
            } else {
                console.log("Error in response")
            }

        } catch(error){ 
            console.error("Error fetching data", error)
        }
    },

    async submitForm() {
        try {

        const res = await fetch(`/delete-book/${this.$route.params.id}`, {
            method: "POST",
        })

        if (res.ok) {
            const data = await res.json()
            this.$router.push('/')
        } else {
            console.log("Error in response", res.status)
        }
    } catch (error) {
        console.error("Error in submiting", error)
    }
},

goBack() {
    this.$router.go(-1)
}
}
}

export default DeleteBook