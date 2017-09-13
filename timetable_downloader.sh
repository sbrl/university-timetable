#!/usr/bin/env bash

syslog_tag="university-timetable";

interval=1200;	# 20 minutes
variance=600;	# 10 minutes

function log_message(message) {
	logger --id $$ --tag "university-timetable" "${message}";
}

log_message "Starting university-timetable scraper";

if [[ -f ".timetable-settings" ]]; then
	source .timetable-settings;
fi

# Send variables to 
export SBRL_OUTPUT_FILENAME SWS_ROOT_URL SWS_USERNAME SWS_PASSWORD DEBUG;

log_message 'Started university-timetable scraper successfully!';

while true; do
	echo -ne "[$(date)] Rescraping timetable - ";
	node ./generate.js
	echo -ne "done";
	
	log_message "Rescraped university timetable to ${SBRL_OUTPUT_FILENAME}";
	
	sleep interval;
	sleep $((($RANDOM % ${variance})));
done
