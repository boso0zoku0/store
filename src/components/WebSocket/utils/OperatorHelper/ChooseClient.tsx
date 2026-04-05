import type {Client} from "../../interfaces.tsx";
import React from "react";

type SelectClientProps = {
  operatorName: string;
  clientName: string | null;
  ws: WebSocket | null;
  setSelectedClient: React.Dispatch<React.SetStateAction<string | null>>;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
};

// Выбор клиента
export const chooseClient = ({operatorName, clientName, ws, setSelectedClient, setClients}: SelectClientProps) => {
  setSelectedClient(clientName);
  const messageData: any = {
    type: "notify_connect_to_client",
    from: operatorName,
    to: clientName,
  };
  ws.send(JSON.stringify(messageData));
  // Сбрасываем счетчик непрочитанных
  setClients((prev) =>
    prev.map((c) => (c.username === clientName ? {...c, unreadCount: 0} : c))
  );
};