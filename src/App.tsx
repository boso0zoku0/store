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
import Products from "./components/Example/ExampleProducts.tsx";
import Hero from "./components/Main/Main.tsx";

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
              <svg
                width="80"
                height="80"
                viewBox="10 10 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="logo"
              >
                {/* чашка */}
                <path
                  d="M32 48 L68 48 C68 48 72 30 50 30 C28 30 32 48 32 48 Z"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  fill="url(#clayGradient)"
                />
                {/* ручка */}
                <path
                  d="M68 38 L82 38 L82 48 L68 48"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  fill="none"
                />
                {/* пар волны */}
                <path
                  d="M45 25 L48 20 L52 20 L55 25"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M52 23 L55 19 L59 19 L62 23"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <defs>
                  <radialGradient id="clayGradient" cx="50" cy="40" r="25">
                    <stop offset="0%" stopColor="#E6C9A8"/>
                    <stop offset="100%" stopColor="#C67C4E"/>
                  </radialGradient>
                </defs>
              </svg>
              <li><a href="/products">Products</a></li>
              <li><a href="/cart">Buy</a></li>
              <li><a href="/requisites">Реквизиты Разработчика</a></li>
            </ul>
            <div className="navActions">
              <a href="/profile" className="profileLink" aria-label="Профиль">
                <Profile/>
              </a>
              <button className="themeToggle" onClick={handleToggleTheme}>
                <Moon size={25} className="themeIcon"/>
              </button>
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
