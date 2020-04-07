const mqtt = require("mqtt");
const LutronConnection = require("./lutron");

function start(mqtt_url, lutron_host, lutron_port, topic_prefix) {
  const mqtt_client = mqtt.connect(mqtt_url);
  const lutron_client = new LutronConnection(lutron_host, lutron_port);
  lutron_client.on("event", (event) => {
    const components = event.split(",");

    mqtt_client.publish(
      `${topic_prefix}/${event}`,
      JSON.stringify({
        command: components[0],
        id: components[1],
        args: components.slice(2),
        all: components,
      })
    );
    console.log("got lutron event: ", event);
  });

  mqtt_client.on("message", (topic, message) => {
    if (topic === `${topic_prefix}/send`) {
      console.log("sending > ", message.toString());
      lutron_client.send(message.toString());
    }
  });
  mqtt_client.subscribe(`${topic_prefix}/send`);
}

exports.start = start;
