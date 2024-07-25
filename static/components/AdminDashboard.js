const AdminDashboard = {
    template: 
    `
    <div>
      <h2>Hi, {{ currentUser }}</h2>

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
    `,

    data() {
        return {
            sections: [],
            books: [],
            currentUser: ''
        }
    },

    methods: {
        async fetchData() {
            try {
              const response = await fetch('/admin_dashboard');
              const data = await response.json();
      
              this.sections = data.sections;
              this.books = data.books;
              this.currentUser = data.current_user;
            } catch (error) {
              console.error("Error fetching data:", error);
            }
          },

          getSectionBooksUrl(sectionId) {
            return `/section_books/${sectionId}`;
          },
      
          getEditSectionUrl(sectionId) {
            return `/edit_section/${sectionId}`;
          },
      
          getDeleteSectionUrl(sectionId) {
            return `/delete_section/${sectionId}`;
          },
      
          getSectionName(sectionId) {
            const section = this.sections.find(s => s.id === sectionId);
            return section ? section.section_name : 'Unknown Section';
          }
    }
}

export default AdminDashboard