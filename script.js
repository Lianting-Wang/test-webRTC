const peer = new Peer(
  `${Math.floor(Math.random() * 2 ** 18)
    .toString(36)
    .padStart(4, 0)}`,
  {
    host: "0.peerjs.com",
    debug: 1,
    path: "/",
  },
);

// const peer = new Peer(
//   `${Math.floor(Math.random() * 2 ** 18)
//     .toString(36)
//     .padStart(4, 0)}`,
//   {
//     host: "192.168.76.12",
//     debug: 1,
//     path: "/myapp",
//   },
// );

window.peer = peer;

let conn;
const connBtn = document.querySelector(".conn-btn");
const msgBtn = document.querySelector(".msg-btn");

peer.on("open", () => {
  window.caststatus.textContent = `Your device ID is: ${peer.id}`;
});

peer.on("connection", (connection) => {
  console.log(connection);
  connection.on('data', (data) => {
    console.log('Received123:', data);
  });
  msgBtn.addEventListener("click", () => {
    const word = window.prompt("Please enter the word");
    connection.send(word);
  });
});

connBtn.addEventListener("click", () => {
  const code = window.prompt("Please enter the sharing code");
  conn = peer.connect(code);
  console.log(conn);
  conn.on('data', (data) => {
    console.log('Receivedasjbia:', data);
  });
  msgBtn.addEventListener("click", () => {
    const word = window.prompt("Please enter the word");
    conn.send(word);
  });
});
