//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     imgUrls: [
      '../../image/index_banner.jpg'
     ],
     indicatorDots: false,
     autoplay: false,
     interval: 1500,
     duration: 1500,
     userInfo:null,
     unionId:'',
     loaderhide:true,
     jumpLock:false,
     noticeClosed:false,
     canIUseWebView: wx.canIUse('web-view')
  },

  onLoad:function(option){
	  var _this = this;
    
    //请求Banner
    var param = { mini:'mini',
                  page:'管理设置导航页',
                  position:'顶部' };
    wx.request({
        url: app.globalData.host+'/banner/getBanner',  
        data: param,
        success: function (res) {
          if (res.data.errcode == 0) {
             var items = res.data.data
             var imgUrls = []
             for(var i in items){
                imgUrls.push(items[i].imgUrl)
             }
             if(imgUrls.length==1){
                 _this.setData({
                      indicatorDots: false,
                      autoplay: false,
                      imgUrls:imgUrls
                 }) 
             }else{
                 _this.setData({imgUrls:imgUrls})
             }
          }
        }
    })
    
    if(option.isLogout){
        console.log('退出登录后重新进入首页')
        app.globalData.userInfo = null
    }
    //获取全局数据，初始化当前页面
	  app.getUserInfo(function(userInfo){
	     //用户信息
	     _this.setData({
	       userInfo:userInfo
	     })
       if(option.q){
         var qrcode = decodeURIComponent(option.q);
         if(qrcode!='undefined'){
            _this.setData({ loaderhide:false });
            var a = qrcode.split('a=')[1];
            
            app.globalData.fromType = 2;

            wx.setStorageSync('items',null)

            //调用微信登录接口，获取code
            wx.login({
                success: function (r) {
                    var code = r.code;        //登录凭证
                    console.log(code);
                    if (code) {

                      //请求服务器，解密用户信息 获取unionId等加密信息
                      var param = { mini:'mini',
                                    jsCode:code,
                                    a:a
                                  };
                      wx.request({
                          url: app.globalData.host+'/indexForJson', 
                          method:'GET',
                          data: param,
                          success: function (res) {
                              //服务器返回的结果
                              console.log(res);
                              if (res.data.errcode == 0) {
                                  var orderNum = res.data.data,
                                     openId = res.data.miniOpenId,
                                     _openId = res.data.openId,
                                     userId = res.data.userId,
                                     shopId = res.data.shopId,
                                     unionId = res.data.unionId,
                                     mobile = res.data.mobile,
                                     cardNo =  res.data.cardNo,
                                     deskNo =  res.data.deskNo;
                                     
                                 app.globalData.shopId = shopId;
                                 app.globalData.openId = openId;
                                 app.globalData._openId = _openId;
                                 app.globalData.userId = userId;
                                 app.globalData.unionId = unionId;
                                 app.globalData.mobile = mobile;
                                 app.globalData.cardNo = cardNo;
                                 app.globalData.deskNo = deskNo;

                                  //请求门店信息
                                  var param = { mini:'mini',
                                                shopId:app.globalData.shopId,
                                                openId:app.globalData.openId };
                                  

                                  wx.request({
                                      url: app.globalData.host+'/shop/shopInfo',  
                                      data: param,
                                      success: function (res) {
                                          //服务器返回的结果
                                          console.log(res);
                                          _this.setData({ loaderhide:true });
                                          if (res.data.errcode == 0) {
                                              var shopName = res.data.data.shopName;
                                              app.globalData.shopName = shopName;
                                              
                                             //跳转控制
                                             if(orderNum){
                                                 wx.navigateTo({
                                                    url: '../order_list/index',
                                                    success:function(){
                                                            setTimeout(function(){
                                                                   _this.setData({jumpLock:false});
                                                            },500)
                                                     }
                                                 })
                                             }else{
                                                 wx.navigateTo({
                                                    url: '../index/index',
                                                    success:function(){
                                                            setTimeout(function(){
                                                                   _this.setData({jumpLock:false});
                                                            },500)
                                                     }
                                                 })
                                             }

                                          }else{
                                             wx.navigateTo({ url:'../view_state/index?error='+res.statusCode+'&errorMsg='+res.data.msg,
                                                             success:function(){
                                                              setTimeout(function(){
                                                                   _this.setData({jumpLock:false});
                                                              },500)
                                                             }
                                             })
                                          }
                                      }
                                  })

                              }
                        }
                      })
                  }
              }
            })
           
         }
       }
	  })
  },

  //解析二维码数据
  codeToInfo:function(a){
      var _this = this;
      var param = { 
           mini:'mini',
           openId:app.globalData.openId,
           a:a
      };
      console.log(param);

      wx.setStorageSync('items',null)
      wx.request({
          url: app.globalData.host+'/getOrderCount', 
          method:'GET',
          data: param,
          success: function (res) {
              //服务器返回的结果
              console.log(res);
              if (res.data.errcode == 0) {
                 var shopId = res.data.shopId,
                     shopName = res.data.shopName,
                     deskNo = res.data.deskNo,
                     orderNum = res.data.data;
                 app.globalData.shopId = shopId;
                 app.globalData.shopName = shopName;
                 app.globalData.deskNo = deskNo;
                 app.globalData.orderNum = orderNum;

                 //跳转控制
                 if(orderNum){
                     wx.navigateTo({
                        url: '../order_list/index',
                        success:function(){
                                setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                },500)
                         }
                     })
                 }else{
                     wx.navigateTo({
                        url: '../index/index',
                        success:function(){
                                setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                },500)
                         }
                     })
                 }
              }else{
                 wx.navigateTo({ url:'../view_state/index?error='+res.statusCode+'&errorMsg='+res.data.msg,
                                 success:function(){
                                  setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                  },500)
                                 }
                 })
              }
          }
      })
  },
  //自助点餐
  selfOrder:function(){
     var _this = this;
     //跳转锁定
     var userInfo = _this.data.userInfo;
     if(!userInfo) return;

     wx.navigateTo({url: '/pages/entrace/index'})
  },
  //外卖送餐
  takeAway:function(){
      app.globalData.fromType = 3;
      //微信版本过低，不支持web-view
      var canIUseWebView = this.data.canIUseWebView;
      if(!canIUseWebView){
        wx.showModal({
          content:'当前微信版本过低，需要使用该功能请更新至最新版本。',
          showCancel:false
        })
        return;
      }
      
      var userInfo = this.data.userInfo;
      if(!userInfo) return;
      

      var unionId = app.globalData.unionId;
      console.log(unionId);
      if(unionId == 0){
        wx.showModal({
          content:'请稍后重试',
          showCancel:false
        })
        return;
      }

      if(unionId == undefined){
        wx.showModal({
          content:'请先关注老娘舅公众号',
          showCancel:false
        })
        return;
      }

      var userId = app.globalData.userId;
      console.log('USERID='+userId);
      if(!userId){
         app.globalData.userInfo = null;  
         wx.navigateTo({url: '/pages/webLogin/index'})
      }else{
         app.globalData.pageFrom = 'homepage'
         wx.switchTab({url:'/pages/takeOut_index/index'})
      }

      
  },

  // 跳转会员中心
  JumpUserCenter:function(){
      // var userId = app.globalData.userId;
      // console.log('USERID='+userId);
      // if(!userId){
      //    app.globalData.userInfo = null;  
      //    wx.navigateTo({url: '/pages/webLogin/index'})
      // }else{
         wx.navigateTo({url:'/pages/webUsercenter/index'});
      // }
  },

  JumpWebShop:function(){
      wx.showModal({
          content:'敬请期待！',
          showCancel:false
      })
      return;
      wx.navigateTo({url:'/pages/webShop/index'});
  },

  JumpToList:function(){

      var _this = this
      var jumpLock = _this.data.jumpLock
      if(jumpLock) return
      _this.setData({jumpLock:true})

      wx.navigateTo({
          url: '../entrace_list/index',
          success:function(){
                  setTimeout(function(){
                         _this.setData({jumpLock:false});
                  },500)
           }
       })
  },

  onShow:function(scene){
    console.log('进入homepage页面')
    if(app.globalData.unionId){
        var param =  { mini:'mini',
                       openId:app.globalData.openId,
                       unionId:app.globalData.unionId
                     };
        wx.request({
            url: app.globalData.host+'/wxMini/getUseByUnionId', 
            data: param,
            success: function (res) {
              console.log(res)
              var userId = res.data.data.userId;
              var cardNo = res.data.data.cardNo;
              var mobile = res.data.data.mobile;
              if(app.globalData.userId!=userId){           //userId 发生变化
                    console.log('变化前userId'+app.globalData.userId)
                    console.log('变化后userId'+userId)
                    app.globalData.userId = userId
                    app.globalData.cardNo = cardNo
                    app.globalData.mobile = mobile
              }
            }
        })
    }
  },

  //=======提示框=========================================
  showDialog:function(msg){
      this.setData({
        dialogShow:true,
        contentMsg:msg
      })
  },
  dialogConfirm:function(){
      this.setData({
        dialogShow:false
      })
  }

})
