/**
 * This is a function where type checking is disabled.
 * @suppress {misplacedTypeAnnotation}
 */
window.nuiDisableBodyScroll = (function() {
  // Thanks Thijs Huijssoon https://gist.github.com/thuijssoon
  /**
   * Private variables
   */
  var _selector = false,
    _element = false,
    _clientY;
  /**
   * Prevent default unless within _selector
   *
   * @param  event object event
   * @return void
   */
  var preventBodyScroll = (event) => {
    if (!_element || !event.target.closest || !_selector.contains(event.target)) {
      event.preventDefault();
    }
  };
  /**
   * Cache the clientY co-ordinates for
   * comparison
   *
   * @param  event object event
   * @return void
   */
  var captureClientY = (event) => {
    // only respond to a single touch
    if (event.targetTouches.length === 1) {
      _clientY = event.targetTouches[0].clientY;
    }
  };
  /**
   * Detect whether the element is at the top
   * or the bottom of their scroll and prevent
   * the user from scrolling beyond
   *
   * @param  event object event
   * @return void
   */
  var preventOverscroll = (event) => {
    // only respond to a single touch
    if (event.targetTouches.length !== 1) {
      return;
    }
    var clientY = event.targetTouches[0].clientY - _clientY;
    // The element at the top of its scroll,
    // and the user scrolls down
    if (_element.scrollTop === 0 && clientY > 0) {
      event.preventDefault();
    }
    // The element at the bottom of its scroll,
    // and the user scrolls up
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
    if (_element.scrollHeight - _element.scrollTop <= _element.clientHeight && clientY < 0) {
      event.preventDefault();
    }
  };
  /**
   * Disable body scroll. Scrolling with the selector is
   * allowed if a selector is provided.
   *
   * @param  boolean allow
   * @param  string selector Selector to element to change scroll permission
   * @return void
   */
  return function(allow, selector) {
    if (!!selector) {
      _selector = selector;
      _element = selector;
    }
    if (true === allow) {
      if (false !== _element) {
        _element.addEventListener("touchstart", captureClientY, { passive: false });
        _element.addEventListener("touchmove", preventOverscroll, { passive: false });
      }
      document.body.addEventListener("touchmove", preventBodyScroll, { passive: false });
    } else {
      if (false !== _element) {
        _element.removeEventListener("touchstart", captureClientY, { passive: false });
        _element.removeEventListener("touchmove", preventOverscroll, { passive: false });
      }
      document.body.removeEventListener("touchmove", preventBodyScroll, { passive: false });
    }
  };
})();
var componentModal = (function() {
  /* Modal – start */
  function transferClass(origin, target, className) {
    let classes = typeof className === "string" ? new Array(className) : className;
    classes.forEach(el => {
      if (origin.classList.contains(el)) {
        target.classList.add(el);
      }
    });
  }
  const focusableElements = 'button, [href], input, select, textarea, details, summary, video, [tabindex]:not([tabindex="-1"])';
  const trapFocus = (modal) => {
    // FROM: https://uxdesign.cc/how-to-trap-focus-inside-modal-to-make-it-ada-compliant-6a50f9a70700
    // add all the elements inside modal which you want to make focusable
    const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
    const focusableContent = modal.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal
    document.addEventListener("keydown", function(e) {
      let isTabPressed = e.key === "Tab" || e.keyCode === 9;
      if (!isTabPressed) {
        return;
      }
      if (e.shiftKey) {
        // if shift key pressed for shift + tab combination
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus(); // add focus for the last focusable element
          e.preventDefault();
        }
      } else {
        // if tab key is pressed
        if (document.activeElement === lastFocusableElement) {
          // if focused has reached to last focusable element then focus first focusable element after pressing tab
          firstFocusableElement.focus(); // add focus for the first focusable element
          e.preventDefault();
        }
      }
    });
    firstFocusableElement.focus();
  };

  function keyUpClose(e) {
    if ((e || window.event).keyCode === 27) {
      // Esc
      closeFullWindow();
    }
  }
  var previousScrollX = 0;
  var previousScrollY = 0;
  const animation_duration = window.matchMedia("(prefers-reduced-motion: no-preference)").matches ? 200 : 0;

  function closeFullWindow() {
    let full_window = document.querySelectorAll(".n-modal");
    full_window = full_window[full_window.length - 1];
    if (full_window) {
      window.scrollTo(previousScrollX, previousScrollY);
      let direction_option = "normal";
      var animation = full_window.querySelector(".n-modal__content > div").dataset.anim; // Custom animation?
      if (animation.length < 11) {
        // '', 'null' or 'undefined'?
        animation = '[{ "transform": "translate3d(0,0,0)" }, { "transform": "translate3d(0,-100%,0)" }]';
      } else {
        direction_option = "reverse";
      }
      full_window.animate(JSON.parse(animation), { duration: animation_duration, direction: direction_option, easing: "ease-in-out" }).onfinish = () => {
        nuiDisableBodyScroll(false, full_window.querySelector(".n-modal__content")); // Turn off and restore page scroll
        full_window.parentNode.removeChild(full_window);
        if (typeof full_window_content !== 'undefined') {
          full_window_content = null;
        }
        if (!document.querySelector(".n-modal")) {
          // A single overlay is gone, leaving no overlays on the page
          if (typeof arrow_keys_handler !== 'undefined') {
            window.removeEventListener("keydown", arrow_keys_handler); // To do: unglobal this and apply only to modal
          }
          window.removeEventListener("keyup", keyUpClose);
          document.querySelector("html").classList.remove("no-scroll");
        } else {
          nuiDisableBodyScroll(true, full_window.querySelector(".n-modal__content"));
        }
        if (typeof previouslyFocused !== 'undefined' && !!previouslyFocused) {
          previouslyFocused.focus();
        }
      };
    }
  }

  function openFullWindow(el, animation) {
    // el is an HTML string
    if (typeof previouslyFocused !== 'undefined') {
      previouslyFocused = document.activeElement;
    }
    if (typeof full_window_content === 'undefined') {
      var full_window_content = null;
    }
    full_window_content = document.createElement("div");
    if (typeof el === "string") {
      full_window_content.innerHTML = el;
    } else {
      full_window_content.appendChild(el);
    }
    full_window_content.dataset.anim = animation;
    var wrapper = document.createElement("div");
    wrapper.classList.add("n-modal");
    wrapper.insertAdjacentHTML("beforeend", "<div class=n-modal__content tabindex=0></div><div class=n-modal__bg></div>");
    wrapper.firstChild.appendChild(full_window_content);
    full_window_content = wrapper;
    full_window_content.insertAdjacentHTML("afterbegin", `<button class=n-modal__close> ← ${document.title}</button>`);
    full_window_content.onclick = (e) => {
      let modals = document.querySelectorAll(".n-modal");
      if (modals) {
        let modal = modals[modals.length - 1];
        if (e.target === modal || e.target.parentNode === modal) {
          closeFullWindow();
        }
      }
    };
    full_window_content.querySelector(".n-modal__close").addEventListener("touchmove",
      (e) => {
        e.preventDefault();
      }, { passive: false });
    full_window_content.querySelector(".n-modal__bg").addEventListener("touchmove",
      (e) => {
        e.preventDefault();
      }, { passive: false });
    window.addEventListener("keyup", keyUpClose);
    document.body.appendChild(full_window_content);
    trapFocus(full_window_content);
    let full_window_container = full_window_content.querySelector(".n-modal__content");
    full_window_container.focus();
    nuiDisableBodyScroll(true, full_window_container); // Turn on and block page scroll
    if (document.querySelectorAll(".n-modal").length === 1) {
      // Sole (first) modal
      document.querySelector("html").classList.add("no-scroll");
      previousScrollX = window.scrollX;
      previousScrollY = window.scrollY;
    }
    if (full_window_content.querySelector(".n-full-screen")) {
      if (full_window_content.webkitRequestFullScreen) {
        full_window_content.webkitRequestFullScreen();
      }
      if (full_window_content.mozRequestFullScreen) {
        full_window_content.mozRequestFullScreen();
      }
      if (full_window_content.requestFullScreen) {
        full_window_content.requestFullScreen();
      }
    } else {
      full_window_content.animate(typeof animation === "string" ? JSON.parse(animation) : [{ transform: "translate3d(0,-100%,0)" }, { transform: "translate3d(0,0,0)" }], {
        duration: animation_duration,
        easing: "ease-in-out",
      });
    }
    return false;
  }

  function parseHTML(str) {
    var tmp = document.implementation.createHTMLDocument("Parsed");
    tmp.body.innerHTML = str;
    // To do: destroy the HTMLDocument before returning
    return tmp.body;
  }

  function modalWindow(e) {
    // Modal window of external file content
    var el = e.target;
    var link = el.closest(".n-modal-link").href;
    var animation = el.closest(".n-modal-link").dataset.anim;
    var request = new XMLHttpRequest();
    request.open("GET", link.split("#")[0], true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        // Success
        if (!request.responseText) {
          closeFullWindow();
          window.open(link, "Modal");
          return false;
        }
        var parsed = parseHTML(request.responseText);
        var container = !!link.split("#")[1] ? "#" + link.split("#")[1] : 0;
        if (container && parsed.querySelector(container)) {
          parsed = parsed.querySelector(container).innerHTML;
        } else {
          parsed = parsed.innerHTML;
        }
        openFullWindow(parsed, animation); // To do: If .modal[data-animation], pass it to openFullWindow() as second parameter. Also in openLightbox().
        transferClass(el.closest(".n-modal-link"), document.querySelector(".n-modal"), ["n-modal--limited", "n-modal--full", "n-modal--rounded", "n-modal--shadow"]);
      } else {
        // Error
        closeFullWindow();
      }
    };
    request.onerror = () => {
      // Error
      closeFullWindow();
      window.open(link, "_blank");
    };
    request.send();
    return false;
  }
  let init = (host) => {
    // Modal window: open a link's target inside it
    host.querySelectorAll("a.n-modal-link[href]:not([data-ready])").forEach((el) => {
      if (el.href !== location.href.split("#")[0] + "#") {
        // Is it an empty anchor?
        el.onclick = modalWindow;
      }
      if (!el.getAttribute("rel")) {
        el.setAttribute("rel", "prefetch");
      }
      el.dataset.ready = true;
    });
  };
  typeof registerComponent === "function" ? registerComponent("n-modal", init) : init(document);
  return { closeFullWindow, openFullWindow };
  /* Modal – end */
})();
// To do: disable page scroll by arrow keys