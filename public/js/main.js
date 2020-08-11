
/* Smooth scroll top */
function scrollToTop() {
    $('html, body').animate({ scrollTop: 0 }, 400), closeMenu();
}

document.addEventListener('load', function () {
    // Close the nav menu

    function closeMenu() {
        nav.classList.remove('nav-active');
        ham.classList.remove('ham-active');
    }
    const nav = document.querySelector('.nav'),
        ham = document.querySelector('.ham-wrapper'),
        socials = document.querySelector('.socials'),
        header = document.getElementById('header') || document.getElementById('navbar');

    ham.addEventListener('click', toggleNav);
    function toggleNav() {
        nav.classList.toggle('nav-active')
        ham.classList.toggle('ham-active');
        setTimeout(() => {
            socials.classList.toggle("socials-active")
        }, 500);
    }

    // Set position of footer based on content height
    if (document.querySelector('.cont-view').clientHeight > 500) {
        console.log(document.querySelector('.cont-view').clientHeight)
        document.querySelector('#footer').style.setProperty("position", "relative", "important");
        console.log(document.querySelector('#footer.view'))
    }
});