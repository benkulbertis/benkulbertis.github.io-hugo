$(document).ready(function () {

    $.fn.fadeEach = function (delay, callback) {
        this.each(function () {
            var $this = $(this);
            $this.delay(delay * $this.index()).animate({opacity: 1}, 400);
        }).promise().done(function () {
            $.isFunction(callback) && callback.call(this);
        });
        return this;
    };

    if (window.innerWidth > 1100) { // AKA not mobile
        /* Graceful degredation for JS effects */
        $('.post').css({overflowY: 'hidden'});
        $('#headers').css({borderBottom: 'none'});
        $('#headers > *, nav > *, section.post > *').css({opacity: 0});

        /* Yeah, that's right, brush that weak ass fade. - https://i.imgur.com/OTRjYgU.gif */
        $('#headers > h1, #headers > h2').fadeEach(300, function () {
            var $post = $('.post');
            $post.css({overflowY: 'auto'});
            $post.contents().fadeEach(50, function () {
                $('#headers').css({borderBottom: '1px dotted #dddddd'});
                $('nav').contents().fadeEach(50);
            });

        });
    }

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