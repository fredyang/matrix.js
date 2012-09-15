(function(window) {
    'use strict';

    if (location.hostname === 'code.semanticsworks.com') {
        var _gaq = [
            ['_setAccount', 'UA-34311489-1'],
            ['_trackPageview']
        ];
        (function(d, t) {
            var g = d.createElement(t),
                s = d.getElementsByTagName(t)[0];
            g.src = '//www.google-analytics.com/ga.js';
            s.parentNode.insertBefore(g, s)
        }(document, 'script'));
    }
})(window);
