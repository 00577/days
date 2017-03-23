var dateYearWidth = '5em', dateMonthWidth = '3.5em', dateDayWidth = '3.5em';

var dataDigPool = 'digPool',
    dataDigPrePush = 'digPrePush',
    dataDigFlow = 'digFlow';

var J_dateYear1 = 'J_dateYear1',
    J_dateMonth1 = 'J_dateMonth1',
    J_dateDay1 = 'J_dateDay1',
    J_dateYear2 = 'J_dateYear2',
    J_dateMonth2 = 'J_dateMonth2',
    J_dateDay2 = 'J_dateDay2';

var J_calculate = 'J_calculate',
    J_calculateText = 'J_calculateText';

var C_digitItems = 'digit-items',
    C_digitInit = 'init-zero',
    C_digitPrefix = 'digit-',
    C_calculateError = 'calculate-error',
    C_calculateRunning = 'calculate-running',
    C_calculateRunningInfinite = 'running-infinite';

$(function(){
    $.fn.select2.defaults.set('language', 'zh-CN');

    var dateObj = new Date();
    var currentYear = dateObj.getFullYear();
    var currentMonth = dateObj.getMonth() + 1;
    var currentDay = dateObj.getDate();

    //初始与最大值区间  5位数的
    var startYearEdge = 1900;
    var endYearEdge = currentYear + 100;
    var endYearAbort = 2173;
    if (endYearEdge > endYearAbort) {
        endYearEdge = endYearAbort;
    }

    var i, tmpObj1, tmpObj2;
    //设定值
    var setYear1 = currentYear,
        setYear2 = currentYear,
        setMonth1 = currentMonth,
        setMonth2 = currentMonth,
        setDay1 = currentDay,
        setDay2 = currentDay;

    var yearData1 = [], yearData2 = [];
    for (i = startYearEdge; i < endYearEdge; i++) {
        tmpObj1 = {id: i, text: i};
        tmpObj2 = {id: i, text: i};
        if (i == setYear1) {
            tmpObj1['selected'] = true;
        }
        if (i == setYear2) {
            tmpObj2['selected'] = true;
        }
        yearData1.push(tmpObj1);
        yearData2.push(tmpObj2);
        tmpObj1 = null;
        tmpObj2 = null;
    }
    var monthData1 = [], monthData2 = [];
    for (i = 1; i < 13; i++) {
        tmpObj1 = {id: i, text: i};
        tmpObj2 = {id: i, text: i};
        if (i == setMonth1) {
            tmpObj1['selected'] = true;
        }
        if (i == setMonth2) {
            tmpObj2['selected'] = true;
        }
        monthData1.push(tmpObj1);
        monthData2.push(tmpObj2);
        tmpObj1 = null;
        tmpObj2 = null;
    }
    var dayData1 = [];
    var daysCount1 = getDaysCount(setYear1, setMonth1);
    for (i = 1; i <= daysCount1; i++) {
        tmpObj1 = {id: i, text: i};
        if (i== setDay1) {
            tmpObj1['selected'] = true;
        }
        dayData1.push(tmpObj1);
        tmpObj1 = null;
    }
    var dayData2 = [];
    var daysCount2 = getDaysCount(setYear2, setMonth2);
    for (i = 1; i <= daysCount2; i++) {
        tmpObj2 = {id: i, text: i};
        if (i== setDay2) {
            tmpObj2['selected'] = true;
        }
        dayData2.push(tmpObj2);
        tmpObj2 = null;
    }
    //设置 select2
    $('#'+ J_dateYear1).select2({
        placeholder: '年',
        data: yearData1,
        width: dateYearWidth
    });
    $('#'+ J_dateMonth1).select2({
        placeholder: '月',
        data: monthData1,
        width: dateMonthWidth
    });
    $('#'+ J_dateDay1).select2({
        placeholder: '日',
        data: dayData1,
        width: dateDayWidth
    });
    $('#'+J_dateYear2).select2({
        placeholder: '年',
        data: yearData2,
        width: dateYearWidth
    });
    $('#'+J_dateMonth2).select2({
        placeholder: '月',
        data: monthData2,
        width: dateMonthWidth
    });
    $('#'+J_dateDay2).select2({
        placeholder: '日',
        data: dayData2,
        width: dateDayWidth
    });
    //联动 天
    daysTransform(J_dateYear1, J_dateMonth1, J_dateDay1);
    daysTransform(J_dateYear2, J_dateMonth2, J_dateDay2);

    //弹出 延时
    var popDfd = $.Deferred();
    var eventPopDfd = {popDfd: popDfd};
    //弹出完成时 进行推入
    popDfd.progress(function(){
        //transitionend 方向改变
        $('#'+J_calculate).data(dataDigFlow, 'in');
        $('.'+ C_digitItems).removeClass(C_digitInit);
        var digPrePush = $('#'+ J_calculate).data(dataDigPrePush) || {};
        $.each(digPrePush, function(k, v){
            $('.'+ C_digitItems).eq(k).addClass(C_digitPrefix+v);
        });
    });
    //推入 延时
    var pushDfd = $.Deferred();
    //推入完成时
    pushDfd.progress(function(){
        //
        $('#'+ J_calculateText).removeClass(C_calculateRunningInfinite);
        //按钮可用 绑定事件
        $('#'+ J_calculate).on('click', eventPopDfd, calculateHandler);
    });

    //digPool  digPrePush  digFlow  绑定事件
    $('#'+ J_calculate).on('click', eventPopDfd, calculateHandler);

    //错误 动画完成时
    $('#'+ J_calculate).on(whichAnimationEnd(), function(){
        $('#'+ J_calculate).removeClass('wobble animated');
        //按钮可用 绑定事件
        $('#'+ J_calculate).on('click', eventPopDfd, calculateHandler);
    });
    //动画事件监听
    $('.'+ C_digitItems).on(whichTransitionEnd(), function() {
        var digFlow = $('#'+ J_calculate).data(dataDigFlow);
        var k = $(this).parent().index();
        //如果初始 digPool为undefined需要取{}
        var digPool = $('#'+ J_calculate).data(dataDigPool) || {};
        if (digFlow == 'out') {
            delete digPool[k];
            $('#'+ J_calculate).data(dataDigPool, digPool);
            //返回初始状态完成
            if ($.isEmptyObject(digPool)) {
                //停顿 300ms
                setTimeout(function(){
                    popDfd.notify();
                }, 300);
            }
        }
        if (digFlow == 'in') {
            var digPrePush = $('#'+ J_calculate).data(dataDigPrePush) || {};
            var v = digPrePush[k];
            digPool[k] = v;
            $('#'+ J_calculate).data(dataDigPool, digPool);
            if (Object.keys(digPrePush).length == Object.keys(digPool).length) {
                pushDfd.notify();
            }
        }
    });

    //初始载入 触发
    $('#'+ J_calculate).trigger('click');
});

