
const fs = require("fs");

const TimetableParser = require("./timetable_parser");


var timetableHTML = fs.readFileSync("timetable.html");

var parser = new TimetableParser(timetableHTML);

fs.writeFileSync("timetable.ical", parser.asIcal());
