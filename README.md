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

## Usage
Parse cookie 

```php
```


in header
```javascript
<head>
	<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
    <script src="/utmz.js"></script>
</head>
```

before ``</body>``
```javascript
    $(document).ready(function() {
        $().utmz();
    }
</script>
```
