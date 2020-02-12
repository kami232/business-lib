// 解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图
class Compile {
  /**
   *
   * @param el 节点
   * @param vm
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

  node2Fragment(el) {
    let fragment = document.createDocumentFragment(),
      child;

    // 将原生节点拷贝到fragment
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }

    return fragment;
  }

  init() {
    this.compileElement(this.$fragment);
  }

  compileElement(el) {
    let childNodes = el.childNodes,
      me = this;

    [].slice.call(childNodes).forEach(node => {
      const text = node.textContent;
      const reg = /\{\{(.*)\}\}/;

      if (me.isElementNode(node)) {
        me.compile(node);

      } else if (me.isTextNode(node) && reg.test(text)) {
        me.compileText(node, RegExp.$1.trim());
      }

      if (node.childNodes && node.childNodes.length) {
        me.compileElement(node);
      }
    });
  }

  compile(node) {
    let nodeAttrs = node.attributes,
      me = this;

    [].slice.call(nodeAttrs).forEach(attr => {
      let attrName = attr.name;
      if (me.isDirective(attrName)) {
        const exp = attr.value;
        const dir = attrName.substring(2);
        // 事件指令
        if (me.isEventDirective(dir)) {
          compileUtil.eventHandler(node, me.$vm, exp, dir);
          // 普通指令
        } else {
          compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
        }

        node.removeAttribute(attrName);
      }
    });
  }

  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp);
  }

  isDirective(attr) {
    return attr.indexOf('v-') == 0;
  }

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
  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },

  html(node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },

  model(node, vm, exp) {
    this.bind(node, vm, exp, 'model');

    let me = this,
      val = this._getVMVal(vm, exp);
    node.addEventListener('input', function (e) {
      const newValue = e.target.value;
      if (val === newValue) {
        return;
      }

      me._setVMVal(vm, exp, newValue);
      val = newValue;
    });
  },

  class(node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },

  bind(node, vm, exp, dir) {
    const updaterFn = updater[dir + 'Updater'];

    updaterFn && updaterFn(node, this._getVMVal(vm, exp));

    new Watcher(vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  // 事件处理
  eventHandler(node, vm, exp, dir) {
    let eventType = dir.split(':')[1],
      fn = vm.$options.methods && vm.$options.methods[exp];

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  _getVMVal(vm, exp) {
    let val = vm;
    exp = exp.split('.');
    exp.forEach(function (k) {
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


let updater = {
  textUpdater(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },

  htmlUpdater(node, value) {
    node.innerHTML = typeof value == 'undefined' ? '' : value;
  },

  classUpdater(node, value, oldValue) {
    let className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');

    const space = className && String(value) ? ' ' : '';

    node.className = className + space + value;
  },

  modelUpdater(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
};