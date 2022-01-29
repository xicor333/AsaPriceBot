import WebSocket from "ws";
import { Pool } from "./tinychart";
import { WSPool } from "./tinychart";

const WEBSOCKET_URL = process.env.WEBSOCKET_URL;

export class AssetSocket {
  m_socket: WebSocket;
  m_pool: Pool;
  m_decoder: TextDecoder;
  m_valueChangeCallback: (pool: WSPool) => void;

  constructor(pool: Pool, callback: (pool: WSPool) => void) {
    this.m_pool = pool;
    this.m_socket = new WebSocket(`${WEBSOCKET_URL}/${pool.asset_1_id}`, {
      perMessageDeflate: false,
    });
    this.m_decoder = new TextDecoder("utf-8");
    this.m_valueChangeCallback = callback;
    this.m_socket.on("message", (data) => this.onMessage(data));
  }
  destroy(){
    this.m_socket.close()
    delete this.m_socket
  }
  onMessage(data) {
    const decoded = this.m_decoder.decode(data);
    this.checkPool(JSON.parse(decoded));
  }
  checkPool(data: any) {
    console.log(JSON.stringify(data))
    if (data.asset === this.m_pool.asset_1_id) {
      this.m_valueChangeCallback(data);
    }
  }
}
