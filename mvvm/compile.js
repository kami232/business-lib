// 解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图
class Compile {
  /**
   *
   * @param el 节点
   * @param vm vue对象
   */
  constructor(el, vm) {
    this.$vm = vm;
    // 判断是否是元素节点
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);

    // 是否有该节点
    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el);
      this.init();
      // 为元素添加一个新的子元素
      this.$el.appendChild(this.$fragment);
    }
  }

  /**
   *
   * @param el 元素节点
   * @returns {DocumentFragment}
   */
  node2Fragment(el) {
    // 创建了一虚拟的节点对象
    let fragment = document.createDocumentFragment(),
      child;

    // 将原生节点拷贝到fragment
    while (child = el.firstChild) {
      // firstChild 属性返回被选节点的第一个子节点。
      fragment.appendChild(child);
    }

    return fragment;
  }

  init() {
    this.compileElement(this.$fragment);
  }

  // 编译元素
  compileElement(el) {
    // 获取元素的子节点的数组
    let childNodes = el.childNodes,
      self = this;

    // 遍历子节点数组
    [].slice.call(childNodes).forEach(node => {
      // 获取节点文本内容
      const text = node.textContent;
      const reg = /\{\{(.*)\}\}/;

      // 判断是否元素节点
      if (self.isElementNode(node)) {
        // 处理元素上的属性、事件
        self.compile(node);
      } else if (self.isTextNode(node) && reg.test(text)) {
        // 判断是否文本节点
        self.compileText(node, RegExp.$1.trim());
      }
      // 编译节点的子节点
      if (node.childNodes && node.childNodes.length) {
        self.compileElement(node);
      }
    });
  }

  /**
   * 编译元素
   * @param node 元素节点
   */
  compile(node) {
    // 返回指定节点属性的集合
    let nodeAttrs = node.attributes,
      self = this;
    // 遍历节点属性
    [].slice.call(nodeAttrs).forEach(attr => {
      // 属性名
      let attrName = attr.name;
      // 判断是否是vue指令
      if (self.isDirective(attrName)) {
        // 获取属性值
        const exp = attr.value;
        // 截取掉v-
        const dir = attrName.substring(2);
        // 如果是事件指令
        if (self.isEventDirective(dir)) {
          // 绑定事件到元素节点上
          compileUtil.eventHandler(node, self.$vm, exp, dir);
        } else {
          // 普通指令
          compileUtil[dir] && compileUtil[dir](node, self.$vm, exp);
        }
        // 移除属性
        node.removeAttribute(attrName);
      }
    });
  }

  /**
   *
   * @param node 节点
   * @param exp 文本内容
   */
  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp);
  }

  // 是否是vue指令
  isDirective(attr) {
    return attr.indexOf('v-') == 0;
  }

  // 判断是否是事件
  isEventDirective(dir) {
    return dir.indexOf('on') === 0;
  }

  // 判断是否是元素节点
  isElementNode(node) {
    return node.nodeType == 1;
  }

  // 判断是否是文本内容
  isTextNode(node) {
    return node.nodeType == 3;
  }
}

// 指令处理集合
let compileUtil = {
  // v-text
  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },
  // v-html
  html(node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },
  /**
   * v-model
   * @param node 元素节点
   * @param vm vue对象
   * @param exp 属性值
   */
  model(node, vm, exp) {
    this.bind(node, vm, exp, 'model');

    let self = this,
      val = this._getVMVal(vm, exp);
    node.addEventListener('input', function (e) {
      // 获取新值
      const newValue = e.target.value;
      // 判断旧值是否和新值一样
      if (val === newValue) {
        return;
      }
      // 设置新值
      self._setVMVal(vm, exp, newValue);
      val = newValue;
    });
  },

  class(node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },
  /**
   * 绑定数据
   * @param node 节点
   * @param vm vue对象
   * @param exp 属性值
   * @param dir 属性名
   */
  bind(node, vm, exp, dir) {
    const updaterFn = updater[dir + 'Updater'];
    // 判断是否有该处理函数
    updaterFn && updaterFn(node, this._getVMVal(vm, exp));
    // 新建compile与observer桥梁 添加订阅者
    new Watcher(vm, exp, (value, oldValue) => {
      // 绑定更新函数，当属性方式改变时通知更新视图
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  /**
   * 事件处理
   * @param node 元素节点
   * @param vm vue对象
   * @param exp 属性值
   * @param dir 属性名
   */
  eventHandler(node, vm, exp, dir) {
    // 分割取第一个，判断事件类型
    let eventType = dir.split(':')[1],
      // 获取vm.$options.methods 返回methods的事件
      fn = vm.$options.methods && vm.$options.methods[exp];
    // 如果有事件类型和事件处理函数则绑定事件
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  /**
   * 获取模板数据真实数据
   * @param vm vue对象
   * @param exp 属性值
   * @returns {*}
   * @private
   */
  _getVMVal(vm, exp) {
    let val = vm;
    exp = exp.split('.');
    // 将模板数据变为真实数据
    exp.forEach(k => {
      val = val[k];
    });
    return val;
  },

  _setVMVal(vm, exp, value) {
    let val = vm;
    exp = exp.split('.');
    exp.forEach(function (k, i) {
      // 非最后一个key，更新val的值
      if (i < exp.length - 1) {
        val = val[k];
      } else {
        val[k] = value;
      }
    });
  }
};

// 更新器
let updater = {
  // 文本更新器 v-text
  textUpdater(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },
  // html更新器 v-html
  htmlUpdater(node, value) {
    node.innerHTML = typeof value == 'undefined' ? '' : value;
  },

  classUpdater(node, value, oldValue) {
    let className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');

    const space = className && String(value) ? ' ' : '';

    node.className = className + space + value;
  },
  // 双向绑定 v-model
  modelUpdater(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
};