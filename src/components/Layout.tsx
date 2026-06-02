// components/Layout/Layout.tsx
import {Outlet} from 'react-router-dom';
import Navbar from "./Navbar/Navbar.tsx";
import ChatButton from "./WebSocket/Helper/ButtonChat/ButtonChat.tsx";
import {FloatingNotificationManager} from "./WebSocket/Notify/Manager.tsx";
import {useAuth} from "../contexts/AuthContexts.tsx";
import NavbarMobile from "./Navbar/NavbarMobile.tsx";
import {useMediaQuery} from 'react-responsive';

export default function Layout() {
  const {isAuthenticated, isLoading, user} = useAuth();
  const isMobile = useMediaQuery({maxWidth: 768})

  return (
    <div className="layout">
      {isMobile ? (
        <>
          <main className="main-content">
            <NavbarMobile isAuthenticated={isAuthenticated} user={user}/>
            <Outlet/>
          </main>
          <ChatButton/>
          {isAuthenticated && user?.name && <FloatingNotificationManager/>}
        </>
      ) : (
        <>
          <Navbar isAuthenticated={isAuthenticated} isLoading={isLoading} user={user}/>
          <main className="main-content">
            <Outlet/>
          </main>
          <ChatButton/>
          {isAuthenticated && user?.name && <FloatingNotificationManager/>}
        </>
      )}
    </div>
  )
}