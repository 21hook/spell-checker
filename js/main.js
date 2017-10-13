(function() {//test中span标签已废，谨慎使用
	$.extend({
	buildText: function(text) {
		return '<p class="test-text">'+text.articles1['1']+'</p>';
	},
	buildTable: function(table) {	
		html = '<table class="test-table">';
		
		for(var i=0; i<5; i++) {
			html += '<tr>';
			for(var j=3*i; j<3*i + 3; j++) {
				html += '<td>' + table[j] + '</td>';
			}
			html += '</tr>';
		}
		html += '</table>';
		
		return html;
}
});
})(jQuery);
$.getJSON('data/data.json',function(data) {
	$(function() {
	//build text and table
	$('.test-content:first').prepend($.buildText(data));
	var arr=[];						
	for(var i=1;i<16;i++) {
		arr.push(data.tables[0][i]);
	}
	arr.sort(function randomSort() {
			return Math.random()>.5?-1:1;
		});
	$('.test-content:last').prepend($.buildTable(arr));
	//bind document events
	$(document).click(function() {
		$('.test-text span[class^="clicked"]').removeClass('blue-padding');
		$('.test-table td').off('mouseenter mouseleave click');
	});
	//bind article and table events  事件委托
	$('#test-wrapper').click(function(event) {
		if($(event.target).is('.test-text span[class^="clicked"]')) {
			var clickedBlank=$(event.target),
				blankId=event.target.id;
				//set blue padding
				$('.test-text span[class^="clicked"]').removeClass('blue-padding');
				$(event.target).addClass('blue-padding');
				//move triangle
				$('.test-tabs span').removeClass('selected');
				$('[href="#'+event.target.id+'"]+span').addClass('selected');
				
				//bind table hover events
				$(".test-table td").off('mouseenter mouseleave').hover(function(){
					$(this).css('color','#70D3F2');
					clickedBlank.empty().append($(this).text()).css('color','white');
				},function(){
					$(this).css('color','black');
					clickedBlank.empty().append(clickedBlank.text());
				});
				//bind table click events
				$('.test-table td').off('click').click(function(event) {
					$(this).css({'text-decoration':'line-through','color':'black'});
					clickedBlank.removeClass('blue-padding').css('color','#70D3F2');
					$('[href="#'+blankId+'"]').css('background-color','#70D3F2');
					$('.test-table td').off('mouseenter mouseleave');
					$('.test-table td').off('click');
				});
				event.stopPropagation();
		} else if($(event.target).is('.test-tabs a')) {
			var spanId=event.target.href.split('#')[1];
			$('#'+spanId).click();
			event.stopPropagation();
		}
	});
	//bind examine button events

	$('#test-handin').click(function() {
		if($('.test-text span[class^="clicked"]').text()) {
		var answer=JSON.stringify(data.answers),
			reg=/\w{3,20}/g,
			arr,
			spanText,
			numb="";
			rightNum=0,
			totalNum=$('.test-text span[class^="clicked"]').length;
		arr=answer.match(reg);
		$('#myModal').modal();
		$.each(arr,function(index,value) {
			var $span=$('.test-text span[class^="clicked"]:eq('+index+')'),
				$spanText=$span.text();
			if($spanText==value) {
				numb+='<span class="modal-result modal-right">'+(index+1)+'</span>';
				$span.addClass('test-right');
				$('[href="#test-tabs'+(index+1)+'"]').addClass('greenTabs');
				rightNum+=1;
			} else if(!$spanText) {
				numb+='<span class="modal-result modal-wrong">'+(index+1)+'</span>';
				$span.addClass('test-none').next('.test-correct').remove();
				$span.after('<span class="test-correct">'+value+'</span>');
				$('[href="#test-tabs'+(index+1)+'"]').addClass('redTabs');
			} else {
				numb+='<span class="modal-result modal-wrong">'+(index+1)+'</span>';
				$span.addClass('test-wrong').next('.test-correct').remove();
				$span.after('<span class="test-correct">'+value+'</span>');
				$('[href="#test-tabs'+(index+1)+'"]').addClass('redTabs');
			}
		});
			var html = '<h1 class="modal-percent">' + Math.round(rightNum*100/totalNum) + "%" +'</h1>';
			    html+= '<p class="modal-word">正确率</p>',
                html += '<p class="modal-numb">'+numb+'</p>';
			$('.modal-body').empty().prepend(html);
			$('.modal-result:lt(5)').addClass('modal-numbup');
			$('.modal-result:gt(4)').addClass('modal-numbdown');
		} else {
			alert('Please make some choices, or you get a 0 score.');
		}
	});
	
	//bind explain page events
	$('.modal-explain').click(function(event) {
		event.preventDefault();
		$('.test-right').removeClass('test-right').addClass('test-green');
		$('.test-wrong').removeClass('test-wrong').css({'text-decoration':'line-through','color':'#EE7A87'});
		$('.test-none').removeClass('test-none').append('-');
		$('.test-correct').css('display','inline');
		$(document).off('click');
		$('#test-wrapper').off('click');
		$('.test-text span[class^="clicked"]').first().click();
		$('span.test-highlight1').addClass('yellow-highlight');
		$('.test-tabs span').removeClass('selected');
		$('.test-tabs span:eq(0)').addClass('selected');
		$('.greenTabs').css('background-color','#81D9C9');
		$('.redTabs').css('background-color','#EE7A87');
		$('.test-table').before(data.analysis['1']).remove();
		$('#test-handin').off('click');
	//bind explain page tab events
	$('#test-wrapper').click(function(event) {
		if($(event.target).is('.test-tabs a')) {
			var tabsHref=event.target.href,		
				tabsNum=tabsHref.match(/[0-9]{1,3}$/g);
			$('.test-tabs span').removeClass('selected');
			$(event.target).next().addClass('selected');
			$('.test-content:last').empty().prepend(data.analysis[tabsNum]);
			$('span.keynotes').removeClass('yellow-highlight');
			$('span.test-highlight'+tabsNum).addClass('yellow-highlight');
		} else if ($(event.target).is('.test-text span[class^="clicked"]')) {
			var spanIdNum=event.target.id;
			$('[href="#'+spanIdNum+'"]').click();
			
		}
		event.stopPropagation();
	});
	});
	//bind drag event
	$('.test-dragbar ul').mousedown(function() {
		var testContentY=document.getElementById('test-resizable').offsetTop,//
			dragbarY=this.offsetTop;
		$('body').mousemove(function(event) {
		var	mouseY=event.pageY,
			minusY=mouseY-testContentY;
			$('#test-resizable').height(minusY);
		});
	});
	$('body').mouseup(function() {//
		$('body').off('mousemove');
	});
});
}).fail(function(jqXHR){
	alert('Sorry,but an error occured.\n'+jqXHR.status);
});

