import Navbar from '../components/Navbar.js'
import Home from '../components/Home.js'
import Login from '../components/Login.js'
import Signup from '../components/Signup.js'
import Logout from '../components/Logout.js'
import MyBooks from '../components/MyBooks.js'
import Ratings from '../components/Ratings.js'
import ViewBook from '../components/ViewBook.js'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/logout', component: Logout },
    { path: '/my_books/:id', component: MyBooks },
    { path: '/:bookid/ratings', component: Ratings },
    { path: '/view/:bookid', component: ViewBook }
]

const router = new VueRouter({
    mode: 'hash',
    routes,
})

export default router