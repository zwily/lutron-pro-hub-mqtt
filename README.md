# lutron-pro-hub-mqtt

This is a small docker container that connects to a Lutron
hub (like the Caseta pro hub, or the RA2 Select hub), and
to an mqtt broker, and shuffles messages between them.

Status updates and button presses from Lutron are sent to
MQTT topics:

```
# Lutron command
~OUTPUT,59,1,100.00
```

gets published to the topic `lutron/1/OUTPUT/52` as:

```json
{
  "command": "OUTPUT",
  "device_id": "59",
  "args": ["1", "100.00"]
}
```

You can send commands to your Lutron hub too. Just publish
a string with the raw command to `lutron/1/send`.

Details on the protocol are at: https://www.lutron.com/technicaldocumentlibrary/040249.pdf

## Running

```
$ docker run -it --rm --init zwily/lutron-pro-hub-mqtt:latest --mqtt-url mqtt://mosquitto/ --lutron-host 192.168.10.101
```

Available options are:

```
      --mqtt-url <url> URL for MQTT broker (default: mqtt://localhost/)
      --lutron-host <hostname> Hostname or IP for Lutron Hub
      --lutron-port <port> Port for Lutron Hub (default: 23)
      --topic-prefix <string> Prefix for all emitted topics (default: 'lutron/1')
```

You can specify `--topic-prefix` if you have multiple hubs.
