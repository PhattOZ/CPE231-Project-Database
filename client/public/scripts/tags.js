const tagContainer = document.querySelector("#tag-container");

const input = document.querySelector("#tag-container input");

let tags = [];

function createTag(label) {
  const div = document.createElement("div");
  div.setAttribute("class", "tag");
  div.setAttribute("onClick", "removeTag(this.innerHTML)");
  div.innerHTML = label;

  return div;
}

function reset() {
  document.querySelectorAll(".tag").forEach((tag) => {
    tag.parentElement.removeChild(tag);
  });
}

// Create HTML element based on values in tags array
function addTags() {
  reset();
  tags
    .slice()
    .reverse()
    .forEach((label) => {
      const input = createTag(label);
      tagContainer.prepend(input);
    });
}

input.addEventListener("keyup", (e) => {
  if (e.key === " ") {
    tags.push(input.value);
    addTags();
    input.value = "";
  }
});

function removeTag(label) {
  const index = tags.indexOf(label);
  tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
  addTags();
}
