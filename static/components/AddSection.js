const AddSection = {
    template: `
    <div>
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
    </div>
    `,

    data() {
        return {
            section_name: "",
            description: ""
        };
    },

    methods: {
        async submitForm() {
            try {
                const res = await fetch('/add-section', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        section_name: this.section_name,
                        description: this.description
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log(data.message);
                    // Navigate to another route or reset form, etc.
                } else {
                    const errorData = await res.json();
                    console.error('Error adding section:', errorData.message);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        },
        
        goBack() {
            this.$router.go(-1)
        }
    }
};

export default AddSection