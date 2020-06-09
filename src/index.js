import {
  textareaStyles,
  preStyles,
  rootStyles,
  linesStyles,
} from "./styles.js";

import composePlugins from "./plugins/composePlugins.js";

class Yace {
  constructor(selector, options = {}) {
    if (!selector) {
      throw new Error("selector is not defined");
    }

    this.root = document.querySelector(selector);

    if (!this.root) {
      throw new Error(`element with "${selector}" selector is not exist`);
    }

    const defaultOptions = {
      value: "",
      styles: {},
      plugins: [],
      highlighter: (value) => value,
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

    this.root.appendChild(this.textarea);
    this.root.appendChild(this.pre);

    this.addTextareaEvents();
    this.update({ value: this.options.value });
    this.updateLines();
  }

  addTextareaEvents() {
    this.handleInput = (event) => {
      const { value, selectionStart, selectionEnd } = event.target;
      this.update({ value, selectionStart, selectionEnd });
    };

    this.handleKeydown = (event) => {
      const { value, selectionStart, selectionEnd } = composePlugins(
        this.options.plugins,
        event,
        this.options
      );
      this.update({ value, selectionStart, selectionEnd });
    };

    this.textarea.addEventListener("input", this.handleInput);
    this.textarea.addEventListener("keydown", this.handleKeydown);
  }

  update({ value, selectionStart, selectionEnd }) {
    // should be before updating selection otherwise selection will be lost
    this.textarea.value = value;

    this.textarea.selectionStart = selectionStart;
    this.textarea.selectionEnd = selectionEnd;

    if (value === this.value) {
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
    const length = lines.length.toString().length;

    this.root.style.paddingLeft = `${length + 1}ch`;

    this.lines.innerHTML = lines
      .map((line, number) => {
        return `<span class="tte-line" style="position: absolute; opacity: .3; left: 0">${
          1 + number
        }</span><span style="color: transparent; pointer-events: none">${line}</span>`;
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

export default Yace;