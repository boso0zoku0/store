import './App.css'
import Layers from "./components/Parallax/Parallax.tsx";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import ShoppingCart from "./components/Cart/ShoppingCart.tsx";
import Navigation from './components/Navigation/Navigation.tsx'
import Requisites from "./components/Requisites/Requisites.tsx";
import Profile from "./components/Profile/Profile.tsx";
import ProductCards from "./components/ProductCard/ProductCard.tsx";
import ModalPurchase from "./components/ModalPurchase/ModalPurchase.tsx";
import Checkout from "./components/Checkout/Checkout.tsx";
import {ToastContainer} from "react-toastify";
import Login from "./components/Auth/Login/Login.tsx";
import Hero from "./components/Main/Main.tsx";
import ProductFilters from "./components/ProductFulter/Filter.tsx";
import Test from "./components/Example/Test.tsx";
import Register from "./components/Auth/Registrations/Registrations.tsx";
import Navbar from "./components/Navbar/Navbar.tsx";
import {AuthProvider} from "./contexts/AuthContexts.tsx";

function App() {

  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar/>
          <Routes>
            <Route path="/modal" element={<ModalPurchase isOpen={true} onClose={''} title={'qwwq'}/>}/>
            <Route path="/avatar" element={<Profile/>}/>
            <Route path="/page" element={<Layers/>}/>
            <Route path="/products" element={<ProductCards/>}/>
            <Route path="/checkout" element={<Checkout/>}/>
            <Route path={"/cart"} element={<ShoppingCart/>}/>
            <Route path={"/nav"} element={<Navigation/>}/>
            <Route path={"/requisites"} element={<Requisites/>}/>
            <Route path={"/login"} element={<Login/>}/>
            <Route path={"/register"} element={<Register/>}/>
            <Route path={"/profile"} element={<Profile/>}/>
            <Route path={"/"} element={<Hero/>}/>
            <Route path={"/test"} element={<Test/>}/>
            <Route path="/f" element={<ProductFilters onFilterChange={() => {
            }}/>}/>
            {/* остальные маршруты */}
          </Routes>
          <ToastContainer theme="dark"/>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
