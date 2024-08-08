import router from '../utils/router.js'

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
        <button type="submit">Login</button>
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
            const res = await fetch(url+'/user-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: this.email, password: this.password })
            } )

            if (res.ok) {
              const data = await res.json()

              sessionStorage.setItem("token", data.token)
              sessionStorage.setItem("role", data.role)
              sessionStorage.setItem("email", data.email)
              sessionStorage.setItem("id", data.id)

              console.log(sessionStorage.getItem("role"))
              
              router.push(`/my_books/${data.id}`)

            } else {
              console.error("Login Failed")
            }
        }
    }
}

export default Login;