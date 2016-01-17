#!/usr/bin/env node
// modules
// core
var http = require("http"),
	fs = require("fs"),
	qs = require("querystring"),
	
	// npm
	ical = require("ical-generator"),
	moment = require("moment"),
	request = require("request"),
	
	// misc
	jar = request.jar(),
	
	// settings
	settings = JSON.parse(fs.readFileSync("settings.json", "utf8")),
	password = false;

function memdisplay(place)
{
	global.gc();
	console.log("[mem] " + place + ": " + process.memoryUsage().heapUsed);
}

function refresh_calendar()
{
//	memdisplay("begin get events");
	console.log("[" + moment().format() + "] [calendar/refresh] Refreshing calendar");
	delete global.calendar;
	global.calendar = ical();
	calendar.setDomain(settings.domain).setName(settings.name);
	
	var time = moment().startOf("week");
	for(var i = 0; i < settings.weeks_ahead; i++)
	{
		setTimeout(function() {
//			memdisplay("setTimeOut");
			add_week(time);
			time.add(1, "week");
		}, i * 2000); // changed from 1000
	}
}

function datetime()
{
	return moment().format();
}

function add_week(moment)
{
//	memdisplay("start add_week");
	var url = settings.paths.fetchweek,
		weekstamp = moment.format("YYYYDDDD");
	
	url += weekstamp;
	url += "?_=" + moment.format("X");
	
	console.log("[" + datetime() + "] [calendar/update] Fetching " + url);
	
	request({
		uri: url,
		jar: jar
	}, process_calendar_response);
}

function process_calendar_response(error, response, body) {
	"use strict";
	
	if(error) console.error(error);
	
	var resp_obj = JSON.parse(body),
		events = resp_obj.events;
	
	if(typeof events !== "object")
	{
		console.error("[" + datetime() + "] [calendar/processresponse]", "Invalid events:", events);
		console.error("[" + datetime() + "] [calendar/processresponse] [debug] Response received:", body);
		return false; // don't continue if there aren't actually any events here, that would make us crash
	}

	for(var i = 0; i < events.length; i++)
	{
		/*
		 * desc1		| event name including course code
		 * desc2		| event name excluding course code
		 * start		| start date / time
		 * end			| end date / time
		 * teacherName	| lecturer name
		 * locCode		| long location name
		 * locAdd1		| short location code
		 * id			| event id
		 */
		
		calendar.addEvent({
			uid: events[i].id,
			start: new Date(events[i].start),
			end: new Date(events[i].end),
			summary: events[i].desc2,
			description: events[i].desc1 + " with " + events[i].teacherName,
			location: events[i].locCode,
			organizer: { name: events[i].teacherName, email: "example@example.com" },
			status: "confirmed"
		});
	}
	events = null;
	
	console.log("[" + datetime() + `] [calendar/processresponse] Finished processing ${response.url} successfully.`);
	
//	memdisplay("end get events");
}

function setup()
{
	console.log("[" + datetime() + "] [calendar/setup] Logging into remote calendar...");
	console.log("[" + datetime() + "] [calendar/setup] Obtaining state...");
	request({
		uri: settings.paths.state,
		jar: jar
	}, function(error, response, body) {
		if(error) throw error;
		console.log("[" + datetime() + "] [calendar/setup] Performing login...");
		request({
			jar: jar,
			headers: {
				host: "hull.ombiel.co.uk",
				origin: "https://hull.ombiel.co.uk",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				referer: "https://hull.ombiel.co.uk/campusm/home",
				"x-requested-with": "XMLHttpRequest",
			},
			method: "POST",
			body: "username=" + settings.username + "&password=" + settings.password,
			uri: settings.paths.login,
		}, function(error, response, body) {
			if(error) throw error;
			
			console.log("[" + datetime() + "] [calendar/setup] Sending setup request...");
			request({
				jar: jar,
				uri: settings.paths.setupuser,
				method: "POST",
				body: '{"userRoles":false,"orgCode":262}'
			}, function(err, response, body) {
				console.log("[" + datetime() + "] [calendar/setup] Login complete.");
				
				refresh_calendar();
				setInterval(refresh_calendar, 1000*60*60);
			});
		});
	})
};

console.log("[" + datetime() + "] [main] Setting up server...");

global.server = http.createServer(function(request, response) {
	console.log("[" + datetime() + "] [http/request] " + request.method + " from " + request.connection.remoteAddress);
	if(request.method.toLowerCase() == "post")
	{
		console.log("[" + datetime() + "] [http/request/post] Receiving POST data....");
		if(typeof settings.password == "string")
		{
			response.writeHead(400);
			response.end("Error: The password has already been specified.");
			return false;
		}
		var body = "";
		request.on("data", function(data) {
			if(body.length + data.length > 1e6)
				request.connection.destroy();
			
			body += data;
		});
		request.on("end", function() {
			var postdata = qs.parse(body);
			if(typeof postdata.password == "undefined")
			{
				console.log("[" + datetime() + "] [http/request/post] Invalid POST request from " + request.connection.remoteAddress);
				response.writeHead(449);
				response.end("Please add the 'password' POST parameter.");
				return false;
			}
			settings.password = postdata.password;
			console.log("[" + datetime() + "] [http/request/post]  Password set. Beginning setup....");
			setup();
			response.writeHead(202);
			response.end("Password received, beginning setup....");
		});
	}
	else
	{
		if(typeof settings.password !== "string")
		{
			response.writeHead(503);
			response.end("The password has been yet been entered, please wait a moment.");
			return false;
		}

		response.writeHead(200, {
			"content-type": "text/calendar",
			"content-disposition": "attachment; filename=\"university_timetable.ics\""
		});
		response.end(calendar.toString().replace(/\n/gi, "\r\n")); // replace the \n line endings with \r\n
	}
}).listen(settings.port);

console.log("[" + datetime() + "] [http] Server listening on port " + settings.port + ".");
