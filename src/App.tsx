import './App.css'
import Layers from "./components/Parallax/Parallax.tsx";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Moon} from "lucide-react";
import './App.css'
import ShoppingCart from "./components/Cart/ShoppingCart.tsx";
import Navigation from './components/Navigation/Navigation.tsx'
import Requisites from "./components/Requisites/Requisites.tsx";
import Profile from "./components/Profile/Profile.tsx";
import ProductCards from "./components/ProductCard/ProductCard.tsx";
import ModalPurchase from "./components/ModalPurchase/ModalPurchase.tsx";
import Checkout from "./components/Checkout/Checkout.tsx";
import {ToastContainer} from "react-toastify";
import {useEffect, useState} from "react";
import Login from "./components/Auth/Login/Login.tsx";
import Hero from "./components/Main/Main.tsx";
import ProductFilters from "./components/ProductFulter/Filter.tsx";

function App() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return document.documentElement.classList.contains('dark');
  });
  // Применяем тему при загрузке
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <>
      <div>
        <nav className="menu">
          <div className="navContainer">
            <ul className="navLinks">
              <li><a href="/products">Products</a></li>
              <li><a href="/cart">Buy</a></li>
              <li><a href="/requisites">Реквизиты Разработчика</a></li>
            </ul>
            <div className="navActions">
              <a href="/profile" className="profileLink" aria-label="Профиль">
                <Profile/>
              </a>
            </div>
          </div>
        </nav>
        <Router>
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
            <Route path={"/"} element={<Hero/>}/>
            <Route path="/f" element={<ProductFilters onFilterChange={() => {}} />} />

          </Routes>
        </Router>
      </div>
      <ToastContainer
        theme={isDark ? 'dark' : 'light'}
      />
    </>
  )
}

export default App
