var app = {

	tweets : [],
	//a : 1,

	init : function() {
		app.handelEvent();
	},

	handelEvent : function() {
		$(document).on('pageshow', function(e, data) {
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			feed_url = Config.servicePrefixUrl + $(page).data("rss") + pageNo;
			var url = encodeURI(feed_url);
			var target = $(page).find(".tweets");
			app.callAjax(url, target, pagename);
		});

		$(document).on('click', '.refresh', function(e, data) {
			app.callAjax(url, target);
		});

		$('#pageDetail').live('pageshow', function(event, ui) {
			var detailID = sessionStorage.ParameterID;
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var target = $(page).find(".detail");
			var item = app.tweets[detailID];
			$(target).html("");
			var htmls = app.renderDetailFeed(item, target);
			$(target).append(htmls);
			target.listview('refresh');
		});

		$('#trendDetail').live('pageshow', function(event, ui) {
			var trend = sessionStorage.ParameterTrend;
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var target = $(page).find(".trendsDetail");
			var url = Config.servicePrefixUrl + $(page).data("rss") + trend;
			url = encodeURI(url);
			app.callAjax(url, target, pagename);

		});
	},

	renderFeed : function(data, target, page) {
		var entries = data.data;

		if (page == "Tweets") {
			for (var i in entries) {
				var item = entries[i];
				app.tweets[item.id] = item;
				var htmls = app.renderTweet(item);
				$(target).append(htmls);
			}
		}

		if (page == "Pictures") {
			for (var i in entries) {
				var item = entries[i];
				app.tweets[item.id] = item;
				var htmls = app.renderPics(item);
				htmls += '<input type="button" value="Load More" class="ui-btn-hidden" onclick="app.renderLoadMore;"/>';
				$(target).append(htmls);
			}
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
				var htmls = app.renderTrend(item);
				$(target).append(htmls);
			}
		}
		if (page == "Celebrities") {
			for (var i in entries) {
				var item = entries[i];
				var htmls = app.renderCeleb(item);
				$(target).append(htmls);
			}
		}
		target.listview('refresh');
	},

	renderTweet : function(item) {
		var htmls = '<li>';
		htmls += '<a href="#pageDetail" onclick="sessionStorage.ParameterID=\'' + item.id + '\'">';
		htmls += '<img class="celeb-pic ui-corner-none" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<p class="celeb-content">';
		htmls += '<h2>' + item.celebFullname + '</h2>';
		htmls += '<span class="text">' + item.tweet + '</span>';
		htmls += '</p></a></li>';
		return htmls;

	},

	renderPics : function(item) {
		var htmls = '<li>';
		htmls += '<a href="#pageDetail" onclick="sessionStorage.ParameterID=\'' + item.id + '\'">';
		htmls += '<img class="celeb-pic ui-corner-none" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<p class="celeb-content">';
		htmls += '<h2>' + item.celebFullname + '</h2>';
		htmls += '<span>' + item.tweet + '</span>';
		htmls += '<img class="ui-corner-none" src="' + item.image + '" width="200"/>';
		htmls += '</p></a></li>';
		return htmls;
	},

	renderTrend : function(item) {
		var htmls = '<li>';
		var trnd = item.trend;
		trnd.replace(' ', '+');
		htmls += '<a  data-icon="arrow-r" href = "#trendDetail" onclick="sessionStorage.ParameterTrend=\'' + trnd + '\' ">';
		htmls += '<img src="img/buttonbar-trends.png" />';
		htmls += '<h2>' + item.trend + '</h2>';
		htmls += '<img src="img/rating/' + parseInt(Math.min(item.weight + 1, 10)) + '.png" />';
		htmls += '</a></li>';
		return htmls;
	},

	renderCeleb : function(item) {
		var htmls = '<li>';
		htmls += '<img class ="celeb-photo" src="' + item.profilePic + ' "/>';
		htmls += '<h3>' + item.fullname + '</h3>';
		htmls += '<p>' + item.username + '</p>';
		htmls += '</li>';
		return htmls;
	},

	renderDetailFeed : function(item, target) {
		var htmls = '<li>';
		htmls += '<div class= "ui-bar">';
		htmls += '<img class="celeb-pic ui-corner-none" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="celeb-content">';
		htmls += '<h2>' + item.celebFullname + '</h2><br />';
		htmls += '<h4>' + item.celebUsername + '</h4>';
		htmls += '</p>';
		htmls += '<div data-role="controlgroup" data-type="horizontal" class="ui-btn-right">';
		htmls += '<a href = "' + Config.REPLY_URL + item.id + '" data-role="button" data-mini="true"><img src="img/reply.png"/></a>';
		htmls += '<a href = "' + Config.RETWEET_URL + item.id + '" data-role="button" data-mini="true"><img src="img/retweet.png"/></a>';
		htmls += '<a href = "' + Config.FAV_URL + item.id + '" data-role="button" data-mini="true"><img src="img/favorite.png"/></a>';
		htmls += '</div>';
		htmls += '</div>';
		htmls += '<span >' + item.tweet + '</span>';
		if (item.image != "") {
			htmls += '<img class="ui-corner-none" src="' + item.image + '"/>';
		}
		htmls += '</li>';
		return htmls;

	},

	renderTrendFeed : function(data, target) {
		var entries = data.data;
		$(target).html("");
		for (var i in entries) {
			var item = entries[i];
			app.tweets[item.id] = item;
			var htmls = app.renderTrendFeedView(item);
			$(target).append(htmls);
		}
		target.listview('refresh');
	},

	renderTrendFeedView : function(item) {
		var htmls = '<li>';
		htmls += '<a href="#pageDetail" onclick="sessionStorage.ParameterID=\'' + item.id + '\'">';
		htmls += '<img class="celeb-pic ui-corner-none" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<p class="celeb-content">';
		htmls += '<h2>' + item.celebFullname + '</h2>';
		htmls += '<span class="text">' + item.tweet + '</span>';
		htmls += '</p></a></li>';
		return htmls;
	},

	renderLoadMore : function() {
		var page = $.mobile.activePage;
		var pagename = $(page).data("title");
		var pageNo = $(page).data("page_num");
		pageNo = pageNo + 1;
		$(page).data("page_num", pageNo);
		if (pagename == "Tweets") {
			$('#pagetweets').trigger('pageshow');
		}
		if (pagename == "Pictures") {
			$('#pagepics').trigger('pageshow');
		}
		if (pagename == "Trends") {
			$('#pagetrends').trigger('pageshow');
		}
		if (pagename == "Celebrities") {
			$('#pagecelebs').trigger('pageshow');
		}
	},

	callAjax : function(url, target, page) {
		$.ajax({
			type : "GET",
			url : url,
			dataType : "jsonp",
			success : function(data) {
				if (page == "DetailTrend") {
					app.renderTrendFeed(data, target);
				} else {
					app.renderFeed(data, target, page);
				}
			},
			error : function(data) {
				console.log(data);
			}
		});
	}
};

app.init();

