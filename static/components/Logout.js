const Logout = {
    template: '<h1>Logout</h1>',

    async created() {
        const res = await fetch('/logout', {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (res.ok) {
            sessionStorage.clear()
            this.$router.push('/login');
        }
    }
}

export default Logout;