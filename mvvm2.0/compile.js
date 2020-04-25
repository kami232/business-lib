/**
 * 解析器
 * opts 实例参数
 * vm selfVue 实例this
 */
class Compile {
  constructor(el, vm) {
    this.el = document.querySelector(el);
    this.vm = vm;
    this.fragment = null;
    this.init();
  }

  init() {
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el); // 返回虚拟节点集
      this.compileElement(this.fragment); // 解析模板
      this.el.appendChild(this.fragment); // 添加节点
    } else {
      console.log('DOM不存在')
    }
  }

  /**
   * 获取模板
   * @param el
   * @returns {DocumentFragment}
   */
  nodeToFragment(el) {
    let fragment = document.createDocumentFragment();
    let child = el.firstChild; // 获取第一个节点
    while (child) {
      // 注意：createDocumentFragment通过appendChild添加节点会把原节点DOM删除
      fragment.appendChild(child);
      child = el.firstChild;
    }
    return fragment;
  }

  // 解析模板， 解析指令也是在这里做
  compileElement(el) {
    let childNodes = el.childNodes;
    [].slice.call(childNodes).forEach(node => {
      const Reg = /\{\{(.*)\}\}/;
      const text = node.textContent;

      if (this.isElementNode(node)) {
        // 判断是否是元素节点
        this.compileAttr(node);
      } else if (this.isTextNode(node) && Reg.test(text)) {
        // 判断是否是文本节点，并且是符合{{}}规则
        this.compileText(node, Reg.exec(text)[1].trim());
      }

      // 判断是否还有子节点
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node); // 继续遍历子节点
      }
    })
  }

  compileAttr(node) {
    const nodeAttrs = node.attributes;
    [].slice.call(nodeAttrs).forEach(attr => {
      const attrName = attr.name;
      // 判断是否是属性
      if (this.isDirective(attrName)) {
        const exp = attr.value; // 获取属性的值
        const dir = attrName.substring(2); // 除掉前缀的指令名
        if (this.isEventDirective(dir)) {
          this.compileEvent(node, this.vm, exp, dir);
        } else {
          this.compileModel(node, this.vm, exp, dir);
        }
        node.removeAttribute(attrName); // 在节点上移除该属性
      }
    });
  }

  /**
   * 初始化值并且初始化添加订阅者
   * @param node 节点
   * @param exp {{}}的属性名
   */
  compileText(node, exp) {
    const initText = this.vm[exp]; // 初始值
    this.updateText(node, initText); // 更新{{}}值
    new Watcher(this.vm, exp, value => { // 初始化订阅者
      this.updateText(node, value);
    })
  }

  /**
   * 绑定事件
   * @param node 节点
   * @param vm 实例
   * @param exp 指令属性值
   * @param dir 指令名
   */
  compileEvent(node, vm, exp, dir) {
    const eventType = dir.split(':')[1]; // 事件类型
    const cb = vm.methods && vm.methods[exp];
    if (eventType && cb) {
      // 注意这里的cb上的this指向是指向被绑定的元素，我们需要把它改为实例，否则this是无法访问到实例上的data
      node.addEventListener(eventType, cb.bind(vm), false);
    }
  }

  /**
   *
   * @param node
   * @param vm
   * @param exp
   * @param dir
   */
  compileModel(node, vm, exp, dir) {
    let val = this.vm[exp]; // 获取该属性值的值
    this.modelUpdater(node, val);
    new Watcher(this.vm, exp, value => {
      this.modelUpdater(node, value);
    }); // 注册订阅者器

    // 监听input事件，也是v-model的双向绑定原理
    node.addEventListener('input', e => {
      const newValue = e.target.value;
      if (val === newValue) {
        return;
      }
      this.vm[exp] = newValue;
      val = newValue; // 缓存值，用于下次比较
    });
  }

  // 更新
  updateText(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value; // 更新{{}}的值
  }

  /**
   * 修改input的value属性
   * @param node 节点
   * @param value 新值
   * @param oldValue
   */
  modelUpdater(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }

  /**
   * 判断是否是文本节点
   * @param node
   * @returns {boolean}
   */
  isTextNode(node) {
    return node.nodeType == 3;
  }

  /**
   * 判断是否是指令
   * @param node
   * @returns {boolean}
   */
  isDirective(attr) {
    return attr.indexOf('v-') == 0;
  }

  /**
   * 判断是否是事件指令
   * @param dir
   * @returns {boolean}
   */
  isEventDirective(dir) {
    return dir.indexOf('on:') == 0;
  }

  /**
   * 判断是否是元素节点
   * @param node
   * @returns {boolean}
   */
  isElementNode(node) {
    return node.nodeType == 1;
  }
}




