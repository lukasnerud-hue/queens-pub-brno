/* Queen's Pub Brno — shared site behaviour */
(function(){
  "use strict";

  /* ---------- language toggle ---------- */
  var LANG_KEY = "qp-lang";
  function applyLang(lang){
    document.documentElement.setAttribute("data-lang", lang);
    document.querySelectorAll("[data-lang-btn]").forEach(function(btn){
      btn.classList.toggle("is-active", btn.getAttribute("data-lang-btn") === lang);
    });
    try{ localStorage.setItem(LANG_KEY, lang); }catch(e){}
  }
  document.addEventListener("click", function(e){
    var btn = e.target.closest("[data-lang-btn]");
    if(!btn) return;
    applyLang(btn.getAttribute("data-lang-btn"));
  });

  /* ---------- respect reduced motion for hero video ---------- */
  var heroVideo = document.querySelector(".hero-media video");
  if(heroVideo){
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduceMotion){ heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }
  }

  /* ---------- header scroll state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll(){
    if(!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 30);
  }
  document.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---------- mobile menu ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  var mobileClose = document.querySelector(".mobile-close");
  function openMenu(){ mobileMenu && mobileMenu.classList.add("is-open"); document.body.style.overflow="hidden"; }
  function closeMenu(){ mobileMenu && mobileMenu.classList.remove("is-open"); document.body.style.overflow=""; }
  navToggle && navToggle.addEventListener("click", openMenu);
  mobileClose && mobileClose.addEventListener("click", closeMenu);
  mobileMenu && mobileMenu.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeMenu); });

  /* ---------- reveal on scroll (re-runnable for dynamically injected content) ---------- */
  function initReveal(){
    var revealEls = document.querySelectorAll(".reveal:not([data-reveal-bound])");
    if("IntersectionObserver" in window && revealEls.length){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, {threshold:.12, rootMargin:"0px 0px -40px 0px"});
      revealEls.forEach(function(el){ el.setAttribute("data-reveal-bound","1"); io.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add("is-visible"); el.setAttribute("data-reveal-bound","1"); });
    }
  }
  initReveal();

  /* ---------- menu page: scrollspy (re-runnable once menu.js injects links/groups) ---------- */
  function initMenuSpy(){
    var menuNav = document.querySelector(".menu-nav");
    if(!menuNav) return;
    var links = Array.prototype.slice.call(menuNav.querySelectorAll("a"));
    var groups = links.map(function(a){ return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
    function setActive(id){
      links.forEach(function(a){ a.classList.toggle("is-active", a.getAttribute("href") === "#"+id); });
    }
    links.forEach(function(a){
      a.addEventListener("click", function(){ setTimeout(function(){ setActive(a.getAttribute("href").slice(1)); }, 10); });
    });
    if("IntersectionObserver" in window){
      var spy = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ setActive(entry.target.id); }
        });
      }, {rootMargin: "-30% 0px -60% 0px"});
      groups.forEach(function(g){ spy.observe(g); });
    }
  }
  initMenuSpy();
  document.addEventListener("menu:rendered", function(){ initReveal(); initMenuSpy(); });
  document.addEventListener("events:rendered", function(){ initReveal(); });

  /* ---------- gallery filters + lightbox (event-delegated: works with items added later by gallery.js) ---------- */
  var masonry = document.getElementById("gallery-masonry") || document.querySelector(".masonry");
  var filtersWrap = document.getElementById("gallery-filters") || document.querySelector(".gallery-filters");
  var lightbox = document.querySelector(".lightbox");

  if(masonry && filtersWrap){
    function visibleItems(){
      return Array.prototype.slice.call(masonry.querySelectorAll(".masonry-item")).filter(function(it){
        return it.style.display !== "none";
      });
    }

    filtersWrap.addEventListener("click", function(e){
      var btn = e.target.closest("button[data-filter]");
      if(!btn) return;
      var wasActive = btn.classList.contains("is-active");
      filtersWrap.querySelectorAll("button").forEach(function(b){ b.classList.remove("is-active"); });
      var cat = wasActive ? "all" : btn.getAttribute("data-filter");
      if(!wasActive) btn.classList.add("is-active");
      masonry.querySelectorAll(".masonry-item").forEach(function(it){
        var show = cat === "all" || it.getAttribute("data-cat") === cat;
        it.style.display = show ? "" : "none";
      });
    });

    if(lightbox){
      var lbImg = lightbox.querySelector("img");
      var currentIndex = 0;

      var openLightbox = function(idx){
        var vis = visibleItems();
        currentIndex = idx;
        lbImg.src = vis[currentIndex].getAttribute("data-full");
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      };
      var closeLightbox = function(){
        lightbox.classList.remove("is-open");
        document.body.style.overflow = "";
      };
      var step = function(dir){
        var vis = visibleItems();
        currentIndex = (currentIndex + dir + vis.length) % vis.length;
        lbImg.src = vis[currentIndex].getAttribute("data-full");
      };

      masonry.addEventListener("click", function(e){
        var item = e.target.closest(".masonry-item");
        if(!item) return;
        e.preventDefault();
        openLightbox(visibleItems().indexOf(item));
      });
      lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
      lightbox.querySelector(".lightbox-prev").addEventListener("click", function(){ step(-1); });
      lightbox.querySelector(".lightbox-next").addEventListener("click", function(){ step(1); });
      lightbox.addEventListener("click", function(e){ if(e.target === lightbox) closeLightbox(); });
      document.addEventListener("keydown", function(e){
        if(!lightbox.classList.contains("is-open")) return;
        if(e.key === "Escape") closeLightbox();
        if(e.key === "ArrowLeft") step(-1);
        if(e.key === "ArrowRight") step(1);
      });
    }
  }

  document.addEventListener("gallery:rendered", function(){ initReveal(); });
})();
