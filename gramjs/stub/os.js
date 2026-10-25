module.exports = {
	type: ()=> 'Browser',
	release: ()=> typeof navigator === 'undefined' ? '' : navigator.userAgent,
	hostname: ()=> 'web',
	platform: ()=> 'browser',
	arch: ()=> '',
}
