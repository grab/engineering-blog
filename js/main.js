document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.querySelector("#mobile-menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu-container");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("active");
      mobileMenuBtn.classList.toggle("open", isOpen);
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const progressWrap = document.querySelector(".progress-wrap");
  const progressPath = document.querySelector(
    ".progress-wrap .progress-circle path",
  );

  if (progressWrap && progressPath) {
    const pathLength = progressPath.getTotalLength();
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollHeight > 0
          ? pathLength - (scrollTop * pathLength) / scrollHeight
          : pathLength;
      progressPath.style.strokeDashoffset = progress;
      progressWrap.classList.toggle("active-progress", scrollTop > 50);
    };

    progressPath.style.transition = "none";
    progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = "stroke-dashoffset 10ms linear";

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    progressWrap.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
    updateProgress();
  }
});
