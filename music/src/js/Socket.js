import { io } from 'socket.io-client';
 
let socket;
 
export function socketInstance() {
  socket = io(import.meta.env.VITE_SOCKET_API_URL, {
    transports: ['websocket'],//默认是HTTP轮训，设置这个就是为ws
    upgrade: false,//关闭自动升级ws，开启的话监听的通过消息会收不到
    query: { //通过参数的形式传参
    //   token: token,
    //   userId: userId,
    },
  });
  socket.on("connect",()=>{
    console.log("socket->已连接{}",socket.id);
  })

  socket.on("disconnect",()=>{
    console.log("socket->已断开");
  })
  return socket;
}

export function getSocket() {
    return socket;
}