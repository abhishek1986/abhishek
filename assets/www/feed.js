var app = {

	tweets : [],

	init : function() {
		app.handelEvent();
	},

	handelEvent : function() {
		$(document).on('pageshow', '.mainTweet', function(e, data) {
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			feed_url = Config.servicePrefixUrl + $(page).data("rss") + pageNo;
			var url = encodeURI(feed_url);
			var target = $(page).find(".tweets");
			app.callAjax(url, target, pagename, true);
		});

		$(document).on('click', '.refresh', function(e, data) {
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			feed_url = Config.servicePrefixUrl + $(page).data("rss") + pageNo;
			var url = encodeURI(feed_url);
			var target = $(page).find(".tweets");
			app.callAjax(url, target, pagename, false);
		});

		$(document).on('pageshow', '#pageDetail', function(event, ui) {
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

		$(document).on('pageshow', '#trendDetail', function(event, ui) {
			var trend = sessionStorage.ParameterTrend;
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var target = $(page).find(".trendsDetail");
			var url = Config.servicePrefixUrl + $(page).data("rss") + trend;
			url = encodeURI(url);
			app.callAjax(url, target, pagename, true);

		});

		$(document).on('pageshow', '#celebDetail', function(event, ui) {
			var celebID = sessionStorage.ParameterCelebID;
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			var target = $(page).find(".trendsDetail");
			var url = Config.servicePrefixUrl + $(page).data("rss") + pageNo + "&celeb_id=" + celebID;
			url = encodeURI(url);
			app.callAjax(url, target, pagename, true);
		});

	},

	renderFeed : function(data, target, page, is_append) {
		var entries = data.data;
		if (is_append == "false") {
			$(target).html("");
		}
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
				app.tweets[item.id] = item;
				var htmls = app.renderCeleb(item);
				$(target).append(htmls);
			}
		}

		target.listview('refresh');
	},

	renderTweet : function(item) {
		var htmls = '<li>';
		htmls += '<a href="#pageDetail" onclick="sessionStorage.ParameterID=\'' + item.id + '\'">';
		htmls += '<img class="ui-li-thumb" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<h3 class="ui-li-heading">' + item.celebFullname + '</h3>';
		htmls += '<p class="ui-li-desc">' + item.tweet + '</p>';
		htmls += '</a></li>';
		return htmls;
	},

	renderPics : function(item) {
		var htmls = '<li>';
		htmls += '<a href="#pageDetail" onclick="sessionStorage.ParameterID=\'' + item.id + '\'">';
		htmls += '<img class="ui-li-thumb" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<h3 class="ui-li-heading">' + item.celebFullname + '</h3>';
		htmls += '<p class="ui-li-desc">' + item.tweet + '</p>';
		htmls += '<img class="ui-corner-none" src="' + item.image + '" width="75"/>';
		htmls += '</a></li>';
		return htmls;
	},

	renderTrend : function(item) {
		var htmls = '<li>';
		var trnd = item.trend;
		trnd.replace(' ', '+');
		htmls += '<a  data-icon="arrow-r" href = "#trendDetail" onclick="sessionStorage.ParameterTrend=\'' + trnd + '\' ">';
		htmls += '<img class="ui-li-thumb" src="img/buttonbar-trends.png" />';
		htmls += '<h3 class="ui-li-heading">' + item.trend + '</h3>';
		htmls += '<img src="img/rating/' + parseInt(Math.min(item.weight + 1, 10)) + '.png" />';
		htmls += '</a></li>';
		return htmls;
	},

	renderCeleb : function(item) {
		var htmls = '<li>';
		htmls += '<a href= "#celebDetail" onclick="sessionStorage.ParameterCelebID=\'' + item.id + '\' ">'
		htmls += '<img class ="ui-li-thumb" src="' + item.profilePic + ' "/>';
		htmls += '<h3 class="ui-li-heading">' + item.fullname + '</h3>';
		htmls += '<p class="ui-li-desc">' + item.username + '</p>';
		htmls += '</a></li>';
		return htmls;
	},

	renderDetailFeed : function(item, target) {
		var htmls = '<li>';
		htmls += '<div data-role="navbar" class= "ui-bar tab">';
		htmls += '<img class="ui-li-thumb" src="' + item.celebProfilePic + '"/>';
		htmls += '<h3 class="ui-li-heading">' + item.celebFullname + '</h3><br />';
		htmls += '<h4 class="ui-li-heading">' + item.celebUsername + '</h4>';
		htmls += '<div data-role="controlgroup" data-type="horizontal" class="ui-btn-right">';
		htmls += '<a href = "' + Config.REPLY_URL + item.id + '" data-role="button" data-mini="true"><img src="img/reply.png"/></a>';
		htmls += '<a href = "' + Config.RETWEET_URL + item.id + '" data-role="button" data-mini="true"><img src="img/retweet.png"/></a>';
		htmls += '<a href = "' + Config.FAV_URL + item.id + '" data-role="button" data-mini="true"><img src="img/favorite.png"/></a>';
		htmls += '</div>';
		htmls += '</div>';
		htmls += '<p class="ui-li-desc">' + item.tweet + '</p>';
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
		htmls += '<img class="ui-li-thumb ui-corner-none" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<h3 class="ui-li-heading">' + item.celebFullname + '</h3>';
		htmls += '<p class="ui-li-desc">' + item.tweet + '</p>';
		htmls += '</a></li>';
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
		if (pagename == "CelebrityDetail") {
			$('#celebDetail').trigger('pageshow');
		}
	},

	renderDetailCeleb : function(data, target) {
		var celebID = sessionStorage.ParameterCelebID;
		var celebItem = app.tweets[celebID];
		var entries = data.celebTweet;
		$(target).html("");
		var	htmls = '<div data-role="navbar" class= "ui-bar tab">';
			htmls += '<img class="ui-li-thumb" src="' + celebItem.profilePic + '"/>';
			htmls += '<h3 class="ui-li-heading">' + celebItem.fullname + '</h3><br />';
			htmls += '<h4 class="ui-li-heading">' + celebItem.username + '</h4>';
			htmls += '</div>';
		for (var i in entries) {
			var item = entries[i];
			console.log(item);
			htmls = app.renderDetailCelebView(item);
			$(target).append(htmls);
		}
		target.listview('refresh');
	},

	renderDetailCelebView : function(item) {
		var htmls = '<li>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<p class="ui-li-desc">' + item.tweet + '</p>';
		if (item.image_url != "") {
			htmls += '<img class="ui-corner-none" src="' + item.image_url + '"/>';
		}
		htmls += '</li>';
		return htmls;
	},

	callAjax : function(url, target, page, is_append) {
		$(".loader").show();
		$(".loadMore").parent("div").hide();
		$.ajax({
			type : "GET",
			url : url,
			dataType : "jsonp",
			success : function(data) {
				if (page == "DetailTrend") {
					app.renderTrendFeed(data, target);
				} else if (page == "CelebrityDetail") {
					app.renderDetailCeleb(data, target);
				} else {
					app.renderFeed(data, target, page, is_append);
				}

				$(".loader").hide();
				$(".loadMore").parent("div").show();
			},
			error : function(data) {
				console.log(data);
			}
		});
	}
};

app.init();

