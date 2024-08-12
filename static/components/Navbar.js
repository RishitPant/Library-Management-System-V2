const Navbar = {
    template : `
    <div>
      <nav>
      <router-link to="/">Home</router-link>

      <router-link v-if="isAdmin" to="/admin_dashboard">Admin Dashboard</router-link>
      <router-link v-if="isAdmin" to="/add_book">Add Book</router-link>
      <router-link v-if="isAdmin" to="/add-section">Add Section</router-link>
      <router-link v-if="isAdmin" to="/book_requests">Book Requests</router-link>
      <router-link v-if="isAdmin" to="/stats">Statistics</router-link>
    <router-link v-if="isAdmin" to="/export-csv"><button>Export CSV</button></router-link>
      
    
      <router-link v-if="isUser" :to="'/my_books/' + userid">My Books</router-link>
      <router-link v-if="isUser" :to="'/books'">Books</router-link>

      <router-link v-if="!isLoggedIn" to="/signup">Signup</router-link>
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>

      <router-link v-if="isLoggedIn" to="/logout">Logout</router-link>

      <form v-if="isUser" @submit.prevent="doSearch" class="navbar-search">
        <input type="text" v-model="query" placeholder="Search..." />
        <button type="submit">Search</button>
      </form>
    </nav>
    </div>
    `,

    data() {
        return {
            query: '',
            userid: sessionStorage.getItem("id")
        }
    },


    computed: {
    showAuthLinks() {
        return this.$route.path === '/';
    },

    isAdmin() {
        return sessionStorage.getItem('role') === 'admin';
    },

    isUser() {
        return sessionStorage.getItem('role') === 'user'
    },


    isLoggedIn() {
        return !!sessionStorage.getItem('token');
    },
},

    methods: {
        doSearch() {
            if (this.query.trim()) {
                this.$router.push({ path: '/search', query: { query: this.query } })
            }
        },
    }
}

export default Navbar;