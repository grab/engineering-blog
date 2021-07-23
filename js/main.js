const mobileMenuBtn = document.querySelector('.hamburger-nav');
const mobileMenu = document.querySelector('.mobile-menu-container')
let menuOpen = false;
mobileMenuBtn.addEventListener('click', () => {
  if(!menuOpen) {
    mobileMenuBtn.classList.add('open');
    mobileMenu.classList.add('active')
    menuOpen = true;
  } else {
    mobileMenuBtn.classList.remove('open');
    mobileMenu.classList.remove('active')
    menuOpen = false;
  }
});