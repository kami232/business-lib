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
      this.el.appendChild(this.fragment);
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

  // 解析模板
  compileElement() {
    let childNodes = this.el.childNodes;
    [].slice.call(childNodes).forEach(node => {
      const Reg = /\{\{(.*)\}\}/;
      const text = node.textContent;

      // 判断是否是文本节点，并且是符合{{}}规则
      if (this.isTextNode(node) && Reg.test(text)) {
        this.compileText(node, Reg.exec(text)[1]);
      }

      // 判断是否还有子节点
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node); // 继续遍历子节点
      }
    })
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

  // 更新
  updateText(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value; // 更新{{}}的值
  }

  /**
   * 判断是否是文本节点
   * @param node
   * @returns {boolean}
   */
  isTextNode(node) {
    return node.nodeType == 3;
  }
}




