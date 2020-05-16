$(function () {
	$.getJSON("https://spreadsheets.google.com/feeds/list/1QrEHAN4o6dQe4PqCXg5_AkQ8u_j1nqt1GCpz90Lv5g4/od6/public/values?alt=json", function (data) {
		var movies = data.feed.entry;
		var template = $("#movie-template").html();

		$("#movies").html(Mustache.to_html(template, data));
	});
});