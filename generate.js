"use strict";

const fs = require("fs");
const Nightmare = require("nightmare");

const TimetableParser = require("./timetable_parser");

const version = "0.2-alpha";

if(typeof process.env.SWS_USERNAME != "string") {
	throw new Error("Error: SWS_USERNAME not specified!");
}
if(typeof process.env.SWS_PASSWORD != "string") {
	throw new Error("Error: SWS_USERNAME not specified!");
}

var settings = {
	output_filename: process.env.SBRL_OUTPUT_FILENAME || "./timetable.ical",
	
	sws_root_url: process.env.SWS_ROOT_URL || "https://timetable.hull.ac.uk/",
	sws_username: process.env.SWS_USERNAME,
	sws_password: process.env.SWS_PASSWORD,
	
	show_window: true,
	user_agent: `Mozilla/5.0 timetable-extractor/${version} (bot; ${process.platform} ${process.arch}; scrapes personal timetable; author contact: abuse@starbeamrainbowlabs.com) Node.JS/${process.version} Nightmare/${Nightmare.version}`,
	loadTimeout: 30 * 1000,
	
	// Things that change in the scraping process on a semi-regular basis
	// If it breaks, check for new values for these by simulating the process in your browser's developer tools
	lbWeeks: "1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22"
};

const sws_crawler = Nightmare({ show: settings.show_window, loadTimeout: settings.loadTimeout });


sws_crawler.useragent(settings.user_agent)
	// Login
	.goto(settings.sws_root_url)
	.type("#tUserName", settings.sws_username)
	.type("#tPassword", settings.sws_password)
	.click(".cc-btn.cc-dismiss")
	.click("#bLogin").wait(1000)
	// Select 'My Timetable'
	.click("#LinkBtn_studentMyTimetableNEW").wait("#dlPeriod")
	// Enter the appropriate information
	.select("#dlPeriod", "5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25;26;27;28;29;30;31;32;33;34;35;36;37;38;39;40;41;42;43;44;45;46;47;48;49;50;51;52;53;54;55;56;57;58;59;60;61").wait("#lbWeeks")
	.select("#lbWeeks", settings.lbWeeks).wait("#dlType")
	.select("#dlType", "TextSpreadsheet;swsurl;Student List Timetable").wait("#bGetTimetable")
	// Submit the form
	.click("#bGetTimetable").wait(".spreadsheet")
	.evaluate(() => {
		return document.body.innerHTML;
	})
	.end()
	.then((timetable_html) => {
		//fs.writeFileSync("timetable.html", timetable_html);
		
		var timetable_parser = new TimetableParser(timetable_html);
		fs.writeFileSync(settings.output_filename, timetable_parser.asIcal());
	});
