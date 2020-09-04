/*---------------*/
/*== SELECTORS ==*/
/*---------------*/
/* #region selectors */
// const nav = document.querySelector('#nav');
// const ham = document.querySelector('.ham-wrapper');
// const socials = document.querySelector('.socials');
const landing = document.getElementById("landing")
const video = document.querySelector('video');
const accordionList = document.querySelectorAll('.accordion-item-header');
const width = window.innerWidth;
const ham = document.querySelector('.ham-wrapper')
const nav = document.getElementById('nav')
const socials = document.querySelector('.socials');
const news = document.getElementById("news")
const newsCloseBtn = document.getElementById("news-close")

/*------------------*/
/*== OTHER EVENTS ==*/
/*------------------*/

/* #region other-events */
// FAQ Accordion
accordionList.forEach((accordionHeader) => {
    accordionHeader.addEventListener('click', () => {
        accordionHeader.classList.toggle('accordion-active');
        const accordionItemBody = accordionHeader.nextElementSibling;
        if (accordionHeader.classList.contains('accordion-active')) {
            accordionList.forEach((otherAccordion) => {
                if (otherAccordion !== accordionHeader) {
                    otherAccordion.classList.remove('accordion-active')
                    otherAccordion.nextElementSibling.style.maxHeight = 0;
                }
            })
            accordionItemBody.style.maxHeight = accordionItemBody.scrollHeight + 'px';
        } else {
            accordionItemBody.style.maxHeight = "0";
        }
    });
});

// Hamburger Menu
nav.classList.remove('nav-active');
ham.classList.remove('ham-active');
console.log('nav test active')
let navOpen = false
ham.addEventListener('click', e => {

    if (!navOpen) {
        nav.classList.add('nav-active')
        ham.classList.add('ham-active')
        socials.classList.add('socials-active')
        if (news && news.getAttribute('closed') !== "true") {
            console.log('first if')
            setTimeout(() => {
                hideNews()
            }, 250);
        } else {
            console.log('first else')
            hideNews()
        }
        navOpen = true
    } else {
        if (news && news.getAttribute('closed') !== "true") {
            showNews()
            setTimeout(() => {
                nav.classList.remove('nav-active')
                ham.classList.remove('ham-active')
                socials.classList.remove('socials-active')
            }, 250);
        } else {
            nav.classList.remove('nav-active')
            ham.classList.remove('ham-active')
            socials.classList.remove('socials-active')
        }

        navOpen = false
    }
})

function hideNews() {
    if (news) {
        let op = "-"
        if (news.getAttribute('closed') !== "true") {
            news.style.transform = `translateY(${op}${news.offsetHeight}px)`
            document.getElementById("navbar").style.transform = `translateY(${op}${news.offsetHeight}px)`
            document.getElementById("navbar").style.top = `${news.offsetHeight}px`
        }

        console.log(op, `translateY(${op}${news.offsetHeight}px)`)

        if (news.getAttribute('closed') == "true" && width < 1000) {
            document.getElementById("features").style.paddingTop = "0px"
            document.getElementById("features").style.marginTop = "-50px"
        }
        console.log(news.getAttribute('closed') == "true")
        if (news.getAttribute('closed') == "true") {
            landing.style.transform = `translateY(-${news.offsetHeight}px)`
        }

    }
}
function showNews() {
    if (news.getAttribute('closed') !== "true") {
        news.style.transform = `translateY(0px)`
        document.getElementById("navbar").style.transform = `translateY(0px)`
        document.getElementById("navbar").style.top = `0px`
    }
}

if (news) {
    newsCloseBtn.addEventListener("click", manageNews)
}

function manageNews() {
    console.log('closing')
    news.style.transform = `translateY(-${news.offsetHeight}px)`
    document.getElementById("navbar").style.transform = `translateY(-${news.offsetHeight}px)`
    document.getElementById("navbar").style.top = `${news.offsetHeight}px`
    localStorage.setItem('newsClosed', 'true')
    news.setAttribute('closed', 'true')
    hideNews()
}

// Close the nav menu
function closeMenu() {
    nav.classList.remove('nav-active');
    ham.classList.remove('ham-active');
}

// Refresh the page
function refresh() {
    window.location.reload(false)
}

if (!window.location.hash) {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
}
/* #endregion */

function scrollToTop() {
    $("html, body").animate({ scrollTop: 0 }, 400)
    closeMenu()
}

// Shrink navbar on scroll
window.onscroll = function () {
    const landingVid = document.getElementById("landing-vid")
    if (landingVid) {
        if (document.documentElement.scrollTop > window.innerHeight) {
            landingVid.pause()
        } else if (landingVidStatus) {
            landingVid.play()
        }
    }
};

window.onload = function () {
    if (!document.getElementById("news")) {
        nav.style.position = "fixed"
    }
};

/* Logout dropdown */
/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}