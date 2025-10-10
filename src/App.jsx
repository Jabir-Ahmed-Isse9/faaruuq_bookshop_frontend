import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./utils/themeContext";
import { SidebarProvider } from "./utils/sidebarContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import AddBookForm from "./pages/AddBookForm";
import Categories from "./pages/Categories";
import AddCategoryForm from "./components/addCategory";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import UserPage from "./pages/UserPage";
import Orders from "./pages/Orders";
import AllProductsPage from "./components/allProducts";
import AuthForm from "./components/login";
import DashboardLayout from "./components/DashboardLayout";
import AdminRoute from "./components/AdminRoutes";
import Coupons from "./pages/Coupons";
import UserOrders from "./components/UserOrders";
import CheckOutPage from "./components/CheckOutpage";
import PaymentReturn from "./pages/PaymentReturn";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminLayout from "./utils/AdminLayout";
import Products from "./pages/Products";
import About from "./pages/About";
import SalesSummary from "./components/SalesSummary";
import TopBooksReport from "./components/TopBooksReport";
import SalesByLanguage from "./Reports/SalesByLanguage";
import BookDetail from "./pages/BookDetails";
import Stationary from "./components/Stationary";
import StationaryDetail from "./pages/StationaryDetail";

const App = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          {/* ✅ Toastify Container — works app-wide */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />

          <Routes>
            {/* Public */}
            <Route path="/" element={<UserPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/userorders" element={<UserOrders />} />
            <Route path="/about" element={<About />} />
            <Route path="/checkout" element={<CheckOutPage />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/book/:id" element={<BookDetail/>}/>
            <Route path="/stationery" element={<Stationary/>}/>
            <Route path="/stationery/:id" element={<StationaryDetail />} />



            {/* Admin */}
            <Route
              path="/dashboard/*"
              element={
                <AdminRoute>
                  <DashboardLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="categories" element={<Categories />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="reports/sales" element={<SalesSummary/>}/>
              <Route path="reports/books" element={<TopBooksReport/>}/>
              <Route path="reports/languages" element={<SalesByLanguage/>}/>
              <Route
                path="orders"
                element={
                  <AdminLayout>
                    <Orders />
                  </AdminLayout>
                }
              />
              <Route path="coupons" element={<Coupons />} />
            </Route>

            {/* Standalone */}
            <Route path="/add-book" element={<AddBookForm />} />
            <Route path="/add-category" element={<AddCategoryForm />} />
          </Routes>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;
