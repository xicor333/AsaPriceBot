import WebSocket from "ws";
import { Pool } from "./tinychart";
import { WSPool } from "./tinychart";

const WEBSOCKET_URL = process.env.WEBSOCKET_URL;

export class AssetSocket {
  m_socket: WebSocket;
  m_assetId: number;
  m_decoder: TextDecoder;
  m_poolId: number;
  m_valueChangeCallback: (pool: WSPool) => void;

  constructor(
    assetId: number,
    poolId: number,
    callback: (pool: WSPool) => void
  ) {
    this.m_assetId = assetId;
    this.m_poolId = poolId;
    this.m_decoder = new TextDecoder("utf-8");
    this.m_valueChangeCallback = callback;
    this.createSocket();
  }

  destroy() {
    this.m_socket.close();
    delete this.m_socket;
    this.m_socket = undefined;
  }
  createSocket() {
    console.log("Creating Socket: "+this.m_assetId+" "+this.m_poolId)
    this.m_socket = new WebSocket(`${WEBSOCKET_URL}/${this.m_assetId}`, {
      perMessageDeflate: false,
    });
    this.m_socket.on("message", (data) => this.onMessage(data));
    const interval = setInterval(() => {
      this.m_socket.ping();
    }, 30000);

    this.m_socket.on("close", () => {
      console.log("Socket closed");
      if (this.m_socket) {
        delete this.m_socket;
        setTimeout(() => this.createSocket, 60000);
      }
      clearInterval(interval);
    });
    this.m_socket.on("ping", () => {
      console.log("recieved ping");
    });
    // this.m_socket.on("pong", () => {
      // console.log("Recieved pong");
    // });
  }
  onMessage(msg) {
    const decoded = this.m_decoder.decode(msg);
    this.checkPool(JSON.parse(decoded));
  }
  checkPool(msg: any) {
    if(msg.type!='r')
      return;
    if (msg.data.asset === this.m_assetId && msg.data.pool === this.m_poolId) {
      this.m_valueChangeCallback(msg.data);
    }
  }
}
