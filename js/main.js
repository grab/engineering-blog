const mobileMenuBtn = document.querySelector('#mobile-menu-btn');
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

$(document).ready(function() {
  var progressPath = document.querySelector('.progress-wrap path');
  var pathLength = progressPath.getTotalLength();

  progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
  progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
  progressPath.style.strokeDashoffset = pathLength;
  progressPath.getBoundingClientRect();
  progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

  var updateProgress = function() {
    var scroll = $(window).scrollTop();
    var height = $(document).height() - $(window).height();
    var progress = pathLength - (scroll * pathLength / height);
    progressPath.style.strokeDashoffset = progress;
  }

  updateProgress();
  $(window).scroll(updateProgress);

  var offset = 50;
  var duration = 550;

  jQuery(window).on('scroll', function() {
    if(jQuery(this).scrollTop() > offset) {
      jQuery('.progress-wrap').addClass('active-progress');
    } else {
      jQuery('.progress-wrap').removeClass('active-progress');
    }
  });

  jQuery('.progress-wrap').on('click', function(event) {
    event.preventDefault();
    jQuery('html, body').animate({scrollTop: 0}, duration);
    return false;
  })
});