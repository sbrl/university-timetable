# Starting This Thing
Currently, you should type this into your terminal:

```bash
$ sudo -u unitimetable iojs index.js >events.log 2>&1 &
$ disown %1
```

I am working on trying to write an upstart config file to turn it into a service, but upstart isn't behaving at all....
