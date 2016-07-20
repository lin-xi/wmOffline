# wmOffline
waimai offline dev tool

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-url]: http://npmjs.org/package/wm-offline
[download-url]: http://npmjs.org/package/wm-offline

##install
```
npm install -g wm-offline
```

##usage
```
wm-offline start
```

##config
add offline-config.json to the root of your project
```
{
	"root": "./examples",
	"deploy": [
		{
			"receiver": "http://cp01-shimiao01.epc.baidu.com:8797/receiver.php",
			"to": "/home/map/odp_cater/webroot/static/offline"
		}
	]
}
```

##receiver

php version
https://github.com/fex-team/fis-command-release/blob/master/tools/receiver.php

node version
https://github.com/fex-team/receiver
