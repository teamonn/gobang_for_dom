/* 
	游戏说明：
	1. 五子棋人人对战模式。
	2. 可无限悔棋，一直回到最开始。也可以无限撤销悔棋，回到最终状态。
	3. 鼠标悬停显示当前玩家的棋子
	4. 模拟棋子拿起、放下的声音，以及胜利之后的提示音
*/ 

var step = 0;							// 偶数步该黑棋走，奇数步该白棋走
var chessboardArr = new Array();				// 没有棋子值为0，有黑子为1，有白子为2
var piecesArr = new Array();				// 记录所有步骤（取的时候当成栈来使用）
var piecesRevokeArr = new Array();				// 记录撤销的所有步骤（取的时候当成栈来使用）
var isEnd;								// 该局游戏是否结束
var isFalling = true;					// 棋子是否处于悬停在空中状态，true表示悬停，false表示已落子
var winer;
var chessboardWidth = 560;

$(function(){
	$('#nextPiece').mousedown(function(){
		isFalling = false;
		if(!isFalling){
			$('#nextPiece').css('display', 'none');
		}
	})
})

function start(){
	// 启动游戏背景音乐
	getId('start_audio').play();
	step = 0;
	isEnd = false;
	piecesArr = [];
	piecesRevokeArr = [];
	// 关闭遮罩层
	$('#play_mask').fadeOut();
	$(".notication").text('黑方先开始落子');
	// 鼠标位置产生一个随鼠标移动的棋子
	$(document).mousemove(function(e){
		var left = e.clientX - getId('board_box').offsetLeft;
		var top = e.clientY - getId('board_box').offsetTop;
		var x = Math.round(left / 35) - 1;
		var y = Math.round((top - 45) / 35) - 1;
		if(step % 2 > 0){
			var className = 'white_piece';
		} else{
			var className = 'black_piece';
		}
		if(!isOverChessboard(x, y) && !isEnd){
			$('#nextPiece').css('left', left - 18);
		    $('#nextPiece').css('top', top - 17);
		    $('#nextPiece').attr('class', className);
		    $('#nextPiece').css('display', 'block');
		} else{
			$('#nextPiece').css('display', 'none');
		}
	    
	});
	// 初始化棋盘格对应的数组
	$("#chessboard").html('');
	for(var i = 0; i < 15; i++){
		chessboardArr[i] = new Array();
		for(var j = 0; j < 15; j++){
			chessboardArr[i][j] = 0;
		}
	}
}

function getId(id){
	return document.getElementById(id);
}

function play(event){
	// 开始落子
	var referenceX = getId('board_box').offsetLeft;
	var referenceY = getId('board_box').offsetTop;
	var offsetX = event.clientX - referenceX;
	var offsetY = event.clientY - referenceY - 45;
	var x = Math.round(offsetX / 35) - 1;
	var y = Math.round(offsetY / 35) - 1;
	console.log("落子为：（" + x + "，" + y + ")");
	// 棋盘边界检查
	if(!isOverChessboard(x, y)){
		if(chessboardArr[x][y] === 0){
			getId('tap_audio').play();		// 模拟落子的声音
			piecesArr.push({
				x: x,
				y: y
			});
			updateChessboard(x, y);			// 添加棋子到棋盘上，并更新提示信息
		} else{
			console.log('此位置已放置了棋子');
		}
	}
}

function updateChessboard(x, y){
	var notication = step % 2 > 0 ? '请黑方落子' : '请白方落子';
	chessboardArr[x][y] = step % 2 > 0 ? 2 : 1;
	addToChessboard(x, y);
	// 显示撤销按钮
	if(step > 0){
		$('.revoke_btn').css('display', 'block');
		$('.cancelRevoke_btn').css('display', 'block');
	}

	// 判断是否有一方已经胜利
	if(checkResult(x, y)){
		// 中断背景音乐，提示胜利的声音
		getId('start_audio').pause();
		getId('start_audio').currentTime= 0;
		getId('gameover_audio').play();
		isEnd = true;
		winer = step % 2 > 0 ? '黑方' : '白方';
		console.log(winer + "获胜了");
		var notication = winer + "获胜了";
		setTimeout(function(){
			$('.play_btn').text('重新开始');
			$('#play_mask').fadeIn();
		}, 300)
	}
	$(".notication").text(notication);
}

