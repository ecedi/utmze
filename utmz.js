'use strict';
/* global jQuery */
/* global console */
/* global document */

// require jquery and jquery-cookie
(function($){
    $.fn.utmz = function(){

        var _getQueryParams = function (qs) {
            qs = qs.split('+').join(' ');

            var params = {}, tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            }

            return params;
        };

        //get main domain (do not distinct subdomains)
        var _getDomain = function(domain) {
            var docdomain = domain.split('.');
            var dom1 = '';
            if (typeof (docdomain[docdomain.length - 2]) != 'undefined') dom1 = docdomain[docdomain.length - 2] + '.';
            var domain = dom1 + docdomain[docdomain.length - 1];

            return domain;
        };

        //utmz code
        console.log('in utmz');

        var oldCookie = JSON.parse($.cookie('__utmze'));
        
        console.log("read cookie");
        console.log(oldCookie);

        var get = _getQueryParams(document.location.search);
        
        var _utmz = {source : oldCookie.source, campaign: oldCookie.campaign };

        console.log(get);


        // # source 
        // soit il est dans l'url et il prime
        // sinon on prend le domain issue du referrer
        // si le referrer est vide, on met (organic) par defaut
        // TODO mais on n'écrase pas le referrer si c le meme que le domain courant

        if(get.hasOwnProperty('source') ) {
            _utmz.source = get.source;
        } else {
            _utmz.source = _getDomain(document.referrer);
        }

        //si pas de referrer on considère organic
        if(_utmz.source === '' || _utmz.source === false) {
            _utmz.source = '(organic)';
        }

        var myDomain = _getDomain(document.domain);

        //find source source is referrer if not same domain
        if(_utmz.source != myDomain) {
            //_utmz.source = _utmz.source;
        }

        // #campaign
        //fins campaign, from location hash
        if(get.hasOwnProperty('campaign')) {
            _utmz.campaign = get.campaign;
        }

        $.cookie.json = true;
        //write cookie for 6 month
        $.cookie('__utmze', _utmz, { expires: 182, domain: myDomain });
        
        console.log("write cookie");
        console.log(_utmz);

        return this;
    };
}(jQuery));