"use strict";

const crypto = require("crypto");

const cheerio = require("cheerio");
const moment = require("moment");
const ical_toolkit = require("ical_toolkit");

class TimetableParser
{
	constructor(timetableHTML)
	{
		this.cheerio_doc = cheerio.load(timetableHTML);
		
		this.events = [];
		
		this.week1 = moment({ year: (new Date()).getFullYear() }).week(35);
		
		this.calendar = ical_toolkit.createIcsFileBuilder();
		this.calendar.thowError = true;
		this.calendar.calname = "University Timetable";
		this.calendar.timezone = this.calendar.tzid = "Europe/London";
		this.calendar.method = "PUBLISH";
	}
	
	/**
	 * Converts this timetable ot an ical calendar.
	 * @return	{string}	This calendar as a string of ical.
	 */
	asIcal()
	{
		this.parse_events();
		
		return this.calendar.toString();
	}
	
	parse_events()
	{
		this.cheerio_doc(".spreadsheet tr:not(.columnTitles)").each((function(i, tr) {
			let event_summary = `${tr.children()[2].text().trim()} ${tr.children()[3].text().trim()}`,
				event_location = tr.children()[8].text().trim(),
				event_organiser = {
					name: tr.children()[9].text(),
					email: "unknown@example.com"
				};
		    this.parse_week_expr(tr.children()[1].text()).map((week) => {
				// Calculate the start and end times of the session
				let day = tr.children()[5].text().trim();
				
				let start = tr.children()[6].trim().split(":").map((p) => parseInt(p));
				start = { hours: start[0], minutes: start[1] };
				
				let end = tr.children()[7].trim().split(":").map((p) => parseInt(p));
				end = { hours: end[0], minutes: end[1] };
				
				add_event({
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
					
					alarms: [15, 0],
					
					summary: event_summary
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
		return this.week1.add(week, "weeks");
	}
}


module.exports = TimetableParser;
