const chunkSize = 1024*1024;

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
//     port: 9000,
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

const datas = new Map();

const receivedData = (name) => (data) => {
  console.log(`${name} Received:`, data);
  if (data.file) {
    if (!datas.has(data.hash)) {
      datas.set(data.hash, {
        name: data.name,
        type: data.type,
        size: data.size,
        nums: data.nums,
        data: new Map()
      });
    }
    const file = datas.get(data.hash);
    if (file.data.has(data.index)) {
      return;
    }
    console.log(data.file);
    file.data.set(data.index, data.file);
    if (file.data.size === file.nums) {
      const orderedBlobs = [];
      for (let i = 0; i < file.nums; i++) {
        orderedBlobs.push(file.data.get(i));
      }
      console.log(orderedBlobs);
      console.log(file);
      const fullBlob = new Blob(orderedBlobs, { type: file.type });
      const url = URL.createObjectURL(fullBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      console.log(fullBlob);
    }
  }
}

const createChunks = (file, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < file.size; i += chunkSize) {
    chunks.push({
      index: Math.ceil(i / chunkSize),
      data: file.slice(i, i + chunkSize)
    });
  }
  return chunks;
};

files.addEventListener('change', async function(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  console.log(file.size);
  console.log(createChunks(file, chunkSize));
});

const findHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const contents = e.target.result;
      const hashBuffer = await crypto.subtle.digest('SHA-256', contents);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      console.log(hashHex);
      resolve(hashHex);
    };
    reader.onerror = function(e) {
      console.error("File could not be read! Code " + e.target.error);
      reject(e.target.error);
    };
    reader.readAsArrayBuffer(file);
  });
};

const sendFile = async (conn, file) => {
  const chunks = createChunks(file, chunkSize);
  const TOTAL_PARTS = chunks.length;
  const hash = await findHash(file);
  conn.send({
    hash,
    index: chunks[0].index,
    name: file.name,
    type: file.type,
    size: file.size,
    nums: TOTAL_PARTS,
    file: chunks[0].data,
  });
  for (let i = 1; i < TOTAL_PARTS; i++) {
    conn.send({
      hash,
      index: chunks[i].index,
      file: chunks[i].data,
    });
  }
};

const connProcesser = (name) => (conn) => {
  console.log(conn);
  conn.on('error', (err) => {
    console.error('Connection error:', err);
    conn.close();
  });
  conn.on('close', () => {
    console.log('Connection closed');
  });
  conn.on('data', receivedData(name));
  msgBtn.addEventListener("click", () => {
    const word = window.prompt("Please enter the word");
    conn.send(word);
  });
  fileBtn.addEventListener("click", () => {
    const file =files.files[0];
    console.log(file);
    sendFile(conn, file);
  });
};

peer.on("connection", connProcesser('Receiver'));

connBtn.addEventListener("click", () => {
  const code = window.prompt("Please enter the sharing code");
  if (code !== null) {
    conn = peer.connect(code);
    connProcesser('Sender')(conn);
  }
});
