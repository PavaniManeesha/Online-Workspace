import io from "socket.io-client";
import { socket_api } from "../../Constant";

const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};
const ENDPOINT = socket_api;
const socket = io(ENDPOINT, connectionOptions);

export default socket;
