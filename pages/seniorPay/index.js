//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        clickLock:false
    },
    onLoad:function(option){
       console.log(option)
       this.setData({  amount:option.amount,
                       amountVal:(option.amount/100).toFixed(2),
                       shopId:option.shopId,
                       shopName:option.shopName,
                       seniorCode:option.seniorCode,
                       isRenew:option.isRenew
                     })
   },
   payFun:function(){
      if(this.data.clickLock) return;
      this.setData({clickLock:true})
      console.log(app.globalData.mobile)

      var _this = this
      var param = { mini:'mini',
                    openId:app.globalData.openId,
                    mobile:app.globalData.mobile,
                    merId:3,
                    amount:this.data.amount/100,
                    userId:app.globalData.userId,
                    shopId:this.data.shopId,
                    seniorCode:this.data.seniorCode,
                    isRenew:this.data.isRenew
                  };
      wx.request({
          url: app.globalData.host+'/senior/addBill',  
          data: param,
          method:'POST',
          header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
          success: function (res) {
              //服务器返回的结果
              console.log(res);
              var resdata = res.data
              if(resdata.errcode == 0){     
                  //============调微信支付============//
                  wx.requestPayment({
                       'timeStamp': resdata.timeStamp,
                       'nonceStr': resdata.nonceStr,
                       'package': resdata.packages,
                       'signType': resdata.signType,
                       'paySign': resdata.paySign,
                       'success':function(res){
                             _this.setData({clickLock:false})
                             wx.navigateTo({
                               url: '../webSeniorsuccess/index?amount='+resdata.data.amount
                             })
                        },
                       'fail':function(res){
                            _this.setData({clickLock:false})
                            if(res.errMsg == 'requestPayment:fail cancel'){
                               wx.showModal({content:'支付已取消',showCancel:false })
                            }else{
                               wx.navigateTo({
                                 url: '../webChargefail/index?bala='+resdata.data.amount
                               })
                           }
                            
                        }
                 }) 
               }else{
                    wx.showModal({
                       content:'生成订单失败',
                       showCancel:false
                    })
                    _this.setData({clickLock:false})
               }
           }
      })
  },
  recordFun:function(){
    wx.navigateTo({ url: '../webChargelog/index' })
  },
  instructFun:function(){
    wx.navigateTo({ url: '../webChargetip/index' })
  }
})
