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
import Register from "./components/Auth/Registrations/Registrations.tsx";
import {AuthProvider} from "./contexts/AuthContexts.tsx";
import Layout from "./components/Layout.tsx";
import {LeftSidebar} from "./learn/Learn.tsx";

// import {NotificationManager} from "./components/NotificationManager/Manager.tsx";


function App() {

  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Layout/>}>
              <Route path="/modal" element={<ModalPurchase isOpen={true} onClose={''} title={'qwwq'}/>}/>
              <Route path="/page" element={<Layers/>}/>
              <Route path="/products" element={<ProductCards/>}/>
              <Route path="/checkout" element={<Checkout/>}/>
              <Route path={"/cart"} element={<ShoppingCart/>}/>
              <Route path={"/nav"} element={<Navigation/>}/>
              <Route path={"/requisites"} element={<Requisites/>}/>
              <Route path={"/login"} element={<Login/>}/>
              <Route path={"/register"} element={<Register/>}/>
              <Route path={"/profile/:id"} element={<Profile/>}/>
              <Route path={"/"} element={<Hero/>}/>
              <Route path={"/l"} element={<LeftSidebar/>}/>
              <Route path="/f" element={<ProductFilters onFilterChange={() => {
              }}/>}/>
            </ Route>
          </Routes>
          <ToastContainer theme="dark"/>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
