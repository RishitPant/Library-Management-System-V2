import Navbar from '../components/Navbar.js'
import Home from '../components/Home.js'
import Login from '../components/Login.js'
import Signup from '../components/Signup.js'
import Logout from '../components/Logout.js'
import MyBooks from '../components/MyBooks.js'
import Ratings from '../components/Ratings.js'
import ViewBook from '../components/ViewBook.js'
import BuyBook from '../components/BuyBook.js'
import Books from '../components/Books.js'
import AdminDashboard from '../components/AdminDashboard.js'
import AddBook from '../components/AddBook.js'
import EditBook from '../components/EditBook.js'
import EditSection from '../components/EditSection.js'
import AddSection from '../components/AddSection.js'
import DeleteSection from '../components/DeleteSection.js'
import DeleteBook from '../components/DeleteBook.js'
import BookRequests from '../components/BookRequests.js'
import SearchBook from '../components/SearchBook.js'
import SectionBooks from '../components/SectionBooks.js'
import Stats from '../components/Stats.js'
import ExportCSV from '../components/ExportCSV.js'


const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/logout', component: Logout },
    { path: '/my_books/:id', component: MyBooks },
    { path: '/:bookid/ratings', component: Ratings },
    { path: '/view/:bookid', component: ViewBook },
    { path: '/buy-book/:bookid', component: BuyBook },
    { path: '/books', component: Books },
    { path: '/admin_dashboard', component: AdminDashboard },
    { path: '/add_book', component: AddBook },
    { path: '/edit-book/:id', component: EditBook },
    { path: '/edit-section/:id', component: EditSection },
    { path: '/add-section', component: AddSection },
    { path: '/delete-section/:id', component: DeleteSection },
    { path: '/delete-book/:id', component: DeleteBook },
    { path: '/book_requests', component: BookRequests },
    { path: '/approve_request/:request_id', component: BookRequests },
    { path: '/reject_request/:request_id', component: BookRequests },
    { path: '/search', component: SearchBook },
    { path: '/section/:section_id', component: SectionBooks },
    { path: '/stats', component: Stats },
    { path: '/export-csv', component: ExportCSV }
]

const router = new VueRouter({
    mode: 'hash',
    routes,
})

export default router