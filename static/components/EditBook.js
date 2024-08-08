const EditBook = {
    template: 
    `
    <div class="centered-form" style="margin-top: 10px;">
      <h2 style="text-align: center; margin-top: 10px">Edit Book</h2>
      <hr>
      <form @submit.prevent="submitForm" enctype="multipart/form-data">
        <div class="form-group">
          <label for="name">Book Name:</label><br />
          <input class="form-control" type="text" id="name" v-model="book.name" required /><br />
        </div>
        <div class="form-group">
          <label for="content">Content (PDF):</label><br />
          <input type="file" id="content" @change="handleFileUpload($event, 'content')" /><br />
        </div>
        <div class="form-group">
          <label for="authors">Authors:</label><br />
          <input class="form-control" type="text" id="authors" v-model="book.authors" required /><br />
        </div>
        <div class="form-group">
          <label for="num_of_pages">Number of Pages:</label><br />
          <input class="form-control" type="number" id="num_of_pages" v-model="book.num_of_pages" required /><br />
        </div>
        <div class="form-group">
          <label for="section_id">Section:</label><br />
          <select class="form-control" id="section_id" v-model="book.section_id" required>
            <option v-for="section in sections" :key="section.id" :value="section.id">
              {{ section.section_name }}
            </option>
          </select><br />
        </div>
        <div class="form-group">
          <label for="book_img">Book Image:</label><br />
          <input type="file" id="book_img" @change="handleFileUpload($event, 'book_img')" accept="image/*" /><br />
        </div>
        <input type="submit" class="btn btn-primary" value="Update Book" />
      </form>
      <br>
      <button @click="goBack" class="btn btn-outline-dark">Back</button>
    </div>
    `,

    data() {
        return {
          book: {
            name: '',
            authors: '',
            num_of_pages: '',
            section_id: '',
            book_img: null,
            content: null
          },
          sections: [],
          originalContent: null,
          originalImage: null
        };
      },
      created() {
        this.fetchBook();
        this.fetchSections();
      },
      methods: {
        goBack() {
          this.$router.go(-1);
        },
        async fetchBook() {
          const bookId = this.$route.params.id; // Assume the book ID is passed as a route parameter
          try {
            const res = await fetch(`/edit-book/${bookId}`);
            if (res.ok) {
              const data = await res.json();
              this.book = data.book;
              this.originalContent = data.book.content;
              this.originalImage = data.book.book_img;
            } else {
              console.error('Error fetching book data');
            }
          } catch (error) {
            console.error('Error fetching book data:', error);
          }
        },
        async fetchSections() {
          try {
            const res = await fetch(`/edit-book/${this.$route.params.id}`);
            if (res.ok) {
              const data = await res.json();
              this.sections = data.sections;
            } else {
              console.error('Error fetching sections');
            }
          } catch (error) {
            console.error('Error fetching sections:', error);
          }
        },
        handleFileUpload(event, fieldName) {
          this.book[fieldName] = event.target.files[0];
        },
        async submitForm() {
          const formData = new FormData();
          formData.append('name', this.book.name);
          formData.append('authors', this.book.authors);
          formData.append('num_of_pages', this.book.num_of_pages);
          formData.append('section_id', this.book.section_id);
          if (this.book.content !== this.originalContent) {
            formData.append('content', this.book.content);
          }
          if (this.book.book_img !== this.originalImage) {
            formData.append('book_img', this.book.book_img);
          }
    
          try {
            const res = await fetch(`/edit-book/${this.book.id}`, {
              method: 'PUT',
              body: formData
            });
    
            if (res.ok) {
              console.log('Book updated successfully');
              this.$router.push({ name: 'adminview_all' });
            } else {
              const errorData = await res.json();
              console.error('Error updating book:', errorData);
            }
          } catch (error) {
            console.error('Error submitting form:', error);
          }
        }
      }
    };
    
    export default EditBook;