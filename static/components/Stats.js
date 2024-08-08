const Stats = {
    template: 
    `
    <div>
    <h1>Statistics</h1>
<ul>
    <li><h2>Total Users : {{total_users}}</h2></li>
    <li><h2>Total E-Books : {{total_books}}</h2></li>
    <li><h2>Total Sections : {{total_sections}}</h2></li>
<br>
    <h2>Books per section:</h2>
    <li v-for="([section, books], index) in sectionbooks" :key="index">
  <h3>{{ section }}: {{ books }}</h3>
</li>
</ul>
</div>
    `,

    data() {
        return {
            total_users: [],
            total_books: [],
            total_sections: [],
            sectionbooks: []
        }
    },

    created() {
        this.fetchData()
    },

    methods: {
        async fetchData() {
            const res = await fetch(`/stats`)

            if (res.ok) {
                const data = await res.json()
                this.total_users = data.total_users,
                this.total_books = data.total_books,
                this.total_sections = data.total_sections,
                this.sectionbooks = data.section_books
            } else {
                console.log("ERror occurred")
            }
        }
    }
}

export default Stats