const Login = {
    template: `
    <div>
      <h1>Login</h1>
      <form @submit.prevent="submitInfo" method="post">
        <div>
          <label for="email">Email</label>
          <input type="email" v-model="email" id="email" required>
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" v-model="password" id="password" required>
        </div>
        <button @click='submitInfo'>Login</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>

    `,

    data() {
        return {
            email: "",
            password: "",
            message: "",
        }
    },

    methods: {
        async submitInfo() {
            const url = window.location.origin
            const res = await fetch(url+'/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: this.email, password: this.password })
            } )

            if (res.ok) {
              console.log("logged in")
            } else {
              console.error("Login Failed")
            }
        }
    }
}

export default Login;