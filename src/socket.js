import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : import.meta.env.VITE_API_BASE_URL;   // ⬅ auto-uses Railway URL

const socket = io(SOCKET_URL, {
  transports: ["websocket"],   // ⬅ NO POLLING IN PRODUCTION
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,  // ⬅ Stable auto-reconnect
  reconnectionDelay: 500,          // ⬅ Faster reconnect
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

export default socket;
