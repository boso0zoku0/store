import api from "../../../../utils/auth.tsx";

export const loadClients = async ({setClients}) => {
    try {
      const response = await api.get(`/get-clients`);
      const clientsList = await response.data

      setClients(
        clientsList.map((username: string) => ({
          username,
          isActive: true,
          unreadCount: 0,
        }))
      );
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
    }
  };