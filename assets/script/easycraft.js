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
                setTimeout(function () {
                    location = "/page/index";
                }, 3000);
            }
            mdui.snackbar({
                message: data.message,
                position: 'right-top'
            });
        }
    })
});

//用户登录
$("#easycraft-register-button").on('click', function () {
    $.ajax({
        url: '/api/register',
        method: 'POST',
        data: $("#easycraft-register-form").serialize(),
        success: function (data) {
            data = JSON.parse(data);
            if (data.code == 9000) {
                setTimeout(function () {
                    location = "/page/index";
                }, 3000);
            }
            mdui.snackbar({
                message: data.message,
                position: 'right-top'
            });
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
                setTimeout(function () {
                    location.reload();
                }, 3000);
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
                run_status = data.data.starting;
                if (run_status) {
                    $('#easycraft-server-status-icon').html('pause');
                    $('#easycraft-server-status-text').html('停止');
                } else {
                    $('#easycraft-server-status-icon').html('play_arrow');
                    $('#easycraft-server-status-text').html('启动');
                }
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
$('#easycraft-console-send-cmd').on('keypress', function (e) {
    if (e.keyCode == 13) sendcmd();
})
$('#easycraft-server-console').on('wheel', function (e) {
    $('#easycraft-console-follow-select').prop('checked', false)
})

var log_clean_server = false;
$('#easycraft-swap-console').on('click', function () {
    if (!log_clean_server) {
        $('.easycraft-log').remove();
        $('#easycraft-swap-console').text("彻底清除日志");
        log_clean_server = true;
        setTimeout(function () {
            $('#easycraft-swap-console').text("清空日志");
            log_clean_server = false;
        }, 3000);
    } else {
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
                    log_clean_server = false;
                }
                mdui.snackbar({
                    message: data.message,
                    position: 'right-top'
                });
            }
        })
    }

});


function refreshserver() {
    $.ajax({
        method: 'POST',
        url: '/api/server',
        data: {
            sid: server_id
        },
        timeout: 5000,
        success: function (data) {
            data = JSON.parse(data);
            $('.easycraft-server-info-load-error').remove();
            if (data.code == 9000) {
                /*
                $('input[name=name]').val(data.data.name);
                $('input[name=maxplayer]').val(data.data.maxplayer);
                $('input[name=port]').val(data.data.port);
                $('input[name=ram]').val(data.data.ram);
                $('input[name=expiretime]').val(data.data.expiretime);
                //核心我不管了233
                */
                run_status = data.data.running;
                if (run_status) {
                    $('#easycraft-server-status-icon').html('pause');
                    $('#easycraft-server-status-text').html('停止');
                } else {
                    $('#easycraft-server-status-icon').html('play_arrow');
                    $('#easycraft-server-status-text').html('启动');
                }
            } else {
                $('.easycraft-server-title').after('<div class="mdui-typo mdui-text-color-red easycraft-server-info-load-error">服务器信息加载失败: ' + data.message + '</div>');

            }
        },
        error: function (xhr, e) {
            $('.easycraft-server-info-load-error').remove();
            $('.easycraft-server-title').after('<div class="mdui-typo mdui-text-color-red easycraft-server-info-load-error">服务器信息加载失败: ' + e + '</div>');
        }
    })
}

if ($('#easycraft-toggle-status').length == 1 && $('#easycraft-server-console').length == 0) {
    setInterval(refreshserver, 3000);
}


//公告编辑
$('#easycraft-edit-announcement').on('click', function () {
    $.ajax({
        method: 'POST',
        url: '/api/edit_announcement',
        data: {
            announcement: $('#easycraft-announcement').val()
        },
        timeout: 5000,
        success: function (data) {
            data = JSON.parse(data);
            mdui.snackbar({
                message: data.message,
                position: 'right-top'
            });
        }
    });
});


//服务器创建
//服务器信息编辑
$('#easycraft-server-create').on('click', function () {
    $.ajax({
        method: 'POST',
        url: '/api/new_server',
        data: $('#easycraft-server-add-form').serialize(),
        success: function (data) {
            data = JSON.parse(data);
            if (data.code == 9000) {
                setTimeout(function () {
                    location.reload();
                }, 3000);
            }
            mdui.snackbar({
                message: data.message,
                position: 'right-top'
            });
        }
    })
});

if (typeof(use_search) != "undefined"){
	var clipboard;
	var $$=mdui.$;
	$$(function () {

		var $data_search = $$('#data-search');
		var data_wraps = [];
		$$('.data-keyword-wrap').each(function (i, data) {
			var $wrap = $$(data);
			var data_name = $wrap.data('data-name');
			var data_keyword = $wrap.data('data-keyword');
			data_wraps.push({
				$wrap: $wrap,
				data_name: data_name,
				data_keyword: data_keyword
			});
		});

		// 自动聚焦到搜索框
		$data_search.get(0).focus();

		// 自动搜索
		$data_search.on('input', $$.throttle(function () {
			var value = $$(this).val();

			$$.each(data_wraps, function (i, obj) {
				var $wrap = obj.$wrap;
				var data_name = obj.data_name;
				var data_keyword = obj.data_keyword;

				// 搜索词用空格分隔表示并且
				var values = value.toLowerCase().split(' ');

				var data_name_find = true;
				var data_keyword_find = true;

				$$.each(values, function (i, value) {
					if (data_name.indexOf(value) === -1) {
						data_name_find = false;
					}
					if (data_keyword.indexOf(value) === -1) {
						data_keyword_find = false;
					}
				});
				if (data_name_find || data_keyword_find) {
					$wrap.show();
				} else {
					$wrap.hide();
				}
			});
		}, 200));
		
		// 点击图标弹出对话框
		$$(document).on('click', '.data-keyword-wrap', function () {
			var $this = $$(this);
			var datakeyword = $this.data('data-keyword');
			var dataName = $this.data('data-name');
		});


	});
}