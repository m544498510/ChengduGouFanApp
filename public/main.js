let _localTool;
let _map;
let _projects;
let _projectType = 'enroll'; // 'enroll', 'complete'
let _noSearchResult = [];
let _searchCompleteCount = 0;
initMap();
getProject();

$('#checkbox').on('change', e => {
  if($('#checkbox').is(':checked')){
    _projectType = 'complete';
  }else{
    _projectType = 'enroll';
  }
  getProject();
});

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
      _searchCompleteCount++;
      let result;
      for (let key in data){
        const tmp = data[key];
        if(tmp && tmp.length > 0 && tmp[0] && tmp[0].point){
          result = tmp[0];
          break;
        }
      }
      if (result) {
        const infoDom = getInfoDom(data.keyword);
        const marker = new BMap.Marker(result.point);
        _map.addOverlay(marker);
        marker.addEventListener("click", function(e) {
          openInfo(infoDom, this);
        });
      } else {
        _noSearchResult.push(data.keyword);
        console.log('搜索不到“ ' + data.keyword + ' ”');
      }
      if (_searchCompleteCount === _projects.length) {
        renderNoSearchView();
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
        <div class="title">区域：</div>
        <div class="value">${project.area}</div>
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
  let url = '/projects';
  if (_projectType === 'complete') {
    url = '/completeProjects';
  }
  $.ajax({
    url,
    success: (data) => {
      _projects = data;
      _noSearchResult = [];
      _searchCompleteCount = 0;
      _map.clearOverlays();
      $('#resultBox').html('');
      data.forEach(item => {
        _localTool.search(item.name, {
          forceLocal: true
        });
      });
    }
  });
}

function renderNoSearchView() {
  const box$ = $('#resultBox');
  console.log(_noSearchResult);
  _noSearchResult.forEach(name => {
    const project = _projects.filter(item => {
      return name === item.name;
    })[0];
    box$.append(`
      <div class="result-card">
        <div class="detail-row">
          <div class="title">项目名称：</div>
          <div class="value">${project.name}</div>
        </div>
        <div class="detail-row">
          <div class="title">住房套数：</div>
          <div class="value">${project.count}</div>
        </div>
        <div class="detail-row">
          <div class="title">区域：</div>
          <div class="value">${project.area}</div>
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
    `);
  });
}