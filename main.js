/*
  Maik Gardens site script.
  There is no contact form and no backend. Contact is click-to-call only
  (tel: links). If the client wants a form later, that is a separate job.
*/
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  /* Current page nav state */
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".site-nav a[href]").forEach(function (a) {
    var target = (a.getAttribute("href") || "").split("#")[0].toLowerCase();
    if (target === here || (here === "" && target === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav(returnFocus) {
    if (!toggle || !nav) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) closeNav(true);
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeNav(false);
      }
    });
  }

  /* Smooth scroll for on-page anchors */
  if (!reduceMotion) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        var el = id ? document.getElementById(id) : null;
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
          if (nav) closeNav(false);
        }
      });
    });
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Lightbox (only active when the work page has gallery links) */
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery a[href]"));
  if (items.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML =
      '<button type="button" class="lb-btn lb-close" aria-label="Close photo">X</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">&lsaquo;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Next photo">&rsaquo;</button>';
    document.body.appendChild(box);

    var img = box.querySelector("img");
    var cap = box.querySelector("figcaption");
    var btns = box.querySelectorAll("button");
    var current = 0;
    var opener = null;

    var show = function (i) {
      current = (i + items.length) % items.length;
      var a = items[current];
      var thumb = a.querySelector("img");
      img.src = a.getAttribute("href");
      img.alt = thumb ? thumb.alt : "";
      cap.textContent = thumb ? thumb.alt : "";
    };
    var open = function (i, from) {
      opener = from;
      show(i);
      box.classList.add("open");
      box.querySelector(".lb-close").focus();
    };
    var close = function () {
      box.classList.remove("open");
      if (opener) opener.focus();
    };

    items.forEach(function (a, i) {
      a.addEventListener("click", function (e) { e.preventDefault(); open(i, a); });
    });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "Tab") {
        var first = btns[0], last = btns[btns.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
})();
