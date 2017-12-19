//app.js
App({
  globalData: {
     host:'https://demo.i-manji.com/lnj-weixin/console/dc',
     userId:'',           //用户userId
     openId:'',           //小程序openId
     _openId:'',          //公众号_openId
     unionId:'',          //unionId
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
        typeof cb == "function" && cb(this.globalData.userInfo)
      } else {
        //调用微信登录接口，获取code
        wx.login({
            success: function (r) {
                var code = r.code;        //登录凭证
                if (code) {
                    //调用获取用户信息接口
                    wx.getUserInfo({
                        withCredentials: true,
                        success: function (res) {
                            //基本信息
                            // console.log(res);
                            _this.globalData.userInfo = res.userInfo;
                            typeof cb == "function" && cb(_this.globalData.userInfo);

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
                                    // console.log(res);
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
                                       wx.redirectTo({ url:'../view_state/index?error='+res.statusCode})
                                    }

                                },
                                fail: function () {
                                    console.log('系统错误')
                                    wx.redirectTo({ url:'../view_state/index?error=500'})
                                }
                            })
                        },
                        fail: function () {
                            console.log('获取用户信息失败')
                            wx.redirectTo({ url:'../view_state/index?error=500'})
                        }
                    })

                } else {
                    console.log('获取用户登录态失败' + r.errMsg)
                    wx.redirectTo({ url:'../view_state/index?error=500'})
                }
            },
            fail: function () {
                 console.log('登陆失败')
                 wx.redirectTo({ url:'../view_state/index?error=500'})
            }
        })
      }
  },
  onShow:function(scene){
    if(scene.path == "pages/takeOut_addr_add/index"){
        this.getUserInfo();
        return;
    };
    if(getCurrentPages()[0] && getCurrentPages()[0].route != 'pages/entrace/index'){
        wx.reLaunch({url:'../../pages/entrace/index'});
        this.getUserInfo();
    }
  },
  onHide:function(){
    this.globalData.userInfo = null;            //会员状态的改变，用户进公众号再进入小程序
  }
})
