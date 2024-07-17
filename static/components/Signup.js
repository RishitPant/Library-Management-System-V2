import router from '../utils/router.js'

const Signup = {
    template: 
    `
    <div>
      <h1>Signup</h1>
      <form @submit.prevent="submitInfo" method="post">
        <div>
          <label for="email">Email</label>
          <input type="email" v-model="email" id="email" required>
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" v-model="password" id="password" required>
        </div>
        <button @click='submitInfo'>Signup</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
    `,

    data() {
        return {
            email: "",
            password: "",
            role: "user",
            message: ""
        }
    },

    methods: {
        async submitInfo() {
            const origin = window.location.origin
            const url = `${origin}/register`
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password,
                    role: this.role,
                }),
                credentials: "same-origin"
            })
            if (res.ok) {
                const data = await res.json()
                console.log(data)
                router.push("/login")
            } else {
                const errorData = await res.json()
                console.error("Signup failed:", errorData)
            }
        }
    }
}
export default Signup;