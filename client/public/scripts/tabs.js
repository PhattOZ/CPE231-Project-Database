function switchTab(event, tab_content) {
  let contents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < contents.length; i++) {
    if (!contents[i].classList.contains("hidden")) {
      contents[i].classList.add("hidden");
    }
  }

  let tabs = document.getElementsByClassName("tab-tab");
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains("tab-selected")) {
      tabs[i].classList.remove("tab-selected");
      tabs[i].classList.add("cursor-pointer");
      tabs[i].classList.add("hover:text-white");
    }
  }

  document.getElementById(tab_content).classList.remove("hidden");
  event.currentTarget.classList.add("tab-selected");
}
