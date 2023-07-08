import Swiper from "swiper/bundle";
import Aos from "aos";
Aos.init({
  duration: 1000,
  offset: 100,
});
const progressCircle = document.querySelector(".autoplay-progress svg");
const progressContent = document.querySelector(".autoplay-progress span");
let swiper = new Swiper(".mySwiper", {
  spaceBetween: 30,
  centeredSlides: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  on: {
    autoplayTimeLeft(s, time, progress) {
      progressCircle.style.setProperty("--progress", 1 - progress);
      progressContent.textContent = `${Math.ceil(time / 1000)}s`;
    },
  },
});

window.addEventListener("scroll", () => {
  let scrollFromTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  if (scrollFromTop > 250) {
    document.querySelector("header").classList.add("headerChangeTheme");
  } else if (scrollFromTop < 250) {
    document.querySelector("header").classList.remove("headerChangeTheme");
  }
});
