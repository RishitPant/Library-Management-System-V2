const Stats = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage" >
        <h1>Statistics</h1>
  
        <ul>
          <li><h2>Total Users: {{ total_users }}</h2></li>
          <li><h2>Total E-Books: {{ total_books }}</h2></li>
          <li><h2>Total Sections: {{ total_sections }}</h2></li>
          <br>
  
          <h2>Books per Section:</h2>
          <li v-for="([section, books], index) in sectionbooks" :key="index">
            <h3>{{ section }}: {{ books }}</h3>
          </li>
        </ul>
  
        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
      </div>
      </div>
    `,
  
    data() {
      return {
        total_users: 0,
        total_books: 0,
        total_sections: 0,
        sectionbooks: [],
        errorMessage: null
      }
    },
  
    created() {
      this.fetchData()
    },
  
    methods: {
      async fetchData() {
        try {
          const res = await fetch('/stats', {
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

          this.total_users = data.total_users
          this.total_books = data.total_books
          this.total_sections = data.total_sections
          this.sectionbooks = data.section_books
  
        } catch (error) {
          console.error('Error fetching statistics:', error)
          this.errorMessage = "An error occurred while fetching statistics."
        }
      }
    }
  }
  
  export default Stats
  