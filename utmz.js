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
        
        var _parseUrl = function(url) {
            var parser = document.createElement('a'),
            searchObject = {},
            queries, split, i;
            // Let the browser do the work
            
            parser.href = url;
            queries = parser.search.replace(/^\?/, '').split('&');

            for( i = 0; i < queries.length; i++ ) {
                split = queries[i].split('=');
                searchObject[split[0]] = split[1];
            }

            return {
                protocol: parser.protocol,
                host: parser.host,
                hostname: parser.hostname,
                port: parser.port,
                pathname: parser.pathname,
                search: parser.search,
                searchObject: searchObject,
                hash: parser.hash
            };
        };

        //utmz code
        var oldCookie = {source : false, campaign: false, medium: false};

        if($.cookie('__utmze')) {
            oldCookie = JSON.parse($.cookie('__utmze'));
        }
        
        console.log('read cookie');
        console.log(oldCookie);

        var get = _getQueryParams(document.location.search);
        
        var _utmz = {source : oldCookie.source, campaign: oldCookie.campaign, medium: oldCookie.medium };

        console.log(get);

        var myDomain = _parseUrl(document.domain).hostname;

        // # source 
        // soit il est dans l'url et il prime
        // sinon on prend le domain issue du referrer
        // si le referrer est vide, on met (organic) par defaut
        if(get.hasOwnProperty('utm_source') ) {
            _utmz.source = get.utm_source;
        } else {
            var referrerDomain = _parseUrl(document.referrer).hostname;

            //find source source is referrer if not same domain
            if( referrerDomain === myDomain) {
                _utmz.source = oldCookie.source || false;
            } else {
                _utmz.source = referrerDomain;
            }

            //si pas de referrer on considère organic
            if(_utmz.source === '') {
                _utmz.source = '(direct)';
            }

            if(_utmz.source === false) {
                _utmz.source = '(organic)';
            }
            
        }


        // #campaign OK
        if(get.hasOwnProperty('utm_campaign')) {
            _utmz.campaign = get.utm_campaign;
        }

        // medium on écrase le medium si il est dans l'url
        if(get.hasOwnProperty('utm_medium')) {
            _utmz.medium = get.utm_medium;
        }


        var _listSubDomains = function(domain) {
            var doms = domain.split('.');
            console.log(doms);

        };

        $.cookie.json = true;
        //write cookie for 6 month
        //TODO try to write on lower domains first
        var writeDomains = _listSubDomains(myDomain);
        
        console.log('write cookie');
        console.log(_utmz);

        $.cookie('__utmze', _utmz, { expires: 182, domain: '.loc' });
        

        
        return this;
    };
}(jQuery));