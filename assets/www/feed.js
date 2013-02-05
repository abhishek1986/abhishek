function renderFeed(data, target, page) {
	console.log(data);
	console.log(data.data);
	console.log(page);
	var entries = data.data;
	$(target).html("");

	if (page == "Tweets" || page == "Pictures") {
		for (var i in entries) {
			var item = entries[i];
			// var li = $("<li/>").appendTo(target);
			var htmls = '<li>';
			htmls += '<a href="' + item.link + '">';
			htmls += '<img class="celeb-pic ui-corner-none" src="' + item.celebProfilePic + '"/>';
			htmls += '<p class="time">' + item.timeago + '</p>';
			htmls += '<p class="celeb-content">';
			htmls += '<h2>' + item.celebFullname + '</h2>';
			htmls += '<span>' + item.tweet + '</span>';
			htmls += '</p></a></li>';
			$(target).append(htmls);
			//
			// $("<img/>").appendTo(li).attr("src", item.celebProfilePic).html ;
			// $("<div/>").appendTo(li)
			// $("<h1/>").appendTo(li).addClass("celebName").html(item.celebFullname);
			// $("<a/>").appendTo(li).attr("href", item.link).html(item.tweet);
		}
		target.listview('refresh');
	}
	if (page == "Trends") {
		var max = Number(entries[0].differential);
		var min = Number(entries[entries.length - 1].differential);
		var barVal = (max - min) / 10;

		for (var i in entries) {
			var item = entries[i];
			var diff = Number(item.differential);
			var weight = (diff - min) / barVal;
			item.weight = weight;
			var htmls = '<li>';
			htmls += '<img src="img/buttonbar-trends.png" />';
			htmls += '<h2>' + item.trend + '</h2>';
			htmls += '<img src="img/rating/' + parseInt(Math.min(item.weight + 1, 10)) + '.png" />';
			htmls += '<a href="select.html" data-role="button" data-icon="arrow-r" />';
			htmls += '</li>';
			$(target).append(htmls);
		}
		target.listview('refresh');
	}
	if (page == "Celebrities"){
		for (var i in entries){
			var item = entries[i];
			var htmls = '<li>';
			htmls += '<img class ="celeb-photo" src="' + item.profilePic + ' "/>';
			htmls += '<h3>' + item.fullname + '</h3>';
			htmls += '<p>' + item.username + '</p>';
			htmls += '</li>';
			$(target).append(htmls);
		}
		target.listview('refresh');
	}
}

function callAjax(url, target, page) {
	$.ajax({
		type : "GET",
		url : url,
		dataType : "jsonp",
		success : function(data) {
			renderFeed(data, target, page);
		},
		error : function(data) {
			console.log(data);
		}
	});
}


$(document).live('pageshow', function(e, data) {
	var page = $.mobile.activePage;
	var pagename = $(page).data("title");
	feed_url = $(page).data("rss");
	var url = encodeURI(feed_url);
	var target = $(page).find(".tweets");
	callAjax(url, target, pagename);

	$('.refresh').click(function() {
		callAjax(url, target);
	});

});
