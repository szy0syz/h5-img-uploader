// window.onload = function() {
//     //点击图片进入预览
//     var $Dom = document.querySelector(".preview");
//     $Dom.onclick = function() {
//         var temp = this.src;
//         var objE = document.createElement("div");
//         objE.innerHTML = '<div class="bgM" >' +
//                 '<img src="'+temp+'"  id="img_scan" class="img-custom-img2"/>' +
//             '</div>';
//         document.body.appendChild(objE.children[0]);
//         //退出图片预览事件
//         var $bg = document.querySelector(".bgM");
//         $bg.onclick = function() {
//             var dm = document.querySelector(".bgM");
//             document.body.removeChild(dm);
//         }

//         var $img = document.querySelector(".img-custom-img2");

//         $img.onclick = function(event) {
//            event.stopPropagation();
//         }

//         createEvent();//自定义事件
//         previewImg();//图片预览事件监听
//     }

// };

/*
 *  自定义移动端手势事件
 *  事件：
 *  - gesturestart      手势事件开始
 *  - gesturechange     手势缩放
 *  - gestureend        手势事件结束
 *  - swipeMove         单指滑动
 *  - doubleTouch       双击
 *  - oneTouch          单击
 */
var createEvent = function() {
  var $bm = document.querySelector('.bgM');
  //
  var isTouch = false;
  var isDoubleTouch = false; //是否为多触点
  var start = []; //存放触点坐标
  var now, delta; //当前时间，两次触发事件时间差
  var timer = null;
  var startPosition, movePosition, endPosition; //滑动起点，移动，结束点坐标
  //事件声明
  var gesturestart = new CustomEvent('gesturestart');
  var gesturechange = new CustomEvent('gesturechange');
  var gestureend = new CustomEvent('gestureend');
  var swipeMove = new CustomEvent('swipeMove');
  var doubleTouch = new CustomEvent('doubleTouch');
  var oneTouch = new CustomEvent('oneTouch');

  //监听touchstart事件
  $bm.addEventListener(
    'touchstart',
    function(e) {
      //e.preventDefault();
      if (e.touches.length >= 2) {
        //判断是否有两个点在屏幕上
        isDoubleTouch = true;
        start = e.touches; //得到第一组两个点
        var screenMinPoint = getMidpoint(start[0], start[1]); //获取两个触点中心坐标
        gesturestart.midPoint = [
          screenMinPoint[0] - e.target.offsetLeft,
          screenMinPoint[1] - e.target.offsetTop,
        ]; //获取中心点坐标相对目标元素坐标
        e.target.dispatchEvent(gesturestart);
      } else {
        delta = Date.now() - now; //计算两次点击时间差
        now = Date.now();
        startPosition = [e.touches[0].pageX, e.touches[0].pageY];
        if (delta > 0 && delta <= 250) {
          //双击事件
          clearTimeout(timer);
          doubleTouch.position = [
            e.touches[0].pageX - e.target.offsetLeft,
            e.touches[0].pageY - e.target.offsetTop,
          ];
          e.target.dispatchEvent(doubleTouch);
        } else {
          //滑动事件
          timer = setTimeout(function() {
            e.target.dispatchEvent(oneTouch); //单击事件
          }, 450);
        }
        isTouch = true;
      }
    },
    false
  );

  //监听touchmove事件
  $bm.addEventListener(
    'touchmove',
    function(e) {
      //e.preventDefault();
      clearTimeout(timer);
      if (e.touches.length >= 2 && isDoubleTouch) {
        //手势事件
        var now = e.touches; //得到第二组两个点
        var scale =
          getDistance(now[0], now[1]) / getDistance(start[0], start[1]); //得到缩放比例
        var rotation = getAngle(now[0], now[1]) - getAngle(start[0], start[1]); //得到旋转角度差
        gesturechange.scale = scale.toFixed(2);
        gesturechange.rotation = rotation.toFixed(2);
        e.target.dispatchEvent(gesturechange);
      } else if (isTouch) {
        movePosition = [e.touches[0].pageX, e.touches[0].pageY];
        endPosition = movePosition;
        movePosition = [
          movePosition[0] - startPosition[0],
          movePosition[1] - startPosition[1],
        ];
        startPosition = [e.touches[0].pageX, e.touches[0].pageY];
        swipeMove.distance = [
          movePosition[0].toFixed(2),
          movePosition[1].toFixed(2),
        ];
        e.target.dispatchEvent(swipeMove);
      }
    },
    false
  );

  //监听touchend事件
  $bm.addEventListener(
    'touchend',
    function(e) {
      if (isDoubleTouch) {
        isDoubleTouch = false;
        gestureend.position = endPosition;
        e.target.dispatchEvent(gestureend);
      }
    },
    false
  );
  /*
   * 两点的距离
   */
  function getDistance(p1, p2) {
    var x = p2.pageX - p1.pageX,
      y = p2.pageY - p1.pageY;
    return Math.sqrt(x * x + y * y);
  }
  /*
   * 两点的夹角
   */
  function getAngle(p1, p2) {
    var x = p1.pageX - p2.pageX,
      y = p1.pageY - p2.pageY;
    return (Math.atan2(y, x) * 180) / Math.PI;
  }
  /*
   * 获取中点
   */
  function getMidpoint(p1, p2) {
    var x = (p1.pageX + p2.pageX) / 2,
      y = (p1.pageY + p2.pageY) / 2;
    return [x, y];
  }
};

