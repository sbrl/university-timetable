"use strict";

const crypto = require("crypto");

const cheerio = require("cheerio");
const moment = require("moment");
const ical_toolkit = require("ical-toolkit");

class TimetableParser
{
	constructor(timetableHTML)
	{
		this.verbose = true;
		this.doc = cheerio.load(timetableHTML);
		
		this.week1 = moment({
			year: (new Date()).getMonth() > 7 ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1
		}).week(35);
		
		this.calendar = ical_toolkit.createIcsFileBuilder();
		this.calendar.thowError = true;
		this.calendar.calname = "University Timetable";
		this.calendar.timezone = this.calendar.tzid = "Europe/London";
		this.calendar.method = "PUBLISH";
	}
	
	/**
	 * Converts this timetable to an ical calendar.
	 * @return	{string}	This calendar as a string of ical.
	 */
	asIcal()
	{
		// Parse out the html and extract the events
		this.parse_events();
		
		if(this.verbose)
			console.log(`Week 1: ${this.week1}`);
		
		// Convert the left-over moment objects to vanilla Date objects
		this.calendar.events.sort(function(a, b) {
			if(a.start.isSame(b.start, "seconds"))
				return 0;
			if(a.start.isSameOrAfter(b.start))
				return 1;
			return -1;
		});
		this.calendar.events.forEach((ev) => {
			ev.start = ev.start.toDate();
			ev.end = ev.end.toDate();
			
			if(this.verbose)
				console.log(`[ ${ev.start.toString()} - ${ev.start.toString()} ] ${ev.summary} @ ${ev.location} with ${ev.organizer.name}`);
		});
		
		// Convert the calendar to ics
		return this.calendar.toString();
	}
	
	parse_events()
	{
		this.doc(".spreadsheet tr:not(.columnTitles)").each((function(i, tr) {
			let tr_fields = this.doc("td", tr);
			
			let event_summary = `${this.doc(tr_fields[2]).text().trim()} ${this.doc(tr_fields[3]).text().trim()}`,
				event_location = this.doc(tr_fields[8]).text().trim(),
				event_organiser = {
					name: this.doc(tr_fields[9]).text(),
					email: "unknown@example.com"
				};
		    this.parse_week_expr(this.doc(tr_fields[1]).text()).map((week) => {
				// Calculate the start and end times of the session
				let day = this.doc(tr_fields[5]).text().trim();
				
				let start = this.doc(tr_fields[6]).text().trim().split(":").map((p) => parseInt(p));
				start = { hours: start[0], minutes: start[1] };
				
				let end = this.doc(tr_fields[7]).text().trim().split(":").map((p) => parseInt(p));
				end = { hours: end[0], minutes: end[1] };
				
				this.add_event({
					uid: crypto.createHash("sha1").update(`${event_summary} @ ${event_location} @ ${week}[${day}] ${start.hours}:${start.minutes}-${end.hours}:${end.minutes}`).digest("hex"),
					start: this.week_number_to_date(week)
						.day(day)
						.hours(start.hours).minutes(start.minutes),
					end: this.week_number_to_date(week)
						.day(day)
						.hours(end.hours).minutes(end.minutes),
					
					transp: "OPAQUE",
					method: "PUBLISH",
					status: "CONFIRMED",
					
					alarms: [15],
					
					summary: event_summary,
					description: `At ${event_location} by ${event_organiser.name}`,
					location: event_location,
					organizer: event_organiser
				});
			});
		}).bind(this));
	}
	
	add_event(event_info)
	{
		// Don't add duplicate events
		if(this.event_exists(event_info))
			return;
		
		// Add the event to the calendar
		this.calendar.events.push(event_info);
	}
	
	event_exists(event_info)
	{
		return this.calendar.events.some((ev) => {
			return event_info.start.isSame(ev.start, "seconds") &&
				event_info.end.isSame(ev.end, "seconds") &&
				event_info.summary == ev.summary &&
				event_info.location == ev.location;
		});
	}
	
	/**
	 * Parses a week expression (e.g. 5-6, 9, 11-15) into a list of integer weeks.
	 * Also works on page number expressions to an extent.
	 * @param	{string}		expr	The expression to parse.
	 * @return	{number[]}		An array of week numbers specified by expr.
	 */
	parse_week_expr(expr) {
		return expr.split(/, ?/g).map((spec) => {
			if(spec.search("-") == -1)
				return parseInt(spec);
			let [a, b] = spec.split(/-/).map((n) => parseInt(n));
			return [...Array(b + 1).keys()].slice(a);
		}).reduce((result, next) => result.concat(next), []);
	}
	
	week_number_to_date(week) {
		return this.week1.clone().add(week, "weeks");
	}
}


module.exports = TimetableParser;
