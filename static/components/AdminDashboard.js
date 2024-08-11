const AdminDashboard = {
  template: `
  <div>
    <h2 v-if="!errorMessage">Hi, {{ currentUser }}</h2>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
    
    <div v-if="!errorMessage">
      <h2 style="text-align: center; margin-top: 20px;">All Sections</h2>
      <table border="1" padding="2" style="border-collapse: collapse; margin: auto; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border: 2px solid black; padding: 10px;">Section Name</th>
            <th style="border: 2px solid black; padding: 10px;">Edit Section</th>
            <th style="border: 2px solid black; padding: 10px;">Delete Section</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in sections" :key="section.id">
            <td style="border: 2px solid black; padding: 10px;">
              <a :href="getSectionBooksUrl(section.id)"> {{ section.section_name }}</a>
            </td>
            <td style="border: 2px solid black; padding: 10px;">
              <a :href="getEditSectionUrl(section.id)">
                <button class="btn btn-primary">Edit</button>
              </a>
            </td>
            <td style="border: 2px solid black; padding: 10px;">
              <a :href="getDeleteSectionUrl(section.id)">
                <button class="btn btn-danger">Delete</button>
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style="text-align: center; margin-top: 20px;">All Books</h2>
      <table border="1" padding="2" style="border-collapse: collapse; margin: auto; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border: 2px solid black; padding: 10px;">Book Title</th>
            <th style="border: 2px solid black; padding: 10px;">Author</th>
            <th style="border: 2px solid black; padding: 10px;">Section</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td style="border: 2px solid black; padding: 10px;">{{ book.name }}</td>
            <td style="border: 2px solid black; padding: 10px;">{{ book.authors }}</td>
            <td style="border: 2px solid black; padding: 10px;">{{ getSectionName(book.section_id) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,

  data() {
      return {
          sections: [],
          books: [],
          currentUser: '',
          errorMessage: ''
      };
  },

  created() {
    this.fetchData();
  },

  methods: {
      async fetchData() {
          try {
            const response = await fetch('/admin_dashboard', {
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': sessionStorage.getItem('token')
              }
            });

            //console.log(sessionStorage.getItem('token'))

            if (response.status === 403) {
              this.errorMessage = "You are not authorized to see this page."

            } else {
              const data = await response.json()
              this.sections = data.sections
              this.books = data.books
              this.currentUser = data.current_user
            }

          } catch (error) {
            console.error("Error fetching data:", error)
            this.errorMessage = "An error occurred while loading the page."
          }
      },

      getSectionBooksUrl(sectionId) {
          return `/#/section/${sectionId}`
      },

      getEditSectionUrl(sectionId) {
          return `/edit_section/${sectionId}`
      },

      getDeleteSectionUrl(sectionId) {
          return `/delete_section/${sectionId}`
      },

      getSectionName(sectionId) {
          const section = this.sections.find(s => s.id === sectionId)
          return section ? section.section_name : 'Unknown Section'
      }
  }
}

export default AdminDashboard
