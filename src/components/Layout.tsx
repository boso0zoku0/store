// components/Layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar/Navbar.tsx";
import ChatButton from "./WebSocket/ButtonChat/ButtonChat.tsx";

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <ChatButton />
    </div>
  );
}