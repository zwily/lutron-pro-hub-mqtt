const mqtt = require("mqtt");
const LutronConnection = require("./lutron");

function start(mqtt_url, lutron_host, lutron_port, topic_prefix) {
  const mqtt_client = mqtt.connect(mqtt_url);
  const lutron_client = new LutronConnection(lutron_host, lutron_port);
  lutron_client.on("event", (command, id, args) => {
    mqtt_client.publish(
      `${topic_prefix}/${command}/${id}`,
      JSON.stringify({
        command,
        device_id: id,
        args
      })
    );
    console.log("got lutron data: ", command, id, args);
  });

  mqtt_client.on("message", (topic, message) => {
    if (topic === `${topic_prefix}/send`) {
      console.log("sending > ", message);
      lutron_client.send(message);
    }
  });
  mqtt_client.subscribe(`${topic_prefix}/send`);
}

exports.start = start;
