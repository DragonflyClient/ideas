const nav = document.querySelector('#nav');
const ham = document.querySelector('.ham-wrapper');
const socials = document.querySelector('.socials');

nav.classList.remove('nav-active');
ham.classList.remove('ham-active');

ham.addEventListener('click', toggleNav);

function toggleNav() {
    nav.classList.toggle('nav-active');
    ham.classList.toggle('ham-active');
    socials.classList.toggle('socials-active');
}

function scrollToTop() { $("html, body").animate({ scrollTop: 0 }, 400), closeMenu() }