//index.js
//获取应用实例
var app = getApp()
Page({
   data:{
      error:''
   },
   onLoad: function (option) {
       console.log(option);
       if(option.errorMsg == 'undefined') option.errorMsg = '服务器出错了';
       this.setData({
          error:option.error,
          errorMsg:option.errorMsg?option.errorMsg:'服务器出错了'
       })
   },
   backFun:function(){
       wx.reLaunch({ url:'../homepage/index'})
   }
})
