const EditSection = {
    template: `
    <div>
    <h2 v-if="errorMessage" style="text-align: center; color: red;">{{ errorMessage }}</h2>
      <div v-if="!errorMessage" >
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="Section ID">Section ID</label>
            <input type="text" v-model="section.id" name="section_id" required disabled />
          </div>
          <div class="form-group">
            <label for="Section Name">Section Name</label>
            <input type="text" v-model="section.section_name" name="section_name" required />
          </div>
          <div class="form-group">
            <label for="Section Description">Section Description</label>
            <input type="text" v-model="section.description" name="section_description" required />
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
        <button @click="goBack" class="btn btn-outline-dark">Back</button>
        <p v-if="errorMessage" style="color: red; text-align: center;">{{ errorMessage }}</p>
      </div>
      </div>
    `,
  
    data() {
      return {
        section: {
          id: "",
          section_name: "",
          description: "",
        },
        errorMessage: ''
      };
    },
  
    methods: {
      goBack() {
        this.$router.go(-1)
      },
  
      async fetchData() {
        try {
          const res = await fetch(`/edit-section/${this.$route.params.id}`, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            }
          })
  
          if (res.status === 403) {
            this.errorMessage = "You are not authorized to edit this section."

          } else if (res.ok) {

            const data = await res.json()
            this.section = data.section
            this.errorMessage = ''

          } else {
            console.log("Response was not ok")
          }
  
        } catch (error) {
          console.log("Error occurred in fetchData", error)
          this.errorMessage = "An error occurred while fetching the section data."
        }
      },
  
      async submitForm() {
        try {
          const res = await fetch(`/edit-section/${this.section.id}`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token')
            },
            body: JSON.stringify({
              section_name: this.section.section_name,
              description: this.section.description
            })
          })
  
          if (res.status === 403) {

            this.errorMessage = "You are not authorized to edit this section."

          } else if (res.ok) {

            console.log('Section updated successfully')
            this.$router.push({ name: 'adminview_all' })
            this.errorMessage = ''

          } else {

            const errorData = await res.json()
            console.error('Error updating section:', errorData)
            this.errorMessage = 'Failed to update section: ' + errorData.message
            
          }
  
        } catch (error) {
          console.error("Error submitting form:", error)
          this.errorMessage = 'An error occurred while submitting the form.'
        }
      }
    },
  
    mounted() {
      this.fetchData()
    }
  }
  
  export default EditSection
  