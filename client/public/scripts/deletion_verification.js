const delete_buttons = document.querySelectorAll(".delete-button");

delete_buttons.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (!confirm("Permanently delete this account?")) {
      event.preventDefault();
    }
  });
});
