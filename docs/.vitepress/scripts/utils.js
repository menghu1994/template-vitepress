const path = require('path');
const fs = require('fs');

//递归获取指定目录下的所有指定后缀名文件列表
export const walk = function (dir, subDir = '') {
	let results = [];
	const list = fs.readdirSync(dir + subDir);
	list.forEach((file) => {
		file = dir + subDir + '/' + file;
		if (path.extname(file) === '.md') {
			results.push(file);
		}
	})
	const items = results.map((item) => {
		return {
			text: path.basename(item, '.md'),
			link: item.slice(10, -3)
		}
	})
	return {
		text: subDir ?? '默认值',
		collapsible: true,
		collapsed: false,
		items: items
	}
};

export const autoGenerateSidebarAdvanced = function (baseDir, options = {}) {
  const {
    ignoreDirs = [], // 要忽略的文件夹
    sort = true,     // 是否排序
		hidden = false
  } = options;

  const sidebar = [];

  // 读取 baseDir 下的所有文件和文件夹
  const items = fs.readdirSync(baseDir);

  // 过滤和排序
  let filteredItems = items.filter(item => {
    const fullPath = path.join(baseDir, item);
    const stat = fs.statSync(fullPath);
    return stat.isDirectory() && !ignoreDirs.includes(item);
  });

  if (sort) {
    filteredItems.sort();
  }

  // 生成 sidebar 配置
  filteredItems.forEach(item => {
    sidebar.push(walk(baseDir, item));
  });

  return sidebar;
};

export const generatorSides = (sides) => {
	const sideObj = {};
	sides.forEach(item => sideObj[item.path] = autoGenerateSidebarAdvanced(`./docs/src${item.path}`, item.config))
	return sideObj
}

// 将嵌套的导航数组扁平化
// {path: '/backend/nestjs/', config: {}},
// {path: '/backend/nginx/', config: {}},
// {path: '/backend/gitLearn/', config: {}},
export const flatNav = (a) => {
	return a.reduce((flattened, {link, items, config = {}}) => {
		return flattened
			.concat((link && link.startsWith('/')) ? [{path: link, config}] : [])
			.concat(items ? flatNav(items) : []);
	}, []);
}
