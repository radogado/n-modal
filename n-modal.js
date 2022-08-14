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
  var previousScrollX = 0;
  var previousScrollY = 0;
  const animation_duration = window.matchMedia("(prefers-reduced-motion: no-preference)").matches ? 200 : 0;
  let removeModal = e => {
    let modal = e.target;
    modal.removeEventListener('close', removeModal);
    if (modal.existingDetachedElement) {
      // console.log(modal);
      let content = modal.querySelector('.n-modal__content');
      content.removeChild(content.firstElementChild);
      modal.remove();
    }
    if (modal.attachedHiddenContent) {
      modal.replaceWith(modal.lastChild);
    } else {
      if (modal.dataset.existingAttachedContent) {
        modal.replaceWith(modal.lastChild.firstElementChild);
      } else {
        if (modal.existingModal) {
          delete modal.existingModal;
          delete modal.dataset.anim;
        } else {
          modal.remove();
        }
      }
    }
  }

  function closeModal(modal) {
    let direction_option = "normal";
    var animation = modal.dataset.anim; // Custom animation?
    if (!animation || animation.length < 11) {
      // '', 'null' or 'undefined'?
      animation = '[{ "transform": "translate3d(0,0,0)" }, { "transform": "translate3d(0,-100%,0)" }]';
    } else {
      direction_option = "reverse";
    }
    modal.animate(JSON.parse(animation), { duration: animation_duration, direction: direction_option, easing: "ease-in-out" }).onfinish = () => {
      // nuiDisableBodyScroll(false, modal); // Turn off and restore page scroll
      if (modal.existingModal) {
        modal.removeEventListener('close', removeModal);
        delete modal.existingModal;
        delete modal.dataset.anim;
      }
      modal.close();
      document.querySelector("html").classList.remove("no-scroll");
      window.scrollTo(previousScrollX, previousScrollY);
    };
  }

  function openModal(options) {
    // options: {content: ""/element, animation: "", trigger: element, closeText: "", closeLabel: ""}
    // content is either an HTML string or an element
    // options can be solely content if it's a string or element

    // Fix Chrome flashing disappearing scrollbars on open
    document.documentElement.style.overflow = 'scroll';
    const scrollbar_width = window.innerWidth - document.documentElement.offsetWidth;
    document.documentElement.style.overflow = '';

    if (!scrollbar_width) {
      document.documentElement.classList.add('transparent-scrollbar');
    }

    if (typeof options === 'string' || !!options.tagName) {
      options = { content: options };
    }
    let animation = options.animation;
    let content = options.content;
    let trigger = options.trigger;
    var wrapper = {};

    var existingDetachedElement = false;

    if (content.parentNode) {
      // console.log(content.parentNode);
      if (content.parentNode.tagName === 'DIALOG' || content.parentNode.classList.contains('n-modal__content')) {
        return;
      }
    } else {
      if (content.tagName) {
        existingDetachedElement = true;
      }
    }

    if (typeof content === 'object' && content.tagName === 'DIALOG') {
      wrapper = content;
      wrapper.existingModal = true;
    } else {
      wrapper = document.createElement("dialog");
      wrapper.insertAdjacentHTML("afterbegin", `<button class="n-modal__close" aria-label="${options.closeLabel || trigger?.dataset.closeLabel || 'Close'}" data-close-text="${options.closeText || trigger?.dataset.closeText || '╳'}"></button><div class="n-modal__content"></div>`);
      let modal_content = document.createElement("div");
      if (typeof content === "string") {
        wrapper.lastChild.innerHTML = content;
        document.body.appendChild(wrapper);
      } else {
        let parent = content.parentElement;
        if (parent) {
          let marker = document.createElement('div');
          content.replaceWith(marker);
          wrapper.lastChild.appendChild(content);
          marker.replaceWith(wrapper);
          wrapper.dataset.existingAttachedContent = true;

          if (content.classList.contains('n-modal__content')) {
            wrapper.lastChild.replaceWith(content);
            wrapper.attachedHiddenContent = true;
          }

        } else {
          wrapper.lastChild.appendChild(content);
          document.body.appendChild(wrapper);
        }
      }

    }

    if (options.blur) {
      wrapper.classList.add('n-modal--blur');
    }
    if (options.shadow) {
      wrapper.classList.add('n-modal--shadow');
    }
    if (options.rounded) {
      wrapper.classList.add('n-modal--rounded');
    }

    wrapper.dataset.anim = animation;
    wrapper.classList.add("n-modal");
    wrapper.onclick = (e) => {
      let el = e.target.closest('.n-modal');
      let button = e.target.closest('.n-modal__close');
      if (button || (e.offsetX < 0 || e.offsetY < 0 || (e.offsetX - 2) > el.getBoundingClientRect().width || (e.offsetY - 2) > el.getBoundingClientRect().height)) {
        closeModal(el);
      }
    };
    wrapper.addEventListener("cancel", e => {
      e.preventDefault();
      closeModal(e.target.closest('.n-modal'));
    });

    if (existingDetachedElement) {
      wrapper.existingDetachedElement = true;
    }

    wrapper.showModal();
    // nuiDisableBodyScroll(true, wrapper); // Turn on and block page scroll
    if (document.querySelectorAll(".n-modal").length === 1) {
      // Sole (first) modal
      previousScrollX = window.scrollX;
      previousScrollY = window.scrollY;
    }
    document.querySelector("html").classList.add("no-scroll");
    wrapper.animate(typeof animation === "string" ? JSON.parse(animation) : [{ transform: "translate3d(0,-100vh,0)" }, { transform: "translate3d(0,0,0)" }], {
      duration: animation_duration,
      easing: "ease-in-out",
    }).onfinish = () => {
      wrapper.addEventListener('close', removeModal);
      document.documentElement.classList.remove('transparent-scrollbar');
    };
    return wrapper;
  }

  function parseHTML(str) {
    var tmp = document.implementation.createHTMLDocument("Parsed");
    tmp.body.innerHTML = str;
    // To do: destroy the HTMLDocument before returning
    return tmp.body;
  }

  function modalWindowLink(e) {
    // Modal window of external file content
    var el = e.target;
    let trigger = el.closest(".n-modal-link");
    var link = trigger.dataset.href || trigger.href; // data-href for <button>, href for <a>
    var animation = trigger.dataset.anim;
    const openTheModal = content => transferClass(trigger, openModal({ content: content, animation: animation, trigger: trigger }), ["n-modal--full", "n-modal--rounded", "n-modal--shadow", "n-modal--blur"]);

    if (trigger.dataset.for) {
      openTheModal(document.getElementById(trigger.dataset.for));
    } else {
      fetch(link.split("#")[0]).then(response => response.text())
        .then(response => {
          var parsed = parseHTML(response);
          var container = !!link.split("#")[1] ? "#" + link.split("#")[1] : 0;
          if (container && parsed.querySelector(container)) {
            parsed = parsed.querySelector(container).innerHTML;
          } else {
            parsed = parsed.innerHTML;
          }
          openTheModal(parsed);
        }).catch(error => {
          openTheModal(error);
        });
    }
    return false;
  }
  let init = (host = document) => {
    // Modal window: open a link's target inside it
    host.querySelectorAll(".n-modal-link:not([data-ready])").forEach((el) => {
      if (el.href !== location.href.split("#")[0] + "#") {
        // Is it an empty anchor?
        el.onclick = modalWindowLink;
      }
      if (el.href && !el.getAttribute("rel")) {
        el.setAttribute("rel", "prefetch");
      }
      el.dataset.ready = true;
    });


  };
  window.nui = typeof window.nui === 'undefined' ? {} : window.nui;
  nui.modal = openModal;
  nui.modal.init = init;
  typeof registerComponent === "function" ? registerComponent("n-modal", init) : init(); // Is it a part of niui, or standalone?
  return { closeModal, openModal };
  /* Modal – end */
})();