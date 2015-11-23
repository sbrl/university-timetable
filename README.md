# University Timetable Proxy
**Disclaimer: I don't own the API that this script connects to, nor am I responsible for discovering it (credit to @return for that). This may break or go away at any time. I only wrote this script for my own convenience.**

This script, when configured, will start a web server that emits your Hull University timetable as an ical file for use with Google Calendar.

I built this thing to be compatible with Google Calendar, so you can enter 
the URL that this program is running on into the "Add by URL" box on your 
Google Calendar.

By default, it listens on port 23492, although this can be changed in 
`settings.json`.

## Getting Started
1. Install [Node.js](//nodejs.org/) if you haven't already.
2. Clone this repository.
3. Run `npm install` in the roto of the clone.
4. Update the `username` property in `settings.json` to reflect your user number.
5. Update the `domain` property to reflect the domain that you are going to be running the script on. Change this to `localhost` for your local machine, or if you don't have a domain name but will still be using this script with your Google Calendar, enter your IP Address. This is needed because an ical file apparently needs to contain the domain name of the emitting server. Omit it if you want, but I haven't tested that.
5. Run `npm start` in the root of the repository. By default this will start the server on port 23492. 
6. Send a `POST` request to the running server with a body like this: `password={password}`, where `{password}` is the password that you use to login to a computer in the Lab.
7. Send a normal `GET` request (using your browser for example) to fetch your timetable as an ical.

## Advanced usage
 - You can change the number of weeks ahead that the script looks by changing the `weeks_ahead` property in `settings.json`.
 - You can change the port that the script listens on by changing the `port` property in `settings.json`. _Warning: It's probably best to put the Node.js script behind a proxy if you do this for real. I recommend the excellent [NGiNX](http://nginx.org/) for this purpose._
 - 
