var app = {

    init : function() {
        app.handelEvent();
    },

    handelEvent : function() {
        $(document).on('pageshow', function(e, data) {
            var page = $.mobile.activePage;
            var pagename = $(page).data("title");
            feed_url =  Config.servicePrefixUrl + $(page).data("rss");
            var url = encodeURI(feed_url);
            var target = $(page).find(".tweets");
            app.callAjax(url, target, pagename);
        });

        $(document).on('click', '.refresh', function(e, data) {
            app.callAjax(url, target);
        });
    },

    renderFeed : function(data, target, page) {
        var entries = data.data;
        $(target).html("");

        if (page == "Tweets" || page == "Pictures") {
            for (var i in entries) {
                var item = entries[i];
                var htmls = app.renderTweet(item);
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
        htmls += '<a href="detail.html/' + item.id + '">';
        htmls += '<img class="celeb-pic ui-corner-none" src="' + item.celebProfilePic + '"/>';
        htmls += '<p class="time">' + item.timeago + '</p>';
        htmls += '<p class="celeb-content">';
        htmls += '<h2>' + item.celebFullname + '</h2>';
        htmls += '<span>' + item.tweet + '</span>';
        htmls += '</p></a></li>';
        return htmls;
    },

    renderTrend : function(item) {
        var htmls = '<li>';
        htmls += '<img src="img/buttonbar-trends.png" />';
        htmls += '<h2>' + item.trend + '</h2>';
        htmls += '<img src="img/rating/' + parseInt(Math.min(item.weight + 1, 10)) + '.png" />';
        htmls += '<a href="select.html" data-role="button" data-icon="arrow-r" />';
        htmls += '</li>';
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

    callAjax : function(url, target, page) {
        $.ajax({
            type : "GET",
            url : url,
            dataType : "jsonp",
            success : function(data) {
                app.renderFeed(data, target, page);
            },
            error : function(data) {
                console.log(data);
            }
        });
    }
};

app.init();