/*
 * 事件处理
 */
var previewImg = function() {
  var $imgs = document.querySelector('#img_scan');

  // var clientWidth = document.body.clientWidth; //窗口宽
  // var clientHeight = document.body.clientHeight; //窗口高
  var imgWidth = parseInt(window.getComputedStyle($imgs).width); //图片宽
  var imgHeight = parseInt(window.getComputedStyle($imgs).height); //图片高

  $imgs.addEventListener('gesturestart', gesturef, false);
  $imgs.addEventListener('gesturechange', gesturef, false);
  $imgs.addEventListener('gestureend', gesturef, false);
  $imgs.addEventListener('swipeMove', gesturef, false);
  $imgs.addEventListener('doubleTouch', gesturef, false);
  $imgs.addEventListener('oneTouch', gesturef, false);

  var tMatrix = [1, 0, 0, 1, 0, 0]; //x缩放，无，无，y缩放，x平移，y平移
  var originLast, maxSwipeLeft, maxSwipeRight, maxSwipeTop, maxSwipeBottom; //上下左右可拖动距离

  function maxMove() {
    //最大可拖动范围
    var sca = tMatrix[0];
    maxSwipeLeft = Math.abs(sca - 1) * originLast[0];
    maxSwipeRight = Math.abs(sca - 1) * (imgWidth - originLast[0]);
    maxSwipeTop = Math.abs(sca - 1) * originLast[1];
    maxSwipeBottom = Math.abs(sca - 1) * (imgHeight - originLast[1]);
  }

  function gesturef(event) {
    switch (event.type) {
      case 'gesturestart':
        var x = event.midPoint[0];
        var y = event.midPoint[1];
        originLast = event.midPoint;
        $imgs.style.transformOrigin = x + 'px ' + y + 'px';
        break;

      case 'gesturechange':
        var sc = parseFloat(event.scale);
        tMatrix[0] =
          tMatrix[0] + sc - 1 > 0.5 && tMatrix[0] + sc - 1 < 3
            ? tMatrix[0] + sc - 1
            : tMatrix[0];
        tMatrix[3] =
          tMatrix[3] + sc - 1 > 0.5 && tMatrix[3] + sc - 1 < 3
            ? tMatrix[3] + sc - 1
            : tMatrix[3];
        var temp = tMatrix.join(',');
        $imgs.style.transform = 'matrix(' + temp + ')';
        break;

      case 'gestureend':
        maxMove();
        break;

      case 'swipeMove':
        if (!maxSwipeLeft || !maxSwipeRight || !maxSwipeTop || !maxSwipeBottom)
          return;
        if (event.distance[0] > 0 && maxSwipeLeft < tMatrix[4]) return;
        if (event.distance[0] < 0 && maxSwipeRight < -tMatrix[4]) return;
        if (event.distance[1] > 0 && maxSwipeTop < tMatrix[5]) return;
        if (event.distance[1] < 0 && maxSwipeBottom < -tMatrix[5]) return;

        tMatrix[4] = tMatrix[4] + parseInt(event.distance[0]);
        tMatrix[5] = tMatrix[5] + parseInt(event.distance[1]);

        var temp = tMatrix.join(',');
        $imgs.style.transform = 'matrix(' + temp + ')';
        break;

      case 'doubleTouch':
        originLast = event.position;
        $imgs.style.transformOrigin =
          event.position[0] + 'px ' + event.position[1] + 'px';
        tMatrix[0] = 2; //缩放倍数为2
        tMatrix[3] = 2;
        var temp = tMatrix.join(',');
        $imgs.style.transform = 'matrix(' + temp + ')';
        maxMove();
        break;

      case 'oneTouch':
        var $bg = document.querySelector('.bgM');
        document.body.removeChild($bg);
        break;
    }
  }
};











// ----------------------------------------------------------------------






let tmp_attachments = [];

const myImgs = document.querySelector('#myImgs');
if (myImgs.children.length === 0) myImgs.appendChild(createUploaderBtn());

function handleSelectImgs(event) {
  if (tmp_attachments.length >= 9) {
    alert('附件图限制9张');
    return;
  }

  const _files = event.target.files;
  const boxEle = document.querySelector('#myImgs');
  if (event.target.files.length > 0) {
    const url = 'http://192.168.1.253/community/attachment/upload';
    const img_domain = 'http://192.168.1.253:8888/';
    const fd = new FormData();

    for (var i = 0; i < _files.length; i++) {
      fd.append('files', _files[i]);
    }

    fetch(url, {
      method: 'POST',
      body: fd,
    })
      .then(r => r.text())
      .then(res => {
        const data = JSON.parse(res);

        data.forEach(val => {
          if (tmp_attachments.length >= 9) return;
          const fileUrl = val.fileUrl;

          boxEle.insertBefore(createImgItem(img_domain, fileUrl, boxEle), boxEle.lastElementChild);

          if (tmp_attachments.length === 8) {
            const btn = document.getElementById('uploader-btn');
            boxEle.removeChild(btn);
          }

          tmp_attachments.push(fileUrl);
        });
      });
  }
}

// domain:图片显示域名,  fileUrl：图片服务器相对路径,  container 最外层容器
function createImgItem(domain, fileUrl, container) {
  const eImg = document.createElement('IMG');
  eImg.src = domain + fileUrl;
  eImg.dataset['fileUrl'] = fileUrl;
  eImg.style.width = '90%';
  eImg.style.height = '90%';
  eImg.onclick = handleImgClick;

  var img_container = document.createElement('DIV');
  img_container.className = 'img_container';

  var img_tool = document.createElement('DIV');
  img_tool.className = 'img_remove';
  img_tool.onclick = handleImgRemove.bind(this, container, tmp_attachments);

  img_container.appendChild(eImg);
  img_container.appendChild(img_tool);

  return img_container;
}

// container:最外层容器, 记录图片路径的list, target触发的元素div.img_remove
function handleImgRemove(container, img_list, target) {
  // 删除上传图片
  const currentImg = target.target.parentNode;
  const currentFileUrl = currentImg.dataset.fileUrl;
  const targetIndex = img_list.indexOf(currentFileUrl);
  img_list.splice(targetIndex, 1);
  if (img_list.length === 8) {
    container.appendChild(createUploaderBtn());
  }
  target.target.parentNode.parentNode.removeChild(target.target.parentNode);
}

function handleImgClick() {
  var temp = this.src;
  var objE = document.createElement('div');
  objE.innerHTML =
    '<div class="bgM" >' +
    '<img src="' +
    temp +
    '"  id="img_scan" class="img-custom-img2"/>' +
    '</div>';
  document.body.appendChild(objE.children[0]);
  //退出图片预览事件
  var $bg = document.querySelector('.bgM');
  $bg.onclick = function() {
    var dm = document.querySelector('.bgM');
    document.body.removeChild(dm);
  };

  var $img = document.querySelector('.img-custom-img2');

  $img.onclick = function(event) {
    event.stopPropagation();
  };

  createEvent(); //自定义事件
  previewImg(); //图片预览事件监听
}

function createUploaderBtn() {
  const a = document.createElement('A');
  a.href = 'javascript:;';
  a.className = 'uploader-btn';
  a.id = 'uploader-btn';
  const inpt = document.createElement('INPUT');
  inpt.type = 'file';
  inpt.accept = 'image/*';
  inpt.multiple = true;
  inpt.onchange = handleSelectImgs;
  a.appendChild(inpt);
  return a;
}
