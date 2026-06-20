import './App.css'
import Layers from "./components/Parallax/Parallax.tsx";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import Cart from "./components/Cart/Cart.tsx";
import Navigation from './components/Navigation/Navigation.tsx'
import Profile from "./components/Profile/Profile.tsx";
import ProfileMobile from "./components/Profile/ProfileMobile.tsx";
import Products from "./components/Products/Products.tsx";
import ModalPurchase from "./components/ModalPurchase/ModalPurchase.tsx";
import Checkout from "./components/Checkout/Checkout.tsx";
import {ToastContainer} from "react-toastify";
import Login from "./components/Auth/Login/Login.tsx";
import ProductFilters from "./components/ProductFulter/Filter.tsx";
import Register from "./components/Auth/Registrations/Registrations.tsx";
import {AuthProvider} from "./contexts/Auth.tsx";
import Layout from "./components/Layout.tsx";
import {LeftSidebar} from "./learn/Learn.tsx";
import {WsNotifyProvider} from "./contexts/SocketNotify.tsx";
import WSFriendlyProvider from "./contexts/SocketFriendly.tsx";
import {useMediaQuery} from 'react-responsive';
import {useEffect, useState} from "react";
import CartMobile from "./components/Cart/CartMobile.tsx";


function App() {
  const isMobile = useMediaQuery({maxWidth: 768});

  return (
    <AuthProvider>
      <WSFriendlyProvider>
        <WsNotifyProvider>
          <Router>
            <div>
              <Routes>
                <Route path="/" element={<Layout/>}>
                  <Route path={"/profile/:id"} element={isMobile ? <ProfileMobile/> : <Profile/>}/>
                  <Route path="/modal" element={<ModalPurchase isOpen={true} onClose={''} title={'qwwq'}/>}/>
                  <Route path="/page" element={<Layers/>}/>
                  <Route path="/products" element={<Products/>}/>
                  <Route path="/checkout" element={<Checkout/>}/>
                  <Route path={"/cart"} element={isMobile ? <CartMobile/> : <Cart/>}/>
                  <Route path={"/nav"} element={<Navigation/>}/>
                  {/*<Route path={"/requisites"} element={<Requisites/>}/>*/}
                  <Route path={"/login"} element={<Login/>}/>
                  <Route path={"/register"} element={<Register/>}/>
                  {/*<Route path={"/"} element={<Hero/>}/>*/}
                  <Route path={"/l"} element={<LeftSidebar/>}/>
                  <Route path="/f" element={<ProductFilters onFilterChange={() => {
                  }}/>}/>
                </ Route>
              </Routes>
              <ToastContainer theme="dark"/>
            </div>
          </Router>
        </WsNotifyProvider>
      </WSFriendlyProvider>
    </AuthProvider>
  )
}

export default App
