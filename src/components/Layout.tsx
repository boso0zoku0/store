// components/Layout/Layout.tsx
import {Outlet} from 'react-router-dom';
import Navbar from "./Navbar/Navbar.tsx";
import ChatButton from "./WebSocket/Helper/ButtonChat/ButtonChat.tsx";
import {FloatingNotificationManager} from "./WebSocket/Notify/Manager.tsx";
import {useAuth} from "../contexts/Auth.tsx";
import NavbarMobile from "./Navbar/NavbarMobile.tsx";
import {useMediaQuery} from 'react-responsive';

export default function Layout() {
  const {isAuthenticated, user} = useAuth();
  const isMobile = useMediaQuery({maxWidth: 768})

  return (
    <div className="layout">
      {isMobile ? (
        <>
          <NavbarMobile isAuthenticated={isAuthenticated} user={user}/>
          <main>
            <Outlet/>
          </main>
          <ChatButton/>
          {isAuthenticated && user?.name && <FloatingNotificationManager/>}
        </>
      ) : (
        <>
          <Navbar isAuthenticated={isAuthenticated} user={user}/>
          <main>
            <Outlet/>
          </main>
          <ChatButton/>
          {isAuthenticated && user?.name && <FloatingNotificationManager/>}
        </>
      )}
    </div>
  )
}