//计算事件
function calculateHandler(event) {
    //取消事件  按钮不可用
    $('#'+ J_calculate).off('click');
    //获取 日期
    var year1Val = parseInt($('#'+ J_dateYear1).val());
    var month1Val = parseInt($('#'+ J_dateMonth1).val());
    var day1Val = parseInt($('#'+ J_dateDay1).val());
    var year2Val = parseInt($('#'+ J_dateYear2).val());
    var month2Val = parseInt($('#'+ J_dateMonth2).val());
    var day2Val = parseInt($('#'+ J_dateDay2).val());
    if (isNaN(year1Val) || isNaN(year2Val) || isNaN(month1Val) || isNaN(month2Val) || isNaN(day1Val) || isNaN(day2Val)) {
        //错误存在
        $('#'+ J_calculate).addClass('wobble animated');
    } else {
        //天数计算
        var digPrePush = {};
        var dateMs1 = Date.parse(month1Val+'/'+day1Val+'/'+year1Val);
        var dateMs2 = Date.parse(month2Val+'/'+day2Val+'/'+year2Val);
        if (isNaN(dateMs1) || isNaN(dateMs2)) {
            //错误存在
            $('#'+ J_calculate).addClass('wobble animated');
        } else {
            var dateInterval = Math.abs(dateMs2 - dateMs1)/1000/86400 + 1;
            var dateIntervalStr = dateInterval.toString();
            var dateIntervalLen = dateIntervalStr.length;
            var animateCountEdge = 5;
            for (var i=0; i<dateIntervalLen; i++) {
                //下标 计算
                digPrePush[animateCountEdge - dateIntervalLen + i] = dateIntervalStr.charAt(i);
            }
            var digPool = $('#'+J_calculate).data(dataDigPool) || {};
            //设定在执行前
            $('#'+ J_calculate).data(dataDigPrePush, digPrePush);
            $('#'+ J_calculate).data(dataDigFlow, 'out');
            //计算  字体着色变换
            $('#'+ J_calculateText).removeClass(C_calculateRunning).addClass(C_calculateRunningInfinite + ' ' + C_calculateRunning);
            if ($.isEmptyObject(digPool)) {
                //空 直接弹出结束
                event.data.popDfd.notify();
            } else {
                //所有参与动画的 返回初始状态
                $.each(digPool, function(k, v){
                    $('.'+ C_digitItems).eq(k).removeClass(C_digitPrefix+v).addClass(C_digitInit);
                });
            }
        }

    }
}

//事件 兼容
function whichTransitionEnd() {
    var style = document.body.style;
    var transitions = {
        transition: 'transitionend',
        MsTransition: 'msTransitionEnd',
        OTransition: 'oTransitionEnd',
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend'
    };
    for(var key in transitions) {
        if(style[key] !== undefined) {
          return transitions[key];
        }
    }
    return '';
}

//事件 兼容
function whichAnimationEnd() {
    var style = document.body.style;
    var animations = {
        animation: 'animationend',
        WebkitAnimation: 'webkitAnimationEnd'
    };
    for(var key in animations) {
        if(style[key] !== undefined) {
          return animations[key];
        }
    }
    return '';
}

//年 月  选择变化
function daysTransform(yearId, monthId, dayId) {
    $('#'+yearId+', #'+monthId).on('change', function() {
        var yearVal = parseInt($('#'+yearId).val());
        var monthVal = parseInt($('#'+monthId).val());
        var dayVal = parseInt($('#'+dayId).val()) || 1;
        var daysCount = 0;
        if (!isNaN(yearVal) && !isNaN(monthVal)) {
            daysCount = getDaysCount(yearVal, monthVal);
            if (daysCount < dayVal) {
                //选中的 超出了所选月最大值时
                dayVal = 1;
            }
            var dayData = [], optionObj;
            for(var i = 1; i<=daysCount; i++) {
                optionObj = {id: i, text: i};
                if (i == dayVal) {
                    optionObj['selected'] = true;
                }
                dayData.push(optionObj);
                optionObj = null;
            }
            $('#'+dayId).empty();
            $('#'+dayId).select2({
                data: dayData,
                width: dateDayWidth
            });
        }
    });
}

//获取天数
function getDaysCount(year, month){
    year = parseInt(year);
    month = parseInt(month);
    var count;
    switch (month){
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12: count=31;break;
        case 4:
        case 6:
        case 9: 
        case 11: count=30;break;
        case 2: 
        if ((year % 4 == 0 && year % 100 !=0) || year %400 ==0){
            count = 29;
        }else{
            count = 28;
        }
        break;
    }
    return count;
}