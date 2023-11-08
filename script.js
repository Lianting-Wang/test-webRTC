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
const fileBtn = document.querySelector(".file-btn");
const files = document.querySelector("#file");

peer.on("open", () => {
  window.caststatus.textContent = `Your device ID is: ${peer.id}`;
});

const receivedData = (name) => (data) => {
  console.log(`${name} Received:`, data);
  if (data.file) {
    console.log(data.file);
    const blob = new Blob([data.file], { type: data.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.name;
    a.click();
    console.log(url);
    console.log(blob);
  }
}

peer.on("connection", (connection) => {
  console.log(connection);
  connection.on('data', receivedData('Receiver'));
  msgBtn.addEventListener("click", () => {
    const word = window.prompt("Please enter the word");
    connection.send(word);
  });
});

connBtn.addEventListener("click", () => {
  const code = window.prompt("Please enter the sharing code");
  conn = peer.connect(code);
  console.log(conn);
  conn.on('data', receivedData('Sender'));
  msgBtn.addEventListener("click", () => {
    const word = window.prompt("Please enter the word");
    conn.send(word);
  });
  fileBtn.addEventListener("click", () => {
    const file =files.files[0];
    conn.send({
      file: file,
      name: file.name,
      type: file.type,
    });
  });
});
