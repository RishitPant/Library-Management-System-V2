const DeleteSection = {
    template: 
    `
    <div>
    <h2>Delete Section</h2>

  <p>Are you sure you want to delete {{ section.section_name }}?</p>

  <form @submit.prevent="submitForm">
    <input type="submit" class="btn btn-danger" value="Yes, Delete">
  </form>

  <button class="btn btn-dark" @click="goBack">No, Cancel</button>

    </div>
    `,

    data() {
        return {
            section: {
                id: "",
                section_name: "",
                description: ""
            }
        }
    },

    mounted() {
        this.fetchData();
    },

    methods: {
        async fetchData() {
            try {
                const res = await fetch(`/delete-section/${this.$route.params.id}`)
                
                if (res.ok) {
                    const data = await res.json()
                    this.section = data.section
                } else {
                    console.log("Error response")
                }


            } catch (error){
                console.error("Error fetching data", error)
            }
        },

        async submitForm() {
            try {
                const res = await fetch(`/delete-section/${this.$route.params.id}`, {
                    method: 'POST',
                });
                if (res.ok) {
                    const data = await res.json();
                    alert(data.message);
                    this.$router.push('/'); // Redirect to the desired route after deletion
                } else {
                    console.log("Error response: " + res.status);
                    alert("Error deleting section.");
                }
            } catch (error) {
                console.error("Error deleting section", error);
                alert("Error deleting section.");
            }
        },
        goBack() {
            this.$router.go(-1); // Go back to the previous page
        }
    }
}

export default DeleteSection