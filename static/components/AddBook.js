const AddBook = {
    template: `
      <div class="centered-form" style="margin-top: 10px;">
        <h2 style="text-align: center; margin-top: 10px">Add book</h2>
        <hr>
        <form @submit.prevent="submitForm" enctype="multipart/form-data">
          <div class="form-group">
            <label for="name">Book Name:</label><br />
            <input class="form-control" type="text" id="name" v-model="name" required /><br />
          </div>
          <div class="form-group">
            <label for="authors">Authors:</label><br />
            <input class="form-control" type="text" id="authors" v-model="authors" required /><br />
          </div>
          <div class="form-group">
            <label for="content">Content:</label><br />
            <input type="file" id="content" @change="fileUpload" required /><br />
          </div>
          <div class="form-group">
            <label for="num_of_pages">Number of Pages:</label><br />
            <input class="form-control" type="number" id="num_of_pages" v-model="num_of_pages" required /><br />
          </div>
          <div class="form-group">
            <label for="section_id">Section ID:</label><br />
            <select class="form-control" id="section_id" v-model="section_id" required>
              <option v-for="(section, index) in sections" :key="index" :value="section.id">{{ section.section_name }}</option>
            </select><br />
          </div>
          <div class="form-group">
            <label for="book_img">Book Image:</label><br />
            <input type="file" id="book_img" @change="imageUpload" accept="image/*" required /><br />
          </div>
          <input type="submit" class="btn btn-primary" value="Add Book" />
        </form>
        <br>
        <button @click="goBack" class="btn btn-outline-dark">Back</button>
      </div>
    `,
    data() {
      return {
        sections: [],
        name: '',
        authors: '',
        content: null,
        num_of_pages: null,
        section_id: null,
        book_img: null,
      };
    },
    created() {
      this.fetchSections();
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },
      async fetchSections() {
        try {
          const res = await fetch('/add_book', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (res.ok) {
            const data = await res.json();
            this.sections = data.sections;
          } else {
            console.log('Some error fetching sections');
          }
        } catch (error) {
          console.log('Error from catch', error);
        }
      },

      fileUpload(event) {
        this.content = event.target.files[0];
      },

      imageUpload(event) {
        this.book_img = event.target.files[0];
      },

      async submitForm() {
        const formData = new FormData();
        formData.append('name', this.name);
        formData.append('authors', this.authors);
        formData.append('content', this.content);
        formData.append('num_of_pages', this.num_of_pages);
        formData.append('section_id', this.section_id);
        formData.append('book_img', this.book_img);
  
        try {
          const res = await fetch('/add_book', {
            method: 'POST',
            body: formData,
          });
  
          if (res.ok) {
            this.$router.push({ name: 'adminview_all' });
          } else {
            console.log('Failed to add book');
          }
        } catch (error) {
          console.log('Error from catch', error);
        }
      },
    },
  };
  
  export default AddBook;
  