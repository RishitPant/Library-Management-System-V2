const SearchBook = {
    template: 
    `
    <div>
      <h2>Search Results</h2>

        <div v-if="bookSearchResults.length === 0 && sectionBookResults.length === 0">
          <p>No results found.</p>
        </div>
        <div v-else>
          <h3>Books</h3>
          <div class="container">
            <div class="row">
              <div v-for="book in bookSearchResults" :key="book.id" class="col-md-4">
                <div class="card mb-4 shadow-sm">
                  <img
                    v-if="book.book_img"
                    class="card-img-top"
                    :src="imageUrl(book.book_img)"
                    alt="Card image cap"
                  />
                  <img
                    v-else
                    class="card-img-top"
                    src="/static/images/not_available.png"
                    alt="Card image cap"
                  />
                  <div class="card-body">
                    <h5 class="card-title">{{ book.name }}</h5>
                    <p class="card-text">Author: {{ book.authors }}</p>
                    <p class="card-text">Section: {{ book.section_name }}</p>
                    <p class="card-text">Rating: {{ bookRatingDict[book.id] || 'No ratings' }}/5</p>
                    <div>
                      <router-link :to="'/buy-book/' + book.id " >Buy</router-link>
                      <button class="btn btn-primary" @click="requestBook(book.id)">Request</button>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <h3>Books in Sections</h3>
          <div class="container">
            <div class="row">
              <div v-for="book in sectionBookResults" :key="book.id" class="col-md-4">
                <div class="card mb-4 shadow-sm">
                  <img
                    v-if="book.book_img"
                    class="card-img-top"
                    :src="imageUrl(book.book_img)"
                    alt="Card image cap"
                  />
                  <img
                    v-else
                    class="card-img-top"
                    src="/static/images/not_available.png"
                    alt="Card image cap"
                  />
                  <div class="card-body">
                    <h5 class="card-title">{{ book.name }}</h5>
                    <p class="card-text">Author: {{ book.authors }}</p>
                    <p class="card-text">Section: {{ book.section_name }}</p>
                    <p class="card-text">Rating: {{ bookRatingDict[book.id] || 'No ratings' }}/5</p>
                    <div>
                      <router-link :to="'/buy-book/' + book.id " >Buy</router-link>
                      <button class="btn btn-primary" @click="requestBook(book.id)">Request</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    `,

    data() {
        return {
          query: this.$route.query.query || '',
          bookSearchResults: [],
          sectionBookResults: [],
          bookRatingDict: {},
          loading: true,
          error: ''
        };
      },
    
      async created() {
        await this.doSearch();
      },
    
      methods: {
        async doSearch() {
          try {
            const res = await fetch(`/search?query=${encodeURIComponent(this.query)}`);
            
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
    
            const data = await res.json();
    
            this.bookSearchResults = data.book_search;
            this.sectionBookResults = data.section_books_result;
            this.bookRatingDict = data.book_rating_dict;
    
            console.log('Search Results:', data);

          } catch (error) {
            this.error = 'An error occurred while fetching search results.';
            console.error(error);
          }
        },

        imageUrl(image) {
            return image ? `/static/images/${image}` : '/static/images/not_available.png';
          },
        
        async requestBook(bookId){
          const res = await fetch(`/request_book/${bookId}`, {
            method: "POST",
            action: "request",
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (res.ok) {
            const data = await res.json()
            console.log("rquest successful", data)
          } else {
            console.log("Some error")
          }
        }
      }
}

export default SearchBook