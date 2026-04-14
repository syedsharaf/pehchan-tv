// Mobile menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  function closeMobile() { mobileMenu.classList.remove('open'); }

  // Back to top visibility
  const btt = document.getElementById('btt');
  window.addEventListener('scroll', () => {
    btt.classList.toggle('show', window.scrollY > 400);
  });

  // Fade-up on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Media category tabs
  document.querySelectorAll('.media-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.media-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Form submit
  function handleSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = '✓ Message Sent! We\'ll be in touch soon.';
    btn.style.background = 'var(--green2)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      btn.style.background = '';
      e.target.reset();
    }, 4000);
  }

  // Navbar scroll opacity
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').style.boxShadow =
      window.scrollY > 60 ? '0 4px 32px rgba(0,0,0,.4)' : 'none';
  });

const words = ["VOICE", "PehchanTV"];

let i = 0;
let j = 0;
let isDeleting = false;

const typingElement = document.getElementById("typing");

function typeEffect() {
  let currentWord = words[i];

  if (!isDeleting) {
    typingElement.textContent = currentWord.substring(0, j + 1);
    j++;
  } else {
    typingElement.textContent = currentWord.substring(0, j - 1);
    j--;
  }

  let speed = isDeleting ? 80 : 150;

  if (!isDeleting && j === currentWord.length) {
    speed = 2000; // pause
    isDeleting = true;
  } else if (isDeleting && j === 0) {
    isDeleting = false;
    i = (i + 1) % words.length;
    speed = 300;
  }

  setTimeout(typeEffect, speed);
}

typeEffect();

const scrollBtn = document.getElementById("scrollBtn");
const hero = document.getElementById("hero");

function checkHeroHeight() {
  if (hero.offsetHeight >= window.innerHeight) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
}

checkHeroHeight();

window.addEventListener("resize", checkHeroHeight);

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    scrollBtn.classList.add("hide");
  } else {
    scrollBtn.classList.remove("hide");
  }
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: "smooth"
  });
});

const menuBtn = document.getElementById("hamburger");

menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("active");
});

const langBtn = document.getElementById("langBtn");
const langSwitch = document.querySelector(".lang-switch");

langBtn.onclick = () => {
  langSwitch.classList.toggle("active");
};

function setLang(lang) {
  let select = document.querySelector(".goog-te-combo");

  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event("change"));
  }

  langSwitch.classList.remove("active");
}
