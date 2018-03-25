const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

let estateData = [];
const basePath = 'http://171.221.172.13:8888/lottery/accept';

function ajaxProjects(pageNum = 1) {
  if (pageNum === 1) {
    estateData = [];
  }
  const data = qs.stringify({
    pageNo: pageNum,
    regioncode: '00'
  });
  return axios.post(basePath + '/projectList',
    data)
    .then(data => {
      let ajaxNextPage = true;
      const $ = cheerio.load(data.data);
      const trs = $('#_projectInfo').find('tr');
      for (let i = 0; i < trs.length; i++) {
        let item = trs.eq(i);
        const tds = $(item).find('td');
        const projectName = tds.eq(3).text();
        const status = tds.eq(10).text().trim();
        if (status !== '报名结束') {
          estateData.push({
            id: tds.eq(0).text(),
            name: projectName,
            status,
            count: tds.eq(6).text(),
            startTime: tds.eq(8).text(),
            endTime: tds.eq(9).text()
          });
        } else {
          ajaxNextPage = false;
          break;
        }
      }
      if (ajaxNextPage) {
        ajaxProjects(pageNum + 1);
      }
    });
}

function ajaxDetail(id) {
  return axios.post(basePath + '/getProjectRule', qs.stringify({
      projectUuid: id
    }))
    .then(data => {
      return data.data.message;
    });
}

function getData() {
  return estateData;
}

module.exports = {
  ajaxDetail,
  ajaxProjects,
  getData
};