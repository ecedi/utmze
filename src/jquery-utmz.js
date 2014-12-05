'use strict';
/* global jQuery */
/* global document */

// require jquery and jquery-cookie
(function($){
    $.fn.utmz = function(options){

         var opts = $.extend( {}, $.fn.utmz.defaults, options );
        
        /**
         * parse document.location.search to extract GET parameters
         * 
         * @param  string qs query string
         * @return array  array of GET parameters
         */
        var _getQueryParams = function (qs) {
            qs = qs.split('+').join(' ');

            var params = {}, tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            }

            return params;
        };
        
        /**
         * extract uri fragments (protocol, host, port, pathname, search, hash)
         * 
         * @param  string url an uri
         * @return object uri fragments
         */
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

        /**
         * Create a list of sub-domaines
         * ex if client domain is 'client.inte.paris.ecedi.fr' it will return an arryay like
         * ['.ecedi.fr', '.paris.ecedi.fr', '.inte.paris.ecedi.fr', 'client.inte.paris.ecedi.fr']
         *
         * The id is to produce a list of domainew where we will try to write the cookie. An attempt to
         * replicate  Google Analytics Universal 'auto' cookie domain discovery
         * 
         * @param  string domain a fqdn
         * @return array  list of subdomain available to write cookie to
         */
        var _listSubDomains = function(domain) {
            var doms = domain.split('.');
            if(doms.length <= 2 ) {
                return [domain];
            }

            var output = [];
            var i = doms.length -1 ;
            var tmp= '';
            
            for (i ; i >=0 ; i--) {
                tmp =  '.' + doms[i] + tmp;
                output.push(tmp);
            }
            //remove first item
            output.shift();
            return output;

        };

        /**
         * format the json object as a proper utmz value
         * 
         * @param  {object} data the utmz v
         * @return {string} the cookie value, mocking _utmz format
         */
        var _serialize = function (data) {

                /**
                 * a simple js hash function to encode domain
                 * @param  string d the string to hash
                 * @return string the hash
                 */
                var _hash = function(d){
                    var a=1,c=0,h,o;
                    if(d){
                        a=0;
                        for(h=d.length-1;h>=0;h--){
                            o=d.charCodeAt(h);
                            a=(a<<6&268435455)+o+(o<<14);
                            c=a&266338304;
                            a=c!==0?a^c>>21:a;
                        }
                    }
                    return a;
                };

                var timestamp = Date.now(), session=6, campaign=1, cData= '';

                //flatten data object
                cData = 'utmcsr='+data.utmcsr+'|utmccn='+data.utmccn+'|utmcmd='+data.utmcmd;
                return _hash(document.domain) +'.'+ timestamp + '.' + session + '.' + campaign + '.' + cData;

        };

        /**
         * format a utmz cookie string into a json object
         * @param  {string} str _utmz cookie value
         * @return {object} 
         */
        var _deserialize = function(str) {
            var pairs = str.split('.').slice(4).join('.').split('|');
            var ga = {};
            for (var i = 0; i < pairs.length; i++) {
                var temp = pairs[i].split('=');
                ga[temp[0]] = temp[1];
            }
            return ga;
        };
        
        /**
         * write cookie
         * 
         * @param  {object} data    the json object to write as a cookie string
         * @param  {array} domains  list of domains to write cookie in
         * @return {void}
         */
        var _write = function(data, domains) {

            var formatedCookie = _serialize(data);

            $.cookie.raw = true;

            if(opts.domainName === 'auto') {
                $(domains).each(function(index, value) {
                    return $.cookie(opts.cookieName, formatedCookie, { expires: opts.expires, domain: value, path: opts.cookiePath  });
                });
            } else {
                return $.cookie(opts.cookieName, formatedCookie, { expires: opts.expires, domain: opts.domainName, path: opts.cookiePath });
            }
        };

        //utmz code {source, name, medium}
        var oldCookie = {utmcsr : '(direct)', utmccn: false, utmcmd: false};

        if($.cookie(opts.cookieName)) {
            oldCookie = _deserialize($.cookie(opts.cookieName));
        }
        var get = _getQueryParams(document.location.search);
        
        var _utmz = {utmcsr : oldCookie.utmcsr||'(direct)', utmccn: oldCookie.utmccn||false, utmcmd: oldCookie.utmcmd||false };

        var myDomain = _parseUrl(document.domain).hostname;

        // # source simple sticky               
        if(get.hasOwnProperty('utm_source') ) {
            _utmz.utmcsr = get.utm_source;
        } else {
            //if not explicit utm_source and we have a direct (i.e no cookie before)
            //we put referer as sticky
            if(_utmz.utmcsr === '(direct)') {
                var referrer = _parseUrl(document.referrer).hostname;
                if(referrer !== '') {
                    //we test popular search engines
                    var GOOGLE = /www.google/;
                    var YAHOO = /search.yahoo/;
                    var BING = /www.bing/;
                    if(GOOGLE.test(referrer)){
                        _utmz.utmcsr = 'Google Search';
                    } else if(YAHOO.test(referrer)){
                        _utmz.utmcsr = 'Yahoo Search';
                    } else if(BING.test(referrer)){
                        _utmz.utmcsr = 'Bing Search';
                    } else {
                        //otherwise we set the referrer as is
                        _utmz.utmcsr = referrer;
                    }
                }
            }
        }

        // #campaign
        if(get.hasOwnProperty('utm_campaign')) {
            _utmz.utmccn = get.utm_campaign;
        }

        // medium on écrase le medium si il est dans l'url
        if(get.hasOwnProperty('utm_medium')) {
            _utmz.utmcmd = get.utm_medium;
        }

        var writeDomains = _listSubDomains(myDomain);
        _write(_utmz, writeDomains);
        
        return this;
    };

    // Plugin defaults – added as a property on our plugin function.
    $.fn.utmz.defaults = {
        domainName: 'auto',
        cookiePath: '/',
        expires: 61,
        cookieName: '__utmze'
    };
}(jQuery));