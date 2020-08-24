//用户登录
$("#easycraft-login-button").click(function(){
    $.ajax({
        url:'/api/login',
        type:'post',
        data:$("#easycraft-login-form").serialize(),
        success: function (data) {
            if (data.code==9000) {
                mdui.snackbar({
                    message: '登录成功',
                    position: 'right-top'
                });
                setTimeout(function () {
                    location = "/page/index";
                },3000);
            } else {
                mdui.snackbar({
                    message: data.message,
                    position: 'right-top'
                });
            }
        }
    })
});