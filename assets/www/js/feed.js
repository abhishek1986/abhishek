var app = {

	tweets : [],
	page : {},

	init : function() {
		app.handelEvent();
	},

	handelEvent : function() {
		$(document).on('pageinit', function(event, data) {
			var $currentPage = $(event.target);
			$(this).find(".m-header").load('html/header.html', function() {
				$(this).trigger("create");
			});
			$currentPage.find(".m-footer").load('html/footer.html', function() {
				$(this).trigger("create");
				var tab = $(this).data("highlight");
				$currentPage.find("a[href='#" + tab + "']").addClass('tweet-active');
			});
			$(this).find(".d-header").load('html/header2.html', function() {
				$(this).trigger("create");
			});
			$currentPage.find(".d-footer").load('html/footer2.html', function() {
				$(this).trigger("create");
				var tab = $(this).data("highlight");
				$currentPage.find("a[href='#" + tab + "']").addClass('tweet-active');
			});

			$(this).find(".m-settings").load('html/setting.html', function() {

				if (localStorage.Country == "IN") {
					$(this).find("input#India").attr('checked', "checked");
				} else if (localStorage.Country == "US") {
					$(this).find("input#USA").attr('checked', true);
				} else if (localStorage.Country == "CA") {
					$(this).find("input#Canada").attr('checked', true);
				} else if (localStorage.Country == "AU") {
					$(this).find("input#Australia").attr('checked', true);
				} else {
					$(this).find("input#Any").attr('checked', true);
				}
				$(this).trigger("create");
			});

		});

		$(document).on('pageshow', '.mainTweet', function(e, data) {
			if (!localStorage.Country) {
				var country = " ";
			} else {
				var country = localStorage.Country;
			}
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			var append = $(page).data("append");
			console.log(append);
			feed_url = Config.servicePrefixUrl + $(page).data("rss") + pageNo + "&country=" + country;
			var url = encodeURI(feed_url);
			var target = $(page).find(".tweets");
			app.append = false;
			app.callAjax(url, target, pagename, append);
		});

		$(document).on('keyup', '#celeb_name', function(e) {
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			var append = $(page).data("append");
			feed_url = Config.servicePrefixUrl + $(page).data("rss") + pageNo + "&q=" + e.target.value;
			var url = encodeURI(feed_url);
			var target = $(page).find(".tweets");
			app.callAjax(url, target, pagename, append);
		});

		$(document).on('click', '.refresh', function(e, data) {
			if (!localStorage.Country) {
				var country = " ";
			} else {
				var country = localStorage.Country;
			}
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			var append = $(page).data("append");
			feed_url = Config.servicePrefixUrl + $(page).data("rss") + pageNo + "&country=" + country;
			var url = encodeURI(feed_url);
			var target = $(page).find(".tweets");
			app.callAjax(url, target, pagename, append);
			return;
		});

		$(document).on('click', '.submit', function(e, data) {
			var country = $("input[type='radio'][name='radio-choice']:checked").val();
			localStorage.Country = country;
			var page = app.page;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			var append = $(page).data("append");
			feed_url = Config.servicePrefixUrl + $(page).data("rss") + pageNo + "&country=" + country;
			var url = encodeURI(feed_url);
			var target = $(page).find(".tweets");
			app.callAjax(url, target, pagename, append);

		});

		$(document).on('click', '.popSettings', function(e, data) {
			app.page = $.mobile.activePage;
			// //$("#settings").popup("open");
			//
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
			//target.listview('refresh');
		});

		$(document).on('pageshow', '#trendDetail', function(event, ui) {
			var trend = sessionStorage.ParameterTrend;
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var target = $(page).find(".trendsDetail");
			var append = $(page).data("append");
			var url = Config.servicePrefixUrl + $(page).data("rss") + trend;
			url = encodeURI(url);
			app.callAjax(url, target, pagename, append);

		});

		$(document).on('pageshow', '#celebDetail', function(event, ui) {

			var celebID = sessionStorage.ParameterCelebID;
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			var target = $(page).find(".celeb-detail");
			var append = $(page).data("append");
			var url = Config.servicePrefixUrl + $(page).data("rss") + pageNo + "&celeb_id=" + celebID;
			url = encodeURI(url);
			app.callAjax(url, target, pagename, append);
		});

		$(document).on('pageshow', '#celebDetailPic', function(event, ui) {
			var celebID = sessionStorage.ParameterCelebID;
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var pageNo = $(page).data("page_num");
			var target = $(page).find(".celeb-detail-pics");
			var append = $(page).data("append");
			var url = Config.servicePrefixUrl + $(page).data("rss") + pageNo + "&celeb_id=" + celebID;
			url = encodeURI(url);
			app.callAjax(url, target, pagename, append);
		});

		$(document).on('pageshow', '#celebDetailBio', function(event, ui) {
			var celebID = sessionStorage.ParameterCelebID;
			var page = $.mobile.activePage;
			var pagename = $(page).data("title");
			var target = $(page).find(".celeb-detail-bio");
			var append = $(page).data("append");
			var url = Config.servicePrefixUrl + $(page).data("rss") + celebID;
			url = encodeURI(url);
			app.callAjax(url, target, pagename, append);
		});

	},

	renderFeed : function(data, target, page, is_append) {
		var entries = data.data;
		if (is_append == false) {
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
		htmls += '<img class="profilePic ui-li-thumb" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<h3 class="ui-li-heading">' + item.celebFullname + '</h3>';
		htmls += '<p class="ui-li-desc">' + item.tweet + '</p>';
		htmls += '</a></li>';
		return htmls;
	},

	renderPics : function(item) {
		item.image = item.image.replace('${size}', '75x75');
		var htmls = '<li>';
		htmls += '<a href="#pageDetail" onclick="sessionStorage.ParameterID=\'' + item.id + '\'">';
		htmls += '<img class="profilePic ui-li-thumb" src="' + item.celebProfilePic + '"/>';
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
		htmls += '<img class ="profilePic ui-li-thumb" src="' + item.profilePic + ' "/>';
		htmls += '<h3 class="ui-li-heading">' + item.fullname + '</h3>';
		htmls += '<p class="ui-li-desc">@' + item.username + '</p>';
		htmls += '</a></li>';
		return htmls;
	},

	renderDetailFeed : function(item, target) {

		var htmls = '<div data-role="header" class="ui-header ui-bar-a">';
		htmls += '<img class="ui-li-thumb" src="' + item.celebProfilePic + '"/>';
		htmls += '<h3 class="head ui-li-heading" data-theme="e">' + item.celebFullname + '</h3>';
		htmls += '<h4 class="head ui-li-heading">@' + item.celebUsername + '</h4>';
		htmls += '<div data-role="controlgroup" data-type="horizontal" class="urlgroup ui-btn-right">';
		htmls += '<a href = "' + Config.REPLY_URL + item.id + '" data-role="button" data-mini="true"><img src="img/reply.png"/></a>';
		htmls += '<a href = "' + Config.RETWEET_URL + item.id + '" data-role="button" data-mini="true"><img src="img/retweet.png"/></a>';
		htmls += '<a href = "' + Config.FAV_URL + item.id + '" data-role="button" data-mini="true"><img src="img/favorite.png"/></a>';
		htmls += '</div>';
		htmls += '</div>';
		htmls += '<p class="tweet">' + item.tweet + '</p>';
		if (item.image != "") {
			item.image = item.image.replace('${size}', '170x170');
			htmls += '<img class="ui-corner-none" src="' + item.image + '"/>';
		}

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
		htmls += '<img class="profilePic ui-li-thumb ui-corner-none" src="' + item.celebProfilePic + '"/>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<h3 class="ui-li-heading">' + item.celebFullname + '</h3>';
		htmls += '<p class="ui-li-desc">' + item.tweet + '</p>';
		htmls += '</a></li>';
		return htmls;
	},

	renderLoadMore : function() {
		var page = $.mobile.activePage;
		var pagename = $(page).data("title");
		console.log(pagename);
		var pageNo = $(page).data("page_num");
		pageNo = pageNo + 1;
		$(page).data("page_num", pageNo);
		var append = $(page).data("append");
		append = "true";
		$(page).data("append", append);
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
		if (pagename == "CelebrityDetailPic") {
			$('#celebDetailPic').trigger('pageshow');
		}
	},

	renderDetailCeleb : function(data, target, page, is_append) {
		var celebID = sessionStorage.ParameterCelebID;
		var celebItem = app.tweets[celebID];
		var entries = data.celebTweet;
		if (is_append == false) {
			$(target).html("");

			var htmls = '<div data-role="header" class="ui-header ui-bar-a">';
			htmls += '<img class="ui-li-thumb" src="' + celebItem.profilePic + '" width="75" height="75" />';
			htmls += '<h3 class="celeb ui-li-heading">' + celebItem.fullname + '</h3>';
			htmls += '<h4 class="celeb ui-li-heading">@' + celebItem.username + '</h4>';
			htmls += '</div>';
		}
		else{
			var htmls = "";
		}
		for (var i in entries) {
			var item = entries[i];
			if (page == "CelebrityDetail") {
				htmls += app.renderDetailCelebView(item);
			} else if (page == "CelebrityDetailPic") {
				htmls += app.renderDetailCelebPicsView(item);
			}
		}
		
		$(target).append(htmls);

		target.listview('refresh');
	},

	renderDetailCelebView : function(item) {
		var htmls = '<li>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<p class="tweet">' + item.tweet + '</p>';
		// if (item.image_url != "") {
		// htmls += '<img class="ui-corner-none" src="' + item.image_url + '"/>';
		// }
		htmls += '</li>';
		return htmls;
	},

	renderDetailCelebPicsView : function(item) {
		var htmls = '<li>';
		htmls += '<p class="time">' + item.timeago + '</p>';
		htmls += '<p class="tweet">' + item.tweet + '</p>';
		if (item.image_url != "") {
			item.image_url = item.image_url.replace('${size}', '75x75');
			htmls += '<img class="profilePic" src="' + item.image_url + '"/>';
		}
		htmls += '</li>';
		return htmls;
	},

	renderDetailCelebBio : function(data, target) {
		var item = data[0];
		$(target).html("");
		var htmls = '<div data-role="header" class="ui-header ui-bar-a">';
		htmls += '<img class="detailPic ui-li-thumb" src="' + item.profile_pic + '" width="75" height="75" />';
		htmls += '<h3 class="celeb >' + item.fullname + '</h3>';
		htmls += '<h4 class="celeb ">@' + item.username + '</h4>';
		htmls += '</div>';
		htmls += '<p class="bio">' + item.bio + '</p>';
		htmls += '<div class="ui-bar">';
		htmls += '<span><p class="tweet">' + item.tweets + '</p>';
		htmls += '<p class="tweet">Tweets</p></span>';
		htmls += '<span class="followers"><p class="tweet">' + item.followers + '</p>';
		htmls += '<p class="tweet">Followers</p></span>';
		htmls += '<span class="following"><p class="tweet">' + item.following + '</p>';
		htmls += '<p class="tweet">Following</p></span>';
		htmls += '</div>'

		$(target).append(htmls);

		target.listview('refresh');
	},

	callAjax : function(url, target, page, is_append) {
		console.log(is_append);
		$(".loader").show();
		$(".loadMore").parent("div").hide();
		$.ajax({
			type : "GET",
			url : url,
			dataType : "jsonp",
			success : function(data) {
				if (page == "DetailTrend") {
					app.renderTrendFeed(data, target);
				} else if (page == "CelebrityDetail" || page == "CelebrityDetailPic") {
					app.renderDetailCeleb(data, target, page, is_append);
				} else if (page == "CelebrityDetailBio") {
					app.renderDetailCelebBio(data, target);
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

