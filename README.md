# University Timetable Proxy
**Disclaimer: I don't own the website that this script connects to, nor am I responsible for discovering it. This may break or go away at any time. I only wrote this script for my own convenience.**

This script, when configured, will save your Hull University timetable as an ical file on a regular basis to a specified location for use with Google Calendar.

I built this thing to be compatible with Google Calendar, so you can enter 
the URL that this program is running on into the "Add by URL" box on your 
Google Calendar.

**Rewrite in progress!**

 - [x] Grab the timetable as html
 - [ ] Parse out the events from the html
 - [ ] Output events as ical
 - [ ] Create bash wrapper that calls node script reguarly and automatically to keept he ical file up-to-date

Technologies used:
 - [Node.JS](https://nodejs.org/)
 - [Nightmare](https://npmjs.org/packages/nightmare)
 - Bash (for the automated wrapper, coming soon)

## Getting Started
1. Install [Node.js](//nodejs.org/) if you haven't already.
2. Clone this repository.
3. Run `npm install` in the root of the clone.
4. Set the appropriate environment variables (see the environment variables section below)
5. Run `node generate.js` from the root of the repository

## Environment Variables

Variable                | Meaning
------------------------|-----------------
`SWS_ROOT_URL`          | _Optional_. The url at which sws can be accessed. Default: https://timetable.hull.ac.uk/
`SWS_USERNAME`          | **Required**. Your network login username.
`SWS_PASSWORD`          | **Required**. Your network login password.

## License
This code is available under the _Mozilla Public License, version 2.0_. The full license text is available in the `LICENSE` file in this repository.
