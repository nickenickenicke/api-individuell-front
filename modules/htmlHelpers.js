const createTableRow = function (elementType, innerText, className) {
  let element = document.createElement(elementType);
  element.textContent = innerText;
  if (className) element.classList.add(className);
  return element;
};

export { createTableRow };
