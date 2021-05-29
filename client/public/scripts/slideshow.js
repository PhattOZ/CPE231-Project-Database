// Code from https://www.w3schools.com/howto/howto_js_slideshow.asp

// 1st slideshow

let slideIndex_1 = 1;
showSlides_1(slideIndex_1);

// Next/previous controls
function plusSlides(n) {
  showSlides_1((slideIndex_1 += n));
}

// Thumbnail image controls
function currentSlide_1(n) {
  showSlides_1((slideIndex_1 = n));
}

function showSlides_1(n) {
  let i;
  let slides = document.getElementsByClassName("slide1");
  let dots = document.getElementsByClassName("dot-1");
  if (n > slides.length) {
    slideIndex_1 = 1;
  }
  if (n < 1) {
    slideIndex_1 = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    if (!slides[i].className.match(/(?:^|\s)hidden(?!\S)/)) {
      slides[i].className += " hidden";
    }
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(
      " bg-gray-600",
      " bg-gray-100"
    );
  }

  slides[slideIndex_1 - 1].className = slides[slideIndex_1 - 1].className.replace(
    "hidden",
    ""
  );
  dots[slideIndex_1 - 1].className = dots[slideIndex_1 - 1].className.replace(
    " bg-gray-100",
    " bg-gray-600"
  );
}

// 2nd slides

let slideIndex_2 = 1;
showSlides_2(slideIndex_2);

// Next/previous controls
function plusSlides(n) {
  showSlides_2((slideIndex_2 += n));
}

// Thumbnail image controls
function currentSlide_2(n) {
  showSlides_2((slideIndex_2 = n));
}

function showSlides_2(n) {
  let i;
  let slides = document.getElementsByClassName("slide2");
  let dots = document.getElementsByClassName("dot-2");
  if (n > slides.length) {
    slideIndex_2 = 1;
  }
  if (n < 1) {
    slideIndex_2 = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    if (!slides[i].className.match(/(?:^|\s)hidden(?!\S)/)) {
      slides[i].className += " hidden";
    }
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(
      " bg-gray-600",
      " bg-gray-100"
    );
  }

  slides[slideIndex_2 - 1].className = slides[slideIndex_2 - 1].className.replace(
    "hidden",
    ""
  );
  dots[slideIndex_2 - 1].className = dots[slideIndex_2 - 1].className.replace(
    " bg-gray-100",
    " bg-gray-600"
  );
}