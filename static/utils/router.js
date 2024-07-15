import Navbar from '../components/Navbar.js'
import Home from '../components/Home.js'
import Login from '../components/Login.js'
import Signup from '../components/Signup.js'
import Logout from '../components/Logout.js'


const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/logout', component: Logout },
]

const router = new VueRouter({
    routes,
})

export default router