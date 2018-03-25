let _localTool;
let _map;
let _projects;
initMap();
getProject();

function initMap() {
  // 百度地图API功能
  _map = new BMap.Map("allmap");    // 创建Map实例
  _map.centerAndZoom(new BMap.Point(104.072, 30.663), 12);  // 初始化地图,设置中心点坐标和地图级别
  _map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
  //添加地图类型控件
  _map.addControl(new BMap.MapTypeControl({
    mapTypes: [
      BMAP_NORMAL_MAP,
      BMAP_HYBRID_MAP
    ]
  }));
  _map.setCurrentCity("成都");
  _localTool = new BMap.LocalSearch(_map, {
    onSearchComplete: (data) => {
      const result = data.tr[0];
      if (result) {
        const infoDom = getInfoDom(data.keyword);
        const marker = new BMap.Marker(result.point);
        _map.addOverlay(marker);
        marker.addEventListener("click", function(e) {
          openInfo(infoDom, this);
        });
      } else {
        alert('搜索不到“ ' + data.keyword + ' ”');
      }
    }
  });
}

function openInfo(content, marker) {
  const infoWindow = new BMap.InfoWindow(content);  // 创建信息窗口对象 
  marker.openInfoWindow(infoWindow); //开启信息窗口
}

function getInfoDom(projectName) {
  const project = _projects.filter(item => {
    return projectName === item.name;
  })[0];
  
  return `
    <div>
      <div class="detail-row">
        <div class="title">项目名称：</div>
        <div class="value">${project.name}</div>
      </div>
      <div class="detail-row">
        <div class="title">住房套数：</div>
        <div class="value">${project.count}</div>
      </div>
      <div class="detail-row">
        <div class="title">登记开始时间：</div>
        <div class="value">${project.startTime}</div>
      </div>
      <div class="detail-row">
        <div class="title">登记结束时间：</div>
        <div class="value">${project.endTime}</div>
      </div>
      <div class="detail-row">
        <div class="title">登记规则：</div>
        <div class="value">
          <a target="_blank" href="/detail?id=${project.id}">查看</a>
        </div>
      </div>        
    </div>
  `;
}

function getProject() {
  $.ajax({
    url: '/projects',
    success: (data) => {
      _projects = data;
      data.forEach(item => {
        _localTool.search(item.name, {
          forceLocal: true
        });
      });
    }
  });
}