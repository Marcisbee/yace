import {
  textareaStyles,
  preStyles,
  rootStyles,
  linesStyles,
} from "./styles.js";

class Yace {
  constructor(selector, options = {}) {
    if (!selector) {
      throw new Error("selector is not defined");
    }

    this.root =
      selector instanceof Node ? selector : document.querySelector(selector);

    if (!this.root) {
      throw new Error(`element with "${selector}" selector is not exist`);
    }

    const defaultOptions = {
      value: "",
      styles: {},
      plugins: [],
      highlighter: (value) => escape(value),
    };

    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.init();
  }

  init() {
    this.textarea = document.createElement("textarea");
    this.pre = document.createElement("pre");

    Object.assign(this.root.style, rootStyles, this.options.styles);
    Object.assign(this.textarea.style, textareaStyles);
    Object.assign(this.pre.style, preStyles);

    this.addStyles();

    this.root.appendChild(this.textarea);
    this.root.appendChild(this.pre);

    this.addTextareaEvents();
    this.update({ value: this.options.value });
    this.updateLines();
  }

  addStyles() {
    if (document.getElementById("yace-styles")) {
      return;
    }

    const styles = document.createElement("style");

    styles.id = "yace-styles";
    styles.innerHTML =
      ".yace-line {\
        counter-increment: yace-line-counter;\
        position: absolute;\
        opacity: .3;\
      }\
      .yace-line::before {\
        content: counter(yace-line-counter);\
        width: 2em;\
        display: inline-block;\
        text-align: right;\
        position: absolute;\
        right: calc(100% + 11px);\
      }";

    document.head.appendChild(styles);
  }

  addTextareaEvents() {
    this.handleInput = (event) => {
      const textareaProps = runPlugins(this.options.plugins, event);
      this.update(textareaProps);
    };

    this.handleKeydown = (event) => {
      const textareaProps = runPlugins(this.options.plugins, event);
      this.update(textareaProps);
    };

    this.textarea.addEventListener("input", this.handleInput);
    this.textarea.addEventListener("keydown", this.handleKeydown);
  }

  update(textareaProps) {
    const { value, selectionStart, selectionEnd } = textareaProps;
    // should be before updating selection otherwise selection will be lost
    if (value != null) {
      this.textarea.value = value;
    }

    this.textarea.selectionStart = selectionStart;
    this.textarea.selectionEnd = selectionEnd;

    if (value === this.value || value == null) {
      return;
    }

    this.value = value;

    const highlighted = this.options.highlighter(value);
    this.pre.innerHTML = highlighted + "<br/>";

    this.updateLines();

    if (this.updateCallback) {
      this.updateCallback(value);
    }
  }

  updateLines() {
    if (!this.options.lineNumbers) {
      return;
    }

    if (!this.lines) {
      this.lines = document.createElement("pre");
      this.root.appendChild(this.lines);
      Object.assign(this.lines.style, linesStyles);
    }

    const lines = this.value.split("\n");

    this.lines.innerHTML = lines
      .map((line) => {
        // prettier-ignore
        const lineNumber = `<span class="yace-line"></span>`
        // prettier-ignore
        const lineText = `<span style="visibility: hidden; pointer-events: none">${escape(line)}</span>`;
        return `${lineNumber}${lineText}`;
      })
      .join("\n");
  }

  destroy() {
    this.textarea.removeEventListener("input", this.handleInput);
    this.textarea.removeEventListener("keydown", this.handleKeydown);
  }

  onUpdate(callback) {
    this.updateCallback = callback;
  }
}

function runPlugins(plugins, event) {
  const { value, selectionStart, selectionEnd } = event.target;

  return plugins.reduce(
    (acc, plugin) => {
      return {
        ...acc,
        ...plugin(acc, event),
      };
    },
    { value, selectionStart, selectionEnd }
  );
}

function escape(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default Yace;
