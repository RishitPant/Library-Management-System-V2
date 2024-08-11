const AddSection = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="section_name">Section Name:</label><br>
            <input class="form-control" type="text" id="section_name" v-model="section_name" required><br>
          </div>
          <div class="form-group">
            <label for="description">Description:</label><br>
            <textarea class="form-control" id="description" v-model="description" required></textarea><br>
          </div>
          <input type="submit" class="btn btn-primary" value="Add Section">
        </form>
        <br>
        <button class="btn btn-outline-dark" @click="goBack">Back</button>
        <p v-if="errorMessage" style="color: red; text-align: center;">{{ errorMessage }}</p>
      </div>
      </div>
    `,
  
    data() {
      return {
        section_name: "",
        description: "",
        errorMessage: ''
      };
    },
  
    methods: {
      async submitForm() {
        try {
          const res = await fetch('/add-section', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            },
            body: JSON.stringify({
              section_name: this.section_name,
              description: this.description
            })
          })
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to add a section."

          } else if (res.ok) {
            const data = await res.json()
            console.log(data.message)

            this.section_name = ''
            this.description = ''
            this.errorMessage = ''

          } else {
            const errorData = await res.json()
            console.error('Error adding section:', errorData.message)
            this.errorMessage = 'Failed to add section: ' + errorData.message
          }
          
        } catch (error) {
          console.error('Error submitting form:', error)
          this.errorMessage = 'An error occurred while submitting the form.'
        }
      },
  
      goBack() {
        this.$router.go(-1)
      }
    }
  }
  
  export default AddSection
  