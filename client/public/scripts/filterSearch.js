function filterSearch() {
  const input = document.querySelector("#tag-container input");
  filter = input.value.toUpperCase();
  availableTags = ["RPG", "Adventure"];

  if (availableTags.includes(filter)) {
  }
}

function enableInput() {
  const input = document.querySelector("#tag-container input");
  const plusSign = document.querySelector("#tag-container #plus-sign");

  plusSign.className += " hidden";
  input.className = input.className.replace(" hidden", "");
}

document.addEventListener("click", (e) => {
  const input = document.querySelector("#tag-container input");
  const plusSign = document.querySelector("#tag-container #plus-sign");

  if (
    !input.className.includes("hidden") &&
    e.target != plusSign &&
    e.target != input
  ) {
    input.value = "";
    input.className += " hidden";
    plusSign.className = plusSign.className.replace(" hidden", "");
  }
});