function checkResult(x, y){
	var checkValue = step % 2 > 0 ? 1 : 2;
	var isSame;
	// 判断水平方向
	for(var i = 4; i >= 0; i--){
		isSame = true;
		for(var j = 0; j < 5; j++){
			var thisX = x - i + j;
			if(isOverChessboard(thisX, y)){
				isSame = false;
				break;
			}
			if(chessboardArr[thisX][y] !== checkValue){
				isSame = false;
				break;				// 一旦发现此处不符合条件，强制退出当前循环
			}
		}
		if(isSame){
			return true;
		}
	}
	// 判断垂直方向
	for(var i = 4; i >= 0; i--){
		isSame = true;
		for(var j = 0; j < 5; j++){
			var thisY = y - i + j;
			if(thisY < 0 || thisY > 14){
				isSame = false;
				break;
			}
			if(chessboardArr[x][thisY] !== checkValue){
				isSame = false;
				break;				// 一旦发现此处不符合条件，强制退出当前循环
			}
		}
		if(isSame){
			return true;
		}
	}
	// 判断斜上方向
	for(var i = 4; i >= 0; i--){
		isSame = true;
		for(var j = 0; j < 5; j++){
			var thisX = x - i + j;
			var thisY = y + i - j;
			if(thisX < 0 || thisY < 0){
				isSame = false;
				break;
			}
			if(chessboardArr[thisX][thisY] !== checkValue){
				isSame = false;
				break;				// 一旦发现此处不符合条件，强制退出当前循环
			}
		}
		if(isSame){
			return true;
		}
	}
	// 判断斜下方向
	for(var i = 4; i >= 0; i--){
		isSame = true;
		for(var j = 0; j < 5; j++){
			var thisX = x - i + j;
			var thisY = y - i + j;
			if(thisX < 0 || thisY < 0){
				isSame = false;
				break;
			}
			if(chessboardArr[thisX][thisY] !== checkValue){
				isSame = false;
				break;				// 一旦发现此处不符合条件，强制退出当前循环
			}
		}
		if(isSame){
			return true;
		}
	}
	return false;
}

function isOverChessboard(x, y){
	if(x < 0 || y < 0 || x > 14 || y > 14){
		return true;
	}
	return false;
}

function countDistance(number){
	return 35 * number + 17.5;
}

function addToChessboard(x, y){
	var pieceClass = step % 2 > 0 ? 'white_piece' : 'black_piece';
	var left = countDistance(x);
	var top = countDistance(y);
	var piece = '<i id=' + x + '_' + y + ' class="' + pieceClass + '" style="left:' + left + 'px;top:' + top + 'px"></i>'; 
	$("#chessboard").append(piece);
	step ++;
}

function deleteFromChessboard(x, y){
	$('#' + x + '_'+ y).remove();
	chessboardArr[x][y] = 0;
	step --;
}

function revoke(){
	var lastPiece = piecesArr.pop();
	if(lastPiece){
		// 模拟悔棋声音
		getId('revoke_audio').play();
		piecesRevokeArr.push(lastPiece);
		chessboardArr[lastPiece.x][lastPiece.y] = 0;
		var notication = step % 2 > 0 ? '请黑方落子' : '请白方落子';
		$(".notication").text(notication);
		deleteFromChessboard(lastPiece.x, lastPiece.y);
	} else{
		alert("当前没有可悔棋的！");
	}
}


function cancelRevoke(){		// 撤销悔棋
	var lastPiece = piecesRevokeArr.pop();
	if(lastPiece){
		// 模拟悔棋声音
		getId('revoke_audio').play();
		piecesArr.push(lastPiece);
		chessboardArr[lastPiece.x][lastPiece.y] = step % 2 > 0 ? 1 : 2;
		var notication = step % 2 > 0 ? '请黑方落子' : '请白方落子';
		$(".notication").text(notication);
		addToChessboard(lastPiece.x, lastPiece.y);
	} else{
		alert("当前没有可撤销悔棋的！");
	}
}




