import './App.css' // ← Стили только для этого компонента
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
import {useState} from "react";

function App() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const handleToggleTheme = () => {
    document.documentElement.classList.toggle('dark');
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
