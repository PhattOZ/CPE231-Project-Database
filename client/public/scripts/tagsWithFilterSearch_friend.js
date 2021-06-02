const tagContainer = document.querySelector("#tag-container");

const input = document.querySelector("#tag-container input");

let tags = [];

// ------------------------ tags --------------

// Create div element
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

  console.log(tags);
}

// // Add tag when space is pressed
// input.addEventListener("keyup", (e) => {
//   if (e.key === " ") {
//     tags.push(input.value);
//     addTags();
//     input.value = "";
//   }
// });

// ----------------- Search lists ----------------

// Create li element
function createListResult(value) {
  const li = document.createElement("li");
  li.setAttribute("class", "search-res");
  li.setAttribute("onClick", "handleAddTag(this.textContent)");
  li.textContent = value;

  const myUl = document.querySelector(".myUl");

  myUl.appendChild(li);
}

// onKeyUp trigger filter search if the input field is not blank
function filterSearch() {
  const input = document.querySelector("#tag-container input");

  filter = input.value.toUpperCase();

  const myUl = document.querySelector(".myUl");

  myUl.innerHTML = "";

  if (input.value != "") {
    for (let i = 0; i < availableTags.length; i++) {
      if (
        availableTags[i].toUpperCase().indexOf(filter) > -1 &&
        !tags.includes(availableTags[i])
      ) {
        createListResult(availableTags[i]);
      } else {
      }
    }
  }
}

// -------------------- Event handlers ---------------

function handleAddTag(value) {
  const myUl = document.querySelector(".myUl");

  tags.push(value);
  addTags();
  input.value = "";
  myUl.innerHTML = "";
}

function removeTag(label) {
  const index = tags.indexOf(label);
  tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
  addTags();
}

// Enable the search bar when the + button is clicked
function enableInput() {
  const input = document.querySelector("#tag-container input");
  const plusSign = document.querySelector("#tag-container #plus-sign");
  const myUl = document.querySelector(".myUl");

  plusSign.className += " hidden";
  input.className = input.className.replace(" hidden", "");
  myUl.className = myUl.className.replace(" hidden", "");
  input.focus();
}

// Close the search bar when click anywhere else
document.addEventListener("click", (e) => {
  const input = document.querySelector("#tag-container input");
  const plusSign = document.querySelector("#tag-container #plus-sign");
  const myUl = document.querySelector(".myUl");

  if (!input.className.includes("hidden")) {
    if (
      e.target != plusSign &&
      e.target != input &&
      e.target != myUl &&
      !myUl.contains(e.target)
    ) {
      input.value = "";
      input.className += " hidden";
      myUl.innerHTML = "";
      myUl.className += " hidden";
      plusSign.className = plusSign.className.replace(" hidden", "");
    }
  }
});

function handleSubmit() {
  const parser = document.querySelector("#submit-parser");
  const categoryArray = document.createElement("input");
  categoryArray.setAttribute("type", "hidden");
  categoryArray.setAttribute("name", "friendL");//Name 
  categoryArray.setAttribute("value", tags);

  parser.innerHTML = "";

  parser.appendChild(categoryArray);
}
