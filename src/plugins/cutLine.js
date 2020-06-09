const cutLine = (predicate) => (acc, event) => {
  if (!predicate(event)) {
    return;
  }

  event.preventDefault();

  const { value, selectionStart, selectionEnd } = acc;

  if (selectionEnd !== selectionStart) {
    const newValue =
      value.substring(0, selectionStart) + value.substring(selectionEnd);

    navigator.clipboard.writeText(
      value.substring(selectionStart, selectionEnd)
    );

    return {
      value: newValue,
      selectionStart: selectionStart,
      selectionEnd: selectionStart,
    };
  }

  const linesBeforeCaret = value
    .substring(0, selectionStart)
    .split("\n")
    .slice(0, -1);

  const currentLineNumber = linesBeforeCaret.length;

  const newValue = value
    .split("\n")
    .map((line, lineNumber) => {
      if (lineNumber === currentLineNumber) {
        return null;
      }

      return line;
    })
    .filter((line) => line != null)
    .join("\n");

  navigator.clipboard.writeText(value.split("\n")[currentLineNumber]);

  return {
    value: newValue,

    // move cursor to start next line
    selectionStart: linesBeforeCaret.join("\n").length + 1,
    selectionEnd: linesBeforeCaret.join("\n").length + 1,
  };
};

export default cutLine;