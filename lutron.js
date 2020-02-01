const net = require("net");
const { EventEmitter } = require("events");

const ConnectionState = {
  AWAITING_LOGIN: 1,
  LOGGED_IN: 2
};

// TODO: make this a state machine (xstate?)
class LutronConnection extends EventEmitter {
  constructor(host, port) {
    super();

    this.socket = new net.Socket();
    this.state = ConnectionState.AWAITING_LOGIN;

    const socket = this.socket;
    let connectInterval = null;

    function connect() {
      socket.connect({ host: host, port: port });
    }

    function reconnect() {
      if (connectInterval) {
        console.log("already connecting...");
        return;
      }

      connectInterval = setInterval(connect.bind(this), 5000);
    }

    this.socket.on("connect", () => {
      console.log("lutron connected");
      this.state = ConnectionState.AWAITING_LOGIN;
      clearInterval(connectInterval);
      connectInterval = null;
    });

    this.socket.on("error", err => {
      console.log("lutron socket error: ", err);
      reconnect();
    });

    this.socket.on("close", reconnect);
    this.socket.on("data", this.onData.bind(this));

    connect();
  }

  onData(data) {
    const lines = data
      .toString()
      .split("\r\n")
      .filter(l => l != "");
    for (let line of lines) {
      switch (this.state) {
        case ConnectionState.AWAITING_LOGIN:
          if (/^login:\s*/.test(line)) {
            this.socket.write(`lutron\r\n`);
          } else if (/^password:\s*/.test(line)) {
            this.socket.write(`integration\r\n`);
          } else if (/^GNET>\s*/.test(line)) {
            this.state = ConnectionState.LOGGED_IN;
          }
          break;
        case ConnectionState.LOGGED_IN:
          const args = line.split(",");
          if (args[0][0] === "~") {
            const command = args[0].replace("~", "");
            this.emit("event", command, args[1], args.slice(2));
          }
          break;
      }
    }
  }

  send(string) {
    if (this.state === ConnectionState.LOGGED_IN) {
      console.log("sending ", string);
      this.socket.write(`${string}\r\n`);
    }
    // else, command is dropped
  }
}

module.exports = LutronConnection;
