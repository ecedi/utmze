'use strict';
/* global jQuery */
/* global console */
/* global document */

var doms;
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

        var _listSubDomains = function(domain) {
            doms = domain.split('.');
            if(doms.length <= 2 ) {
                return [domain];
            }

            var output = [];
            var i = doms.length -1 ;
            var tmp= '';
            //create an array
            for (i ; i >=0 ; i--) {
                tmp =  '.' + doms[i] + tmp;
                output.push(tmp);
            }
            //remove first item
            //output.shift();
            return output;

        };

        var _write = function(data, domains) {

            var _format = function(data) {

                //a simple js hash function to encode domain
                var _hash = function(d){
                    var a=1,c=0,h,o;
                    if(d){
                        a=0;
                        for(h=d['length']-1;h>=0;h--){
                            o=d.charCodeAt(h);
                            a=(a<<6&268435455)+o+(o<<14);
                            c=a&266338304;
                            a=c!=0?a^c>>21:a
                        }
                    }
                    return a;
                };

                var domainHash = '', timestamp = Date.now(), session=6, campaign=1, cData='';

                //flatten data object
                cData = 'utmcsr='+data.utmcsr+'|utmccn='+data.utmccn+'|utmcmd='+data.utmcmd;
                return _hash(document.domain) +'.'+ timestamp + '.' + session + '.' + campaign + '.' + cData;
            };

            var formatedCookie = _format(data);

            console.log(formatedCookie);

            $(domains).each(function(index, value) {
                console.log('domain: ' + value);
                $.cookie.raw = true;
                return $.cookie('__utmze', formatedCookie, { expires: 182, domain: value });
            });
        };

        //utmz code {source, name, medium}
        var oldCookie = {utmcsr : false, utmccn: false, utmcmd: false};

        if($.cookie('__utmze')) {
            //TODO ici il faut reverse parser le cookie?
            oldCookie = $.cookie('__utmze');
        }
        
        console.log('read cookie');
        console.log(oldCookie);

        var get = _getQueryParams(document.location.search);
        
        var _utmz = {utmcsr : oldCookie.source||false, utmccn: oldCookie.campaign||false, utmcmd: oldCookie.medium||false };

        console.log(get);

        var myDomain = _parseUrl(document.domain).hostname;

        // # source 
        // soit il est dans l'url et il prime
        // sinon on prend le domain issue du referrer
        // si le referrer est vide, on met (organic) par defaut
        if(get.hasOwnProperty('utm_source') ) {
            _utmz.utmcsr = get.utm_source;
        } else {
            var referrerDomain = _parseUrl(document.referrer).hostname;

            //find source source is referrer if not same domain
            if( referrerDomain === myDomain) {
                _utmz.utmcsr = oldCookie.utmcsr || false;
            } else {
                _utmz.utmcsr = referrerDomain;
            }

            //si pas de referrer on considère organic
            if(_utmz.utmcsr === '') {
                _utmz.utmcsr = '(direct)';
            }

            if(_utmz.utmcsr === false) {
                _utmz.utmcsr = '(organic)';
            }
            
        }


        // #campaign OK
        if(get.hasOwnProperty('utm_campaign')) {
            _utmz.utmccn = get.utm_campaign;
        }

        // medium on écrase le medium si il est dans l'url
        if(get.hasOwnProperty('utm_medium')) {
            _utmz.utmcmd = get.utm_medium;
        }

        console.log(_utmz);
        var writeDomains = _listSubDomains(myDomain);
        _write(_utmz, writeDomains);
        
        return this;
    };
}(jQuery));