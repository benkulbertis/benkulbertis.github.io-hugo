$(document).ready(function () {
    $(window).resize(function () {
        var localLinks = 'a[href^="/"],a[href^="http://' + (document.location.hostname || document.location.host) + '"]';
        if (window.innerWidth > 1100) { // AKA not mobile
            $('#social').show();
            /* AJAXify */
            $(document).delegate(localLinks, "click", function (e) {
                e.preventDefault();
                History.pushState({}, "", this.pathname + "/");
            });
            History.Adapter.bind(window, 'statechange', function () {
                var State = History.getState();
                $.get(State.url, function (data) {
                    var title = $(data).filter("title").text();
                    document.title = title;
                    var $post = $('.post');
                    $post.fadeOut(300, function () {
                        $post.html($(data).filter('.post').contents());
                        $post.contents().css({opacity: 1});
                        $post.fadeIn(300);
                    });
                    ga('send', 'pageview', {
                        'page': State.hash,
                        'title': title
                    }); // Google analytics
                });
            });
        } else {
            $('#social').hide();
            $('.post').css({overflowY: 'visible'});
            var siteUrl = 'http://' + (document.location.hostname || document.location.host);
            $(document).undelegate(localLinks, "click");
        }
        /* Dynamic Resize */
        $('section').height(window.innerHeight - 40);
    }).resize();
});
