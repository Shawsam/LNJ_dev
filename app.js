//全局配置
var config = {};
config.mode = "run";                          // 运行模式
config.host = "https://weixin.chinauff.com";  // 接口域名
config.mode = "dev";                          // 开发模式
config.host = "https://demo.micvs.com";       // 接口域名

App({
  globalData: {
     webUrl:config.host,
     host:config.host+'/lnj-weixin/console/dc',
     userId:'',           //用户userId
     openId:'',           //小程序openId
     _openId:'',          //公众号_openId
     unionId:0,          //unionId
     shopId:'',           //当前店铺id
     shopName:'',         //当前店铺名    
     orderNum:0,          //当前店铺订单数量
     deskNo:'',           //当前桌号
     cardNo:'',           //用户会员账户号
     mobile:'',           //用户手机号
     fromType:'',         //渠道区分  1、预约打包 2、自助点餐 3、外卖送餐
     userInfo:null        //微信登录接口获取的用户信息
  },
  getUserInfo: function(cb) {                           
      var _this = this
      if (this.globalData.userInfo) {     
        console.log('全局用户信息参数传递')      
        typeof cb == "function" && cb(this.globalData.userInfo)
      } else {
        console.log('全局用户信息重新获取，参数传递') 
        // 查看是否授权
        wx.getSetting({
          success: function(res){
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称
              wx.getUserInfo({
                success: function(res) {
                  _this.globalData.userInfo = res.userInfo
                  cb(res.userInfo)
                }
              })

              //调用微信登录接口，获取code
              wx.login({
                  success: function (r) {
                      var code = r.code;        //登录凭证
                      if (code) {
                          //请求服务器，解密用户信息 获取unionId等加密信息
                          var param = { mini:'mini',
                                        jsCode:code
                                      };
                          wx.request({
                              url: _this.globalData.host+'/getMiniOpen', 
                              method:'POST',
                              header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
                              data: param,
                              success: function (res) {
                                  //服务器返回的结果
                                  console.log('==getMiniOpen接口返回信息==');
                                  console.log(res);
                                  if (res.data.errcode == 0) {
                                     var openId = res.data.miniOpenId,
                                         _openId = res.data.openId,
                                         userId = res.data.userId,
                                         unionId = res.data.unionId,
                                         mobile = res.data.mobile,
                                         cardNo =  res.data.cardNo;
                                     _this.globalData.openId = openId;
                                     _this.globalData._openId = _openId;
                                     _this.globalData.userId = userId;
                                     _this.globalData.unionId = unionId;
                                     _this.globalData.mobile = mobile;
                                     _this.globalData.cardNo = cardNo;
                                  } else {
                                     console.log('服务器异常');
                                     wx.redirectTo({ url:'../view_state/index?error='+res.statusCode+'&errorMsg=服务器异常'})
                                  }

                              },
                              fail: function () {
                                  console.log('网络错误，请重试')
                                  wx.redirectTo({ url:'../view_state/index?errorMsg=网络错误，请重试'})
                              }
                          })
                      } else {
                          console.log('获取用户登录态失败' + r.errMsg)
                          var errMsg = '获取用户登录态失败' + r.errMsg;
                          wx.redirectTo({ url:'../view_state/index?errorMsg='+errMsg })
                      }
                  },
                  fail: function () {
                       console.log('登陆失败')
                       var errMsg = '登录失败';
                       wx.redirectTo({ url:'../view_state/index?errorMsg='+errMsg })
                  }
              })

            }else{
              wx.redirectTo({url:"../authorize/index"})
            }
          }
        })
      }
  },
  onShow:function(scene){
    console.log('小程序进程被唤起')
    var _this = this
    if(this.globalData.unionId){
        var param =  { mini:'mini',
                       openId:this.globalData.openId,
                       unionId:this.globalData.unionId
                     };
        wx.request({
            url: this.globalData.host+'/wxMini/getUseByUnionId', 
            data: param,
            success: function (res) {
              console.log(res)
              var userId = res.data.data.userId;
              var cardNo = res.data.data.cardNo;
              var mobile = res.data.data.mobile;
              if(_this.globalData.userId!=userId){           //userId 发生变化
                   console.log('变化前userId'+_this.globalData.userId)
                   console.log('变化后userId'+userId)
                  _this.globalData.userId = userId
                  _this.globalData.cardNo = cardNo
                  _this.globalData.mobile = mobile
                  wx.reLaunch({ url:'../homepage/index'})
              }
            }
        })
    }
  }
})
