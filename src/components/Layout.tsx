// components/Layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar/Navbar.tsx";
import ChatButton from "./WebSocket/Helper/ButtonChat/ButtonChat.tsx";
// import {FloatingNotificationManager} from "./WebSocket/Notify/Manager.tsx";
import {useAuth} from "../contexts/AuthContexts.tsx";

export default function Layout() {
  const {isAuthenticated, isLoading, user} = useAuth();

  return (
    <div className="layout">
      <Navbar isAuthenticated={isAuthenticated} isLoading={isLoading} user={user}/>
      <main className="main-content">
        <Outlet />
      </main>
      <ChatButton />
      {/*{isAuthenticated && (*/}
      {/*  <FloatingNotificationManager username={user?.name} productName={user?.phone} urlId={user?.url_id}/>*/}
      {/*)}*/}
    </div>
  );
}