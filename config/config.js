
module.exports = {

	logLevel: 'ALL',

	redis_conf: {
	  host: "localhost",
	  port: "6379",
	  db: 1,
	  options: {
			// redis options see `redis README`
	    enable_offline_queue: true,
	    auth_pass: null
	  },
	  defaultExpiration: 7200
	}
}