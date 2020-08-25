var $ = mdui.$;
//用户登录
$("#easycraft-login-button").on('click', function () {
    $.ajax({
        url: '/api/login',
        method: 'POST',
        data: $("#easycraft-login-form").serialize(),
        success: function (data) {
            data = JSON.parse(data);
            if (data.code == 9000) {
                mdui.snackbar({
                    message: '登录成功',
                    position: 'right-top'
                });
                setTimeout(function () {
                    location = "/page/index";
                }, 3000);
            } else {
                mdui.snackbar({
                    message: data.message,
                    position: 'right-top'
                });
            }
        }
    })
});

//服务器开关
$('#easycraft-toggle-status').on('click', function () {
    $.ajax({
        method: 'POST',
        url: run_status ? '/api/stop_server' : '/api/start_server',
        data: {
            sid: server_id
        },
        success: function (data) {
            data = JSON.parse(data);
            if (data.code == 9000) {
                run_status = !run_status;
                if (run_status) {
                    $('#easycraft-server-status-icon').html('pause');
                    $('#easycraft-server-status-text').html('停止');
                } else {
                    $('#easycraft-server-status-icon').html('play_arrow');
                    $('#easycraft-server-status-text').html('启动');
                }
            }
            mdui.snackbar({
                message: data.message,
                position: 'right-top'
            });
        }
    });
});

//服务器信息编辑
$('#easycraft-server-info-save').on('click', function () {
    $.ajax({
        method: 'POST',
        url: '/api/edit_server',
        data: $('#easycraft-server-info-form').serialize(),
        success: function (data) {
            data = JSON.parse(data);
            if (data.code == 9000) {
                setTimeout(function () { location.reload(); }, 3000);
            }
            mdui.snackbar({
                message: data.message,
                position: 'right-top'
            });
        }
    })
});

var lastlogid = 0;

function refreshlog() {
    $.ajax({
        method: 'POST',
        url: '/api/log',
        timeout: 5000,
        data: {
            sid: server_id,
            lastlogid: lastlogid
        },
        success: function (data) {
            data = JSON.parse(data);
            $('.easycraft-log-get-error').remove();
            if (data.code == 9000) {
                lastlogid = data.data.lastlogid;
                data.data.logs.forEach(log => {
                    $('.easycraft-log-latest').removeClass('easycraft-log-latest');
                    if (log.iserror) {
                        $('#easycraft-server-console').append("<p class=\"easycraft-log-latest easycraft-log mdui-text-color-red\"><strong>" + log.message + "</strong></p>")
                    } else {
                        $('#easycraft-server-console').append("<p class=\"easycraft-log-latest easycraft-log\"><strong>" + log.message + "</strong></p>")
                    }
                });
            } else {
                $('#easycraft-server-console').append("<p class=\"easycraft-log-latest easycraft-log-get-error mdui-text-color-red\"><strong>读取日志失败: " + data.message + "</strong></p>")
            }
            if ($('#easycraft-console-follow-select').prop('checked') && document.getElementsByClassName('easycraft-log-latest').length != 0)
                document.getElementsByClassName('easycraft-log-latest')[0].scrollIntoView();
        },
        error: function (xhr, textStatus) {
            $('.easycraft-log-get-error').remove();
            $('.easycraft-log-latest').removeClass('easycraft-log-latest');
            $('#easycraft-server-console').append("<p class=\"easycraft-log-latest easycraft-log-get-error mdui-text-color-red\"><strong>获取日志失败: " + textStatus + "</strong></p>")
            if ($('#easycraft-console-follow-select').prop('checked') && document.getElementsByClassName('easycraft-log-latest').length != 0)
                document.getElementsByClassName('easycraft-log-latest')[0].scrollIntoView();
        }
    })
}

//日志获取
$(function () {
    if ($('#easycraft-server-console').length != 0) {
        setInterval(refreshlog, 3000);
        refreshlog();
    }
});

//命令发送
function sendcmd() {
    $.ajax({
        method: 'POST',
        url: '/api/cmd',
        data: {
            sid: server_id,
            cmd: $('#easycraft-console-send-cmd').val()
        },
        success: function (data) {
            data = JSON.parse(data);
            if (data.code == 9000) {
                $('#easycraft-console-send-cmd').val('')
            }
            mdui.snackbar({
                message: data.message,
                position: 'right-top'
            });
        }
    })
}

$('#easycraft-console-send-button').on('click', sendcmd);
$('#easycraft-console-send-cmd').on('keypress',function(e){if(e.keyCode==13) sendcmd();})
$('#easycraft-server-console').on('wheel',function(e){console.log(e);$('#easycraft-console-follow-select').prop('checked',false)})
	
var log_clean_server = false;
$('#easycraft-swap-console').on('click',function (){
	if (!log_clean_server){
		$('.easycraft-log').remove();
		$('#easycraft-swap-console').text("彻底清除日志");
		log_clean_server=true;
		setTimeout(function(){
			$('#easycraft-swap-console').text("清空日志");
			log_clean_server=false;
		},3000);
	}else{
		$.ajax({
        method: 'POST',
        url: '/api/clear_log',
        data: {
            sid: server_id
        },
        success: function (data) {
            data = JSON.parse(data);
            if (data.code == 9000) {
                $('.easycraft-log').remove();
				$('#easycraft-swap-console').text("清空日志");
				log_clean_server=false;
            }
            mdui.snackbar({
                message: data.message,
                position: 'right-top'
            });
        }
    })
	}

});