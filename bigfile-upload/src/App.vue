<template>
  <div id="app">
    <div>
      <input type="file" @change="handleFileChange"/>
      <el-button @click="handleUpload">上传</el-button>
    </div>
    <div class="process-box">
      <div @click="showChunk = !showChunk">
        <el-progress :text-inside="true"
                     :stroke-width="22"
                     :percentage="uploadPercentage"></el-progress>
      </div>

      <el-table
          :data="data"
          stripe
          style="width: 100%"
          v-show="showChunk">
        <el-table-column
            prop="hash"
            label="切片hash"
            width="300"
            align="center">
        </el-table-column>
        <el-table-column
            prop="chunk.size"
            label="大小(KB)"
            width="300"
            align="center">
        </el-table-column>
        <el-table-column
            label="进度"
            align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.percentage"></el-progress>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  // 每个切片的大小 10MB
  const SIZE = 10 * 1024 * 1024;

  export default {
    name: 'app',
    data() {
      return {
        container: {
          file: null
        },
        data: [],
        showChunk: false, // 是否显示切片详情
      }
    },
    methods: {
      // 请求方法
      request({
                url,
                method = "post",
                data,
                headers = {},
                onProgress = e => e
              }) {
        return new Promise(resolve => {
          const xhr = new XMLHttpRequest();
          xhr.open(method, url);
          // 上传进度监听
          xhr.upload.onprogress = onProgress;
          Object.keys(headers).forEach(key =>
            xhr.setRequestHeader(key, headers[key])
          );
          xhr.send(data);
          xhr.onload = e => {
            resolve({
              data: e.target.response
            });
          };
        });
      },
      // 修改上传文件的方法
      handleFileChange(e) {
        const [file] = e.target.files;
        if (!file) return;
        Object.assign(this.$data, this.$options.data);
        // 保存选择文件的信息
        this.container.file = file;
      },
      // 点击上传
      async handleUpload() {
        if (!this.container.file) return;
        // 生成切片数组
        const fileChunkList = this.createFileChunk(this.container.file);
        // 开子线程去求文件hash
        this.container.hash = await this.calculateHash(fileChunkList);
        // 修改记录切片的数据，并保持到data
        this.data = fileChunkList.map(({file}, index) => ({
          fileHash: this.container.hash,
          chunk: file,
          index,
          hash: this.container.hash + '-' + index, // 文件名 + 数组下标
          percentage: 0 // 记录当前chunk上传进度
        }));
        await this.uploadChunks();
      },
      // 生成文件切片
      createFileChunk(file, size = SIZE) {
        const fileChunkList = [];
        let cur = 0;
        while (cur < file.size) {
          // Blob.slice 返回一个新的 Blob 对象，它包含了原始 Blob 对象的某一个段的数据。
          fileChunkList.push({file: file.slice(cur, cur + size)});
          cur += size;
        }
        return fileChunkList;
      },
      // 上传切片
      async uploadChunks() {
        const requestList = this.data
          .map(({chunk, hash, fileHash, index}) => {
            // 新建一个表单对象
            const formData = new FormData();
            // 键值对存值
            formData.append('chunk', chunk); // 片段数据
            formData.append('hash', hash); // hash文件名
            formData.append('filehash', fileHash); // 源文件hash文件名
            // formData.append('filename', this.container.file.name); // 原理文件名
            return {formData, index};
          })
          .map(async ({formData, index}) => this.request({
              // 上传
              url: 'http://localhost:3001/upload',
              data: formData,
              onProgress: this.createProgressHandler(this.data[index]),
            })
          );
        // 并发请求
        await Promise.all(requestList);
        // 合并切片
        await this.mergeRequset();
      },
      /**
       * 处理上传监听函数
       * @param item 对应的chunk
       * @returns {function(...[*]=)}
       */
      createProgressHandler(item) {
        return e => {
          // e.loaded 返回已上传大小 e.total 返回文件大小
          // 保存当前chunk上传进度
          item.percentage = parseInt(String(e.loaded / e.total) * 100);
        }
      },
      // 合并请求
      async mergeRequset() {
        await this.request({
          url: 'http://localhost:3001/merge',
          headers: {
            'content-type': 'application/json'
          },
          data: JSON.stringify({
            size: SIZE,
            filename: this.container.file.name,
            filehash: this.container.hash
          })
        })
      },
      /**
       * 生成文件hash（web-worker）
       * @param fileChunkList chunk数据数组
       */
      calculateHash(fileChunkList) {
        return new Promise(resolve => {
          // 创建子线程
          // console.log();
          this.container.worker = new Worker('/hash.js');
          // 向子线程发信息
          this.container.worker.postMessage({fileChunkList});
          // 监听子线程信息
          this.container.worker.onmessage = e => {
            const {percentage, hash} = e.data;
            // 当前hash进度
            this.hashPercentage = percentage;
            // 只有完成才返回hash
            if (hash) {
              resolve(hash);
            }
          }
        });
      }
    },
    computed: {
      // 统计总上传进度
      uploadPercentage() {
        if (!this.container.file || !this.data.length) return 0;
        const loaded = this.data
          .map(item => item.chunk.size * item.percentage) // 返回每个切片当前上传进度百分比
          .reduce((acc, cur) => acc + cur); // 计算现上传总size
        return parseInt((loaded / this.container.file.size).toFixed(2)); // 总百分比
      }
    }
  }
</script>

<style lang="css">
  .process-box {
    margin-top: 10px;
  }
</style>
