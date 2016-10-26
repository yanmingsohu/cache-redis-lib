module.exports = bind_fn;


//
// 这些方法把回调函数分拆成两个函数, 一个接受正常数据, 一个接受错误, 
// 这违反了通俗上的约定但可以节省出错处理.
// 为了兼容老版本, 这些 api 被保留, 但是通常不推荐这样做.
//
function bind_fn(retObj, client, logger) {

  retObj.db = function(dbindex, set_over, err_handle) {
    client.select(dbindex, function(err, data) {
      exception(err, value_cross(data, set_over), err_handle);
    });
  }

  // 导出已有的方法
  retObj.get = function(key, getter, err_handle) {
    client.get(key, function(err, data) {
      exception(err, value_cross(data, getter), err_handle);
    });
  };

  retObj.set = function(key, value, set_over, err_handle) {
    client.set(key, value, function(err, data) {
      exception(err, value_cross(data, set_over), err_handle);
    });
  };

  retObj.keys = function(key, set_over, err_handle) {
    client.keys(key, function(err, data) {
      exception(err, value_cross(data, set_over), err_handle);
    });
  };

  // 导出函数: getJSON(key, getter) -- 成功回调 getter, 并把
  //    key对应的数据传递给 getter
  // key        : string
  // getter     : function(object)
  // err_handle : function(new Error)
  retObj.getJSON = function(key, getter, err_handle) {
    client.get(key, function(err, data) {
      
      exception(err, 
        function() {
          var ret = JSON.parse(data);
          if (ret == null) {
            throw new Error("Redis 中找不到 [" + key + "] 的 JSON 对象");
          }
          getter(ret);
        }, 
        err_handle);
    });
  };


  // 保存对象为 JSON 格式
  retObj.setJSON = function(key, value, set_over, err_handle) {
    client.SET(key, JSON.stringify(value), function(err, data) {
      exception(err, value_cross(data, set_over), err_handle);
    });
  };


  // 删除 KEY
  retObj.remove = function(key, del_over, err_handle) {
    client.DEL(key, function(err, data) {
      exception(err, del_over, err_handle);
    });
  };


  // 绑定其他函数
  for (var n in client) {
    if (!retObj[n]) {
      if (typeof client[n] === 'function') {
        (function() {
          var fn = client[n];
          retObj[n] = function() {
            fn.apply(client, arguments);
          };
        })();
      }
    }
  }
}


// 统一处理错误
// msg -- 如果 fn 抛出异常的错误消息
// err        : new Error()
// fn         : function()
// err_handle : function(new Error);
function exception(err, fn, err_handle) {
  if (err) {
    if (err_handle) 
      err_handle(err);
    else 
      logger.debug(err);
    return;
  }

  try {
    fn && fn();

  } catch(e) {
    if (err_handle) 
      err_handle(e);
    else
      logger.debug(e);
  }
}


function value_cross(val, fn) {
  if (!fn) return null;
  return function() {
    fn(val);
  };
}