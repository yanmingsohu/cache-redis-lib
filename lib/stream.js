module.exports = stream_mode;

//
// 当使用 stream 来初始化 client 时, 需要正确的处理重试消息
//
function stream_mode(client, stream, sub_cli) {
  var retry_bind = false;

  client.on('reconnecting', function(conf) {
    // 使用外部 stream 时, client 内部不在监听这些事件
    if (retry_bind) return;
    retry_bind = true;
    bindStreamEvent();
  });


  function bindStreamEvent() {
    stream.on('connect', function() {
      // 这个方法会触发 client Event:'connect'
      client.on_connect();
    });

    stream.on('close', function (hadError) {
      client.connection_gone('close');
    });

    stream.on('end', function () {
      client.connection_gone('end');
    });
  }

  // For Debug
  // stream.on('newListener', (event, listener) => {
  //   console.log('on =>', event, stream.listenerCount(event));
  // });
}
