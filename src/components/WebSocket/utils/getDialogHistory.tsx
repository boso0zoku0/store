import {useEffect, useState} from "react";
import axios from "axios";
import api from "../../../utils/auth.tsx";

interface Message {
  id: string;
  message: string;
  username: string;
  timestamp: Date;
  isOwn: boolean;
  isButton?: boolean;
  type?: string; // 'system', 'bot', 'OperatorHelper', 'client', 'media'
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string
}
//
// export default function DialogHistory() {
//   const [message, setMessage] = useState<Message[]>([])
//
//   useEffect(() => {
//   api.get("/get-user-dialog", {withCredentials: true})
//     .then((response) => {
//       const messageTransform = response.data.map((data) => ({
//         id: data.id,
//         message: data.message,
//         username: data.username,
//         timestamp: new Date(data.created_at),
//         isOwn: data.type_message == 'client',
//         type: data.type_message
//       }))
//       setMessages(messageTransform)
//     })
//
// }