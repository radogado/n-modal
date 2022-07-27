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
  // var previouslyFocused = previouslyFocused || false;
  function transferClass(origin, target, className) {
    let classes = typeof className === "string" ? new Array(className) : className;
    classes.forEach(el => {
      if (origin.classList.contains(el)) {
        target.classList.add(el);
      }
    });
  }
  //   const focusableElements = 'button, [href], input, select, textarea, details, summary, video, [tabindex]:not([tabindex="-1"])';
  //   const trapFocus = (modal) => {
  //     // FROM: https://uxdesign.cc/how-to-trap-focus-inside-modal-to-make-it-ada-compliant-6a50f9a70700
  //     // add all the elements inside modal which you want to make focusable
  //     const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
  //     const focusableContent = modal.querySelectorAll(focusableElements);
  //     const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal
  //     document.addEventListener("keydown", function(e) {
  //       let isTabPressed = e.key === "Tab" || e.keyCode === 9;
  //       if (!isTabPressed) {
  //         return;
  //       }
  //       if (e.shiftKey) {
  //         // if shift key pressed for shift + tab combination
  //         if (document.activeElement === firstFocusableElement) {
  //           lastFocusableElement.focus(); // add focus for the last focusable element
  //           e.preventDefault();
  //         }
  //       } else {
  //         // if tab key is pressed
  //         if (document.activeElement === lastFocusableElement) {
  //           // if focused has reached to last focusable element then focus first focusable element after pressing tab
  //           firstFocusableElement.focus(); // add focus for the first focusable element
  //           e.preventDefault();
  //         }
  //       }
  //     });
  //     firstFocusableElement.focus();
  //   };
  // 
  function closeByEsc(e) {
    if (e.keyCode === 27) {
      // Esc
      e.preventDefault();
      closeModal(e.target.closest('.n-modal'));
    }
  }
  var previousScrollX = 0;
  var previousScrollY = 0;
  const animation_duration = window.matchMedia("(prefers-reduced-motion: no-preference)").matches ? 200 : 0;

  function closeModal(modal) {
    window.scrollTo(previousScrollX, previousScrollY);
    document.querySelector("html").classList.remove("no-scroll");
    let direction_option = "normal";
    var animation = modal.querySelector(".n-modal__content > div").dataset.anim; // Custom animation?
    if (animation.length < 11) {
      // '', 'null' or 'undefined'?
      animation = '[{ "transform": "translate3d(0,0,0)" }, { "transform": "translate3d(0,-100%,0)" }]';
    } else {
      direction_option = "reverse";
    }
    modal.animate(JSON.parse(animation), { duration: animation_duration, direction: direction_option, easing: "ease-in-out" }).onfinish = () => {
      nuiDisableBodyScroll(false, modal); // Turn off and restore page scroll
      modal.close();
      modal.remove();
    };
  }

  function openModal(el, animation) {
    // el is an HTML string
    let modal_content = document.createElement("div");
    if (typeof el === "string") {
      modal_content.innerHTML = el;
    } else {
      modal_content.appendChild(el);
    }
    modal_content.dataset.anim = animation;
    var wrapper = document.createElement("dialog");
    wrapper.dataset.platform = navigator.platform;
    wrapper.classList.add("n-modal");
    wrapper.insertAdjacentHTML("beforeend", "<div class=n-modal__content></div><div class=n-modal__bg></div>");
    wrapper.firstChild.appendChild(modal_content);
    wrapper.insertAdjacentHTML("afterbegin", `<button class="n-modal__close" aria-label="Close"> ⨯ </button>`);
    wrapper.onclick = (e) => {
      let el = e.target.closest('.n-modal');
      let button = e.target.closest('.n-modal__close');
      if (button || (e.offsetX < 0 || e.offsetY < 0 || (e.offsetX - 2) > el.getBoundingClientRect().width || (e.offsetY - 2) > el.getBoundingClientRect().height)) {
        closeModal(el);
      }
    };
    wrapper.addEventListener("keydown", closeByEsc);
    document.body.appendChild(wrapper);
    wrapper.showModal();
    nuiDisableBodyScroll(true, wrapper); // Turn on and block page scroll
    if (document.querySelectorAll(".n-modal").length === 1) {
      // Sole (first) modal
      previousScrollX = window.scrollX;
      previousScrollY = window.scrollY;
    }
    document.querySelector("html").classList.add("no-scroll");
    if (wrapper.querySelector(".n-full-screen")) {
      if (wrapper.webkitRequestFullScreen) {
        wrapper.webkitRequestFullScreen();
      }
      if (wrapper.mozRequestFullScreen) {
        wrapper.mozRequestFullScreen();
      }
      if (wrapper.requestFullScreen) {
        wrapper.requestFullScreen();
      }
    } else {
      wrapper.animate(typeof animation === "string" ? JSON.parse(animation) : [{ transform: "translate3d(0,-100vh,0)" }, { transform: "translate3d(0,0,0)" }], {
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
        openModal(parsed, animation); // To do: If .modal[data-animation], pass it to openModal() as second parameter. Also in openLightbox().
        transferClass(el.closest(".n-modal-link"), document.querySelector(".n-modal"), ["n-modal--limited", "n-modal--full", "n-modal--rounded", "n-modal--shadow"]);
      } else {
        // Error
      }
    };
    request.onerror = () => {
      // Error
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
  return { closeModal, openModal };
  /* Modal – end */
})();
// To do: disable page scroll by arrow keys