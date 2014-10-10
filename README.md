# ecedi/utmze by [Agence Ecedi](http://ecedi.fr)

This is an alternative solution for tracking campaign as __utmz cookie is no more available with Google Analytics Universal

## installation

### edit your composer.json file and add

```json
	{
		"require": {
			"ecedi/utmze": "dev-master",
		},
		"repositories": [
			{
				"type": "vcs",
				"url": "https://github.com/ecedi/utmze"
			}
		]
	}
```

## features

this script will emulate __utmz cookie behavior to track traffic source, campaign and medium (other data are not supported so far)

### campaign behavior

campaign aka utmccn is false by default, when a GET parameter utm_campaign is set, it will be stored and stick until another utm_campaign is found

### medium behavior

medium aka utmcmd is false by default, when a GET parameter utm_medium is set, it will be stored and stick until another utm_campaign is found

### source behavior

Source aka utmcsr is a little bit more tricky:

We got 4 values to consider
  * utm_source GET parameters
  * current domain
  * referrer domain
  * last visit source

utm_source GET parameters will override any other value/behavior and will be stored whatever the other values are

TODO define and explain the precedence rules

## Usage

### javascript side

in header
```javascript
<head>
	<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
    <script src="/jquery-utmz.min.js"></script>
</head>
```

before ``</body>``

```javascript
<script type="text/javascript">
    $(document).ready(function() {
        $().utmz();
    }
</script>
```

### PHP side

If you want to parse the cookie in PHP, use any standard code you already use. 

Here are some classic code to look at
  * [Google Analytics PHP cookie parse](http://joaocorreia.pt/google-analytics-scripts/google-analytics-php-cookie-parser/)
  * [Code Example: Google Utmz Cookie Parser](http://daleconboy.com/portfolio/code/google-utmz-cookie-parser)
  * [Campaign Tracking - Web Tracking (ga.js)](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingCampaigns?hl=fr)

The cookie match the __utmz spec

## options

###  domainName (default: auto)

in auto mode jquery-utmz will try to write on all sub domains

If website domain is client.inte.paris.ecedi.fr jquery-utmz will try to write (in this order)
	* .ecedi.fr
	* .paris.ecedi.fr
	* .inte.paris.ecedi.fr
	* .client.inte.paris.ecedi.fr

### cookiePath (default: /)

specify the cookie path 

### expires (default: 182)

define the max age of the utmz cookie, 6 month by default (182 days)

```javascript
<script type="text/javascript">
    $(document).ready(function() {
        $().utmz({ expires: 7});
    }
</script>
```

### cookieName (default: __utmze)

define the cookie name, __utmze by default to not overlap with any old Google Analytics __utmz cookie

If you know what you are doing you can override to use the __utmz name

```javascript
<script type="text/javascript">
    $(document).ready(function() {
        $().utmz({ cookieNmae: '__utmz'});
    }
</script>
```



