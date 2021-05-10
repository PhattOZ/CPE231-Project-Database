// Code from https://www.w3schools.com/howto/howto_js_slideshow.asp

let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dots");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    if (!slides[i].className.match(/(?:^|\s)hidden(?!\S)/)) {
      slides[i].className += "hidden";
    }
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" bg-black", " bg-gray-100");
  }
  console.log(slides[0]);
  console.log(slideIndex);
  slides[slideIndex - 1].className = slides[slideIndex - 1].className.replace(
    "/(?:^|s)hidden(?!S)/",
    ""
  );
  dots[slideIndex - 1].className = dots[slideIndex - 1].className.replace(
    "/(?:^|s)bg-gray-100(?!S)/",
    " bg-black"
  );
}
