# University Timetable Proxy
**Disclaimer: I don't own the API that this script connects to, nor am I responsible for discovering it (credit to @return for that). This may break or go away at any time. I only wrote this script for my own convenience.**

This script, when configured, will start a web server that emits your Hull University timetable as a .ical file for use with Google Calendar.

To use, simply edit the `settings.json` file, start it by typing something 
like `node index.js` or `iojs index.js`, then send a POST request to the 
server with a body like this: `password={your password}`. Then you can send 
a GET request to the server (with your browser for example) with any path and it will return an `ical` file.

I built this thing to be compatible with Google Calendar, so you can enter 
the URL that this program is running on into the "Add by URL" box on your 
Google Calendar.

By default, it listens on port 23492, although this can be changed in 
`settings.json`.

## Getting Started
To get started, clone this repository and run `npm install` in the root of 
this clone to install the dependencies. Then you can start the server with 
`npm start`.
