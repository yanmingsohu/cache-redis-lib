# 连接 Redis

config/config.js 存储配置


## install

`npm install cache-redis-lib --save`


## import

`var cache = require('cache-redis-lib')`


## usage

```js
//
// 创建一个连接, 断开后自动重新连接, 在成功连接之前, 其他方法会异常
// ext_conf -- 提供一个配置覆盖默认配置
//
var client = cache.createClient(ext_conf);

//
// 关闭连接
//
client.end();

//
// 创建一条与当前配置相同的独立连接
//
var c2 = client.createClient();

//
// 取得 key 的值, 返回字符串, 成功调用 getter, 失败调用 err_handle
// getter: Function(data)
// err_handle: Function(err)
//
client.get(key, getter, err_handle);

//
// 设置 key 的值为 value, 完成调用 set_over
// set_over: Function()
//
client.set(key, value, set_over, err_handle);

//
// 允许使用模糊查询所有符合的 key, 返回key 的列表
//
client.keys(key, getter, err_handle);

//
// 返回的数据解析为 JS 对象
//
client.getJSON(key, getter, err_handle);

//
// 设置 key 为 JS 对象
//
client.setJSON(key, value, set_over, err_handle)

//
// 删除 key
//
client.remove(key, set_over, err_handle)

//
// 切换数据库
//
client.db(dbname, set_over, err_handle)

```


## 消息队列

可以使用 pop/push 命令实现消息队列, 或使用封装好的方法,  
因为错误的顺序调用 pop/push 会导致客户端锁住.
--------------------------------------------------------------

队列式订阅, 若一个队列有多个订阅者, 
消息只会被唯一且等待时间最长的客户端接收

```js
//
// 向 fifo 队列发送一个消息
//
client.fsend(queue_name, value, fn);

//
// 订阅一个消息队列, 一旦有消息则 fn 被调用,
// 直到本次调用的 fn 返回, 下一条消息才会继续发送.
// 
// fn -- function(err, value, name);
//
var handle = client.fsubscribe(queue_name, fn);

//
// 终止对消息的订阅, 句柄会被回收
//
handle.end();
```

频道式订阅, 多个订阅者同时接受到一个频道的消息.  
这些函数会在内部创建另一个 redis 连接, 当前连接  
并不会受到影响, 仍然可以使用其他的命令.

```js
//
// 向频道发送消息
// fn -- function(err)
//
client.tsend(channel, msg, fn);

//
// 返回频道的订阅数量
// fn -- function(err, count);
//
client.tsubcount(channel, fn);

//
// 订阅频道
// fn -- function(err, msg, channel);
//
var handle = client.tsubscribe(channel, fn);

//
// 终止订阅
//
handle.end();

//
// 返回当前频道的订阅数量
// fn -- function(err, count);
//
handle.count(fn);

// 
// 模式订阅, 定义与之前相同
//
client.tpsend(...)
client.tpsubcount(...)
client.tpsubscribe(...)
```