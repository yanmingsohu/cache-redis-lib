
module.exports = {

	logLevel: 'ALL',

	redis_conf: {
		// 如果设置了 stream 参数, 则直接使用它作为底层连接对象, 而忽略其他连接参数
		// stream : net.Socket
	  host: "localhost",
	  port: "6379",
	  db: 1,
	  options: {
			// redis options see `redis README`
			// retry_strategy : function() 如果不设置则使用默认重试策略: 等待 15 秒重试
	    enable_offline_queue: true,
	    auth_pass: null,
	  },
	  defaultExpiration: 7200
	}
}
