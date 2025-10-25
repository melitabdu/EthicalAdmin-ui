import { io } from "socket.io-client";

// ✅ Automatically switch between local and deployed backend
const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000" // local backend during development
    : "https://home-service-backend-3qy2.onrender.com"; // deployed backend

// ✅ Create socket instance
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on("connect", () => {
  console.log("✅ Connected to socket server:", SOCKET_URL);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket server");
});

export default socket;
