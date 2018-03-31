const fs = require("fs");
const path = require("path");
const estateData = require("./estateData");
const {sendEmail} = require("./emailTool");
const {webServerPath} = require("./config");

module.exports = {
  getCacheFromFile,
  updateProjects,
  getProjects
};

const projectCachePath = path.resolve(__dirname, '../cacheData/projects.json');
const emailCachePath = path.resolve(__dirname, '../cacheData/email.json');

let projectCache = {
  registeringData: [],
  completeData: []
};
let emailCache;

function getCacheFromFile() {
  fs.readFile(projectCachePath, 'utf8', (err, data) => {
    try {
      projectCache = JSON.parse(data);
    } catch (e) {}
  });
  
  fs.readFile(emailCachePath, 'utf8', (err, data) => {
    emailCache = JSON.parse(data);
  });
}

function getProjects() {
  return projectCache;
}

function updateProjects() {
  return estateData
    .ajaxProjects()
    .then((data) => {
      const str = JSON.stringify(data);
      fs.writeFile(projectCachePath, str, 'utf8', () => {
        console.log("update projects complete!");
      });
      
      //check has new project
      const map = listToMapStr(projectCache.registeringData);
      const newProjects = [];
      data.registeringData.forEach(item => {
        if (!map[item.id]) {
          newProjects.push(item);
        }
      });
      
      //send email
      emailCache.forEach(emailItem => {
        const projects = [];
        newProjects.forEach(project => {
          if (emailItem.target.includes(project.area)) {
            projects.push(project);
          }
        });
        if (projects.length > 0) {
          const body = generateEmailBody(projects);
          sendEmail(emailItem.email, '购房摇号新开盘', body);
        }
      });
      
      //update project in the memory
      projectCache = data;
    });
}

function generateEmailBody(list) {
  let trs = '';
  list.forEach(item => {
    trs += `
      <tr>
        <td>${item.area}</td>
        <td>${item.name}</td>
        <td>${item.count}</td>
        <td>${item.startTime}</td>
        <td>${item.endTime}</td>
        <td><a href="http://${webServerPath}/detail?id=${item.id}">登记规则</a></td>
      </tr>  
    `;
  });
  return `
    <div>
        <table>
            <thead>
                <tr>
                    <th>区域</th>
                    <th>项目名称</th>
                    <th>住房套数</th>
                    <th>登记开始时间</th>
                    <th>登记结束时间</th>
                    <th>其他</th>
                </tr>
            </thead>
            <tbody>
                ${trs}
            </tbody>
        </table>
        <a href="http://${webServerPath}/index.html">在百度地图显示位置</a>  
    </div>  
  `;
}

function listToMapStr(list = []) {
  const map = {};
  list.forEach(item => {
    map[item.id] = item;
  });
  return map;
}