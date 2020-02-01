self.importScripts('/spark-md5.min.js');

/*
因为只要文件修改了名字，则上传的缓存则失效，所以这种命名是错误的，我们要根据内容生成hash，只要hash不变则命名的缓存则就不会变。
因为有可能是大文件上传，所有采用web-worker 在 worker 线程计算 hash，则不会阻塞UI交互
 */

// 注意：spark-md5 需要根据所有切片才能算出一个 hash 值，不能直接将整个文件放入计算，否则即使不同文件也会有相同的 hash。
// 监听主线程发来的信息
self.onmessage = e => {
  // 信息都是保存在data属性上
  const {fileChunkList} = e.data;
  console.log(fileChunkList);
  const spark = new self.SparkMD5.ArrayBuffer();
  let percentage = 0;
  let count = 0;
  const loadNext = index => {
    // 文件读取对象
    const reader = new FileReader();
    // 开始读取指定的 Blob中的内容, 一旦完成, result 属性中保存的将是被读取文件的 ArrayBuffer 数据对象.
    reader.readAsArrayBuffer(fileChunkList[index].file);
    // 读取完成时触发
    reader.onload = e => {
      count++;
      // e.target.result返回读取文件的ArrayBuffer
      // 追加数组缓冲区
      spark.append(e.target.result);
      if (count === fileChunkList.length) {
        // 如果是读取的是最后一个
        // 发消息给主线程
        self.postMessage({
          percentage: 100,
          // 完成md5的计算，返回十六进制结果。如果raw为true，则将以二进制字符串的形式返回结果。
          hash: spark.end()
        });
        // 关闭子线程
        self.close();
      } else {
        // 现在的进度
        percentage += 100 / fileChunkList.length;
        // 发消息给主线程当前进度
        self.postMessage({
          percentage
        });
        // 进行读取下一个
        loadNext(count);
      }
    }
  }
  // 读取第一个
  loadNext(0);
}