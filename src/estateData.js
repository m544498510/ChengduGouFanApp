const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

let registeringData = [];
let completeData = [];
const basePath = 'http://171.221.172.13:8888/lottery/accept';

function ajaxProjects(pageNum = 1) {
  if (pageNum === 1) {
    registeringData = [];
    completeData = [];
  }
  const data = qs.stringify({
    pageNo: pageNum,
    regioncode: '00'
  });
  return axios.post(basePath + '/projectList', data)
    .then(data => {
      const $ = cheerio.load(data.data);
      const trs = $('#_projectInfo').find('tr');
      for (let i = 0; i < trs.length; i++) {
        let item = trs.eq(i);
        const tds = $(item).find('td');
        const projectObj = getProjectObj(tds);
        const status = projectObj.status;
        if (status !== '报名结束') {
          registeringData.push(projectObj);
        } else {
          completeData.push(projectObj);
        }
      }
      if (trs.length > 0 && pageNum < 10) {
        return ajaxProjects(pageNum + 1);
      }
      return {
        registeringData,
        completeData
      };
    });
}

function getProjectObj(tds) {
  return {
    id: tds.eq(0).text(),
    name: tds.eq(3).text(),
    area: tds.eq(2).text(),
    status: tds.eq(10).text().trim(),
    count: tds.eq(6).text(),
    startTime: tds.eq(8).text(),
    endTime: tds.eq(9).text()
    
  };
}

function ajaxDetail(id) {
  return axios.post(basePath + '/getProjectRule', qs.stringify({
      projectUuid: id
    }))
    .then(data => {
      return data.data.message;
    });
}

module.exports = {
  ajaxDetail,
  ajaxProjects,
};