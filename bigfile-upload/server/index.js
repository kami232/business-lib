const http = require('http');
const path = require('path');
const fse = require('fs-extra');
const multiparty = require('multiparty');

const server = http.createServer();

const UPLOAD_DIR = path.resolve(__dirname, 'target'); // 大文件存储目录
const CACHE_DIR = path.resolve(__dirname, 'cache'); // 缓存文件目录

// 读取请求参数
const resolvePost = req =>
  new Promise(resolve => {
    let chunk = '';
    req.on('data', data => {
      chunk += data;
    });
    req.on('end', () => {
      resolve(JSON.parse(chunk));
    });
  });

/**
 * 复制数据
 * @param path chunkpath
 * @param writeStream 可写流
 * @returns {Promise<unknown>}
 */
const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    // 返回一个可读流对象
    const readStream = fse.createReadStream(path);
    // 监听没有数据可读时
    readStream.on('end', () => {
      // 删除文件
      fse.unlinkSync(path);
      resolve();
    });
    // 复制数据
    readStream.pipe(writeStream);
  });

/**
 * 合并文件
 * @param filePath 缓存文件目录绝对路径
 * @param filename 文件名
 * @param size 大小
 * @returns {Promise<void>}
 */
const mergeFileChunk = async (filePath, filename, size) => {
  // 返回需要合并后的文件绝对路径
  const chunkDir = path.resolve(UPLOAD_DIR, filename);
  // 读取目录内容数组
  const chunkPaths = await fse.readdir(filePath);
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序可能会错乱
  chunkPaths.sort((a, b) => a.split('-')[1] - b.split('-')[1]);

  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(filePath, chunkPath),
        // 指定位置创建可写流
        fse.createWriteStream(chunkDir, {
          start: index * size,
          end: (index + 1) * size
        })
      )
    )
  );
  // 所有chunk合并后删除保存切片的目录
  fse.rmdirSync(filePath);
}

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status = 200;
    res.end();
    return;
  }

  if (req.url === '/upload') {
    // 初始化表单
    const multipart = new multiparty.Form();
    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        return;
      }
      const [chunk] = files.chunk; // 片段数据
      const [hash] = fields.hash; // hash文件名
      const [filehash] = fields.filehash; //源文件hash
      // const [filename] = fields.filename; // 原来的文件名
      // 返回缓存该文件的绝对路径
      const chunkDir = path.resolve(CACHE_DIR, filehash);

      // 切片目录不存在，创建切片目录
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir);
      }

      // fs-extra 专用方法，类似 fs.rename 并且跨平台
      // fs-extra 的 rename 方法 windows 平台会有权限问题
      // 移动路径
      await fse.move(chunk.path, `${chunkDir}/${hash}`);
      res.end('received file chunk');
    });
  } else if (req.url === '/merge') {
    const data = await resolvePost(req);
    const {filename, size, filehash} = data;
    // 需要合并的文件目录, 即缓存目录
    const filePath = path.resolve(CACHE_DIR, `${filehash}`);
    await mergeFileChunk(filePath, filename, size);
    res.end(JSON.stringify({code: 200, message: "成功"}));
  }
});

server.listen(3001, () => console.log("正在监听 3001 端口"));