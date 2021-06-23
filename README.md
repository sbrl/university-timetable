# University Timetable Proxy

This repository is now archived, as the University of Hull no longer uses SWS for timetabling. If I recall correctly the new timetabling system provides an ical directly - though if it doesn't then a completely new project will need to be started, as this one is completely broken given the change of timetabling system. If you still have a use for this repository, please do get in touch with me - contact details available on my website: <https://starbeamrainbowlabs.com/>.


**Disclaimer: I don't own the website that this script connects to, nor am I responsible for discovering it. This may break or go away at any time. I only wrote this script for my own convenience.**

This script, when configured, will save your Hull University timetable as an ical file on a regular basis to a specified location for use with Google Calendar.

I built this thing to be compatible with Google Calendar, so you can enter 
the URL that this program is running on into the "Add by URL" box on your 
Google Calendar.

**Rewrite in progress!**

 - [x] Grab the timetable as html
 - [x] Parse out the events from the html
 - [x] Output events as ical
 - [x] Create bash wrapper that calls node script reguarly and automatically to keept he ical file up-to-date

Technologies used:
 - [Node.JS](https://nodejs.org/)
 - [Nightmare](https://npmjs.org/packages/nightmare)
 - Bash (for the automated wrapper, coming soon)

## Getting Started
1. Install [Node.js](//nodejs.org/) if you haven't already.
2. Clone this repository.
3. Run `npm install` in the root of the clone.
4. Set the appropriate environment variables (see the environment variables section below)
5. Run `node generate.js` from the root of the repository, ensuring the below environment variables are set. The following commands make sure the bare-minimum are set:

```bash
read -p"Username: "; read -p"Password: " -s SWS_PASSWORD;
export SWS_PASSWORD; export SWS_USERNAME;
node ./generate.js;
```

## Environment Variables

Variable                | Meaning
------------------------|---------------------------
`SBRL_OUTPUT_FILENAME`  | _Optional_. The filename to which the ical file should be saved. Default: `timetable.ical` in the current directory.
`SWS_ROOT_URL`          | _Optional_. The url at which sws can be accessed. Default: https://timetable.hull.ac.uk/
`SWS_USERNAME`          | **Required**. Your network login username.
`SWS_PASSWORD`          | **Required**. Your network login password.

## Automation
The script `timetable_downloader.sh` can be used to automate the process of scraping your timetable. Here's a rough guide as to how I recommend setting it up:

```bash
# Run all the following commands as root
# cd to the place you want to put the script
cd /root;
# Clone this repository
git clone https://github.com/sbrl/university-timetable.git;
# Install the dependencies
npm install;
# Copy the example settings file
cp .timetable-settings.default .timetable-settings;
# Set the permissions correctly
chmod 0400 .timetable-settings;
# Edit the settings file to suit
nano .timetable-settings;
```

After executing the above, you should be ready for a test run. Try `sudo ./timetable_downloader.sh` and see if it works! Once satisfied, set it up as a cron job.

## License
This code is available under the _Mozilla Public License, version 2.0_. The full license text is available in the `LICENSE` file in this repository.
