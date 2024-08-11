const DeleteSection = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage" >
        <h2>Delete Section</h2>
        <p>Are you sure you want to delete {{ section.section_name }}?</p>
        <form @submit.prevent="submitForm">
          <input type="submit" class="btn btn-danger" value="Yes, Delete">
        </form>
        <button class="btn btn-dark" @click="goBack">No, Cancel</button>
        <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
      </div>
      </div>
    `,
  
    data() {
      return {
        section: {
          id: "",
          section_name: "",
          description: ""
        },
        errorMessage: ''
      }
    },
  
    mounted() {
      this.fetchData();
    },
  
    methods: {
      goBack() {
        this.$router.go(-1)
      },
  
      async fetchData() {
        try {
          const res = await fetch(`/delete-section/${this.$route.params.id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          })
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to view or delete this section."

          } else if (res.ok) {
            const data = await res.json()
            this.section = data.section
            this.errorMessage = ''

          } else {
            console.error("Error response: " + res.status);
            this.errorMessage = "Failed to fetch section data."

          }
        } catch (error) {
          console.error("Error fetching data", error)
          this.errorMessage = "An error occurred while fetching section data."
        }
      },
  
      async submitForm() {
        try {
          const res = await fetch(`/delete-section/${this.$route.params.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          })
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to delete this section."

          } else if (res.ok) {
            const data = await res.json()
            this.$router.push('/')
            this.errorMessage = ''

          } else {
            console.error("Error response: " + res.status)
            this.errorMessage = "Error deleting section."

          }
        } catch (error) {
          console.error("Error deleting section", error)
          this.errorMessage = "An error occurred while deleting the section."
        }
      }
    }
  }
  
  export default DeleteSection
  