#!/usr/bin/env bash

# Core Settings
syslog_tag="university-timetable";

log_message() {
	logger --stderr --id $$ --tag "university-timetable" "$1";
}

log_message "Starting university-timetable scraper";

if [[ -f ".timetable-settings" ]]; then
	source .timetable-settings;
else
	log_message "fatal: No source settings file found! Exiting";
	exit 65;
fi

# Send variables to 
export SBRL_OUTPUT_FILENAME SWS_ROOT_URL SWS_USERNAME SWS_PASSWORD DEBUG;

log_message 'Started university-timetable scraper successfully!';

while true; do
	echo -ne "[$(date)] Rescraping timetable - ";
	sudo --preserve-env -u "${scraping_user}" node ./generate.js;
	echo -e "done";
	
	log_message "Rescraped university timetable to ${SBRL_OUTPUT_FILENAME}";
	
	sleep ${interval};
	sleep $((($RANDOM % ${variance})));
done
