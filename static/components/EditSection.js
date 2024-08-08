const EditSection = {
    template: 
    `
    <div>
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
</div>
    `,

    data() {
        return {
            section: {
                id: "",
                section_name: "",
                description: "",
            }
        }
    },

    methods: {
        goBack() {
            this.$router.go(-1);
          },

        async fetchData() {
            try {
                const res = await fetch(`/edit-section/${this.$route.params.id}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (res.ok) {
                    const data = await res.json()
                    this.section = data.section
                } else {
                    console.log("Response was not ok")
                }

            } catch (error) {
                console.log("Error occurred in fetchData", error)
            }
        },

        async submitForm() {
            try {
                const res = await fetch(`/edit-section/${this.section.id}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        section_name: this.section.section_name,
                        description: this.section.description
                    })
                })

                if (res.ok) {
                    console.log('Section updated successfully');
                    this.$router.push({ name: 'adminview_all' });
                } else {
                    const errorData = await res.json();
                    console.error('Error updating section:', errorData);
                }
            } catch (error) {
                console.error("Error submitting form:", error)
            }
        }
    },

    mounted() {
        this.fetchData()
    }
}

export default EditSection