const Ratings = {
    template:
    `
    <div>
    <form @submit.prevent="submitRating">
      <select v-model="selectedRating" required>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button class="btn btn-success" type="submit">Submit</button>
    </form>
    <hr>
    <div>
      <h2>People's Ratings</h2>
      <ul>
        <li v-for="feedback in feedbacks" :key="feedback.user">
          {{ feedback.user }} gave a rating of {{ feedback.rating }}
        </li>
      </ul>
      <br>
      <button @click="goBack" class="btn btn-dark">Back</button>
    </div>
  </div>
    `,

    data() {
        return {
            selectedRating: null,
            feedbacks: [],
            bookId: null,
            userId: null,
        }
    },
    mounted() {
        this.userId = this.$route.params.userid
        this.bookId = this.$route.params.bookid;
        this.fetchFeedbacks()
    },
    methods: {

        async fetchFeedbacks() {
            try {
                const url = window.location.origin
                const res = await fetch("http://127.0.0.1:5000/"+`/${this.bookId}/ratings`)

                if (res.ok) {
                    const data = await res.json()
                    this.feedbacks = data.feedbacks
                } else {
                    console.error('Failed to fetch feedbacks')
                }
            } catch (error) {
                console.error('Error fetching feedbacks:', error)
            }
        },
        goBack() {
            this.$router.go(-1)

        },

        async submitRating() {
            try {
                const url = window.location.origin
                const response = await fetch("http://127.0.0.1:5000"+`/${this.bookId}/ratings`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rating: this.selectedRating }),
                })

                if (response.ok) {
                    this.fetchFeedbacks()
                } else {
                    const errorData = await response.json()
                    console.error('Failed to submit rating:', errorData.message)
                }
            } catch (error) {
                console.error('Error submitting Rating:', error)
            }
        }
    }
}

export default Ratings