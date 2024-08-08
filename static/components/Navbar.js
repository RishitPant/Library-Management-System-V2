const Navbar = {
    template : `
    <div>
    <nav>
    <router-link to='/'>Home</router-link>
    <router-link to='/login'>Login</router-link>
    <router-link to='/signup'>Signup</router-link>
    <router-link to='/logout'>Logout</router-link>
    <form @submit.prevent="doSearch" class="navbar-search">
          <input type="text" v-model="query" placeholder="Search..." />
          <button type="submit">Search</button>
    </form>
    </nav>
    </div>
    `,

    data() {
        return {
            query: ''
        }
    },

    methods: {
        doSearch() {
            if (this.query.trim()) {
                this.$router.push({ path: '/search', query: { query: this.query } })
            }
        }
    }
}

export default Navbar;