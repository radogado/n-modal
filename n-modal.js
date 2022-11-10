var componentModal = (function() {
  /* Modal – start */
  //   // left: 37, up: 38, right: 39, down: 40,
  //   // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  //   var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
  // 
  //   function preventDefault(e) {
  //     e.preventDefault();
  //   }
  // 
  //   function preventDefaultForScrollKeys(e) {
  //     if (keys[e.keyCode]) {
  //       preventDefault(e);
  //       return false;
  //     }
  //   }
  // 
  //   // modern Chrome requires { passive: false } when adding event
  //   var supportsPassive = false;
  //   try {
  //     window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
  //       get: function() { supportsPassive = true; }
  //     }));
  //   } catch (e) {}
  // 
  //   var wheelOpt = supportsPassive ? { passive: false } : false;
  //   var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
  // 
  //   // call this to Disable
  //   function disableScrolling() {
  //     window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  //     window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  //     window.addEventListener('keydown', preventDefaultForScrollKeys, false);
  //   }
  // 
  //   // call this to Enable
  //   function enableScrolling() {
  //     window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
  //     window.removeEventListener('touchmove', preventDefault, wheelOpt);
  //     window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
  //   }
  // const isChrome = !!navigator.userAgent.match("Chrome");
  // const isSafari = navigator.userAgent.match(/Safari/) && !isChrome;
  var x = window.scrollX;
  var y = window.scrollY;
  var scroll_timeout;
  const blockScroll = e => {
    // console.log(e);
    // if (isSafari) {
    document.querySelectorAll('dialog.n-modal[open]').forEach(el => {
      el.classList.add('n-modal--transparent');
    });
    clearTimeout(scroll_timeout);
    scroll_timeout = setTimeout(() => {
      document.querySelectorAll('dialog.n-modal[open]').forEach(el => {
        el.classList.remove('n-modal--transparent');
      });
    }, 67);
    // } else {
    //   window.scrollTo(x, y);
    // }
  };

  function disableScrolling() {
    x = window.scrollX;
    y = window.scrollY;
    // window.onscroll = function() { window.scrollTo(x, y); };
    window.addEventListener('scroll', blockScroll, { 'passive': 'true' });
  }

  function enableScrolling() {
    // window.onscroll = function() {};
    window.removeEventListener('scroll', blockScroll);
  }
  // var previouslyFocused = previouslyFocused || false;
  function transferClass(origin, target, className) {
    let classes = typeof className === "string" ? new Array(className) : className;
    classes.forEach(el => {
      if (origin.classList.contains(el)) {
        target.classList.add(el);
      }
    });
  }
  const animation_duration = window.matchMedia("(prefers-reduced-motion: no-preference)").matches ? 200 : 0;
  let removeModal = e => {
    document.documentElement.classList.remove('transparent-scrollbar');
    let modal = e.target;
    modal.removeEventListener('close', removeModal);
    if (modal.existingDetachedElement) {
      // console.log(modal);
      if (!modal.existingModal) {
        let content = modal.querySelector('.n-modal__content');
        content.removeChild(content.firstElementChild);
      }
      delete modal.existingDetachedElement;
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
      enableScrolling();
      // nuiDisableBodyScroll(false, modal); // Turn off and restore page scroll
      if (modal.existingModal) {
        if (!modal.existingDetachedElement) {
          modal.removeEventListener('close', removeModal);
        }
        // delete modal.existingModal;
        delete modal.dataset.anim;
      }
      modal.close();
      // document.querySelector("html").classList.remove("no-scroll");
      // window.scrollTo(modal.previousScrollX, modal.previousScrollY);
    };
  }

  function openModal(options) {
    // options: {content: ""/element, animation: "", trigger: element, closeSymbol: "", closeLabel: ""}
    // content is either an HTML string or an element
    // options can be solely content if it's a string or element
    // Fix Chrome flashing disappearing scrollbars on open
    document.documentElement.style.overflow = 'scroll';
    const scrollbar_width = window.innerWidth - document.documentElement.offsetWidth;
    document.documentElement.style.overflow = '';
    if (!scrollbar_width) { // Because Chrome flashes disappearing scrollbars on open (Mac)
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
    const close_label = 'Close';
    const close_symbol = '╳';
    if (typeof content === 'object' && content.tagName === 'DIALOG') {
      if (!content.parentNode) { // Detached modal
        document.body.appendChild(content);
      }
      wrapper = content;
      wrapper.existingModal = true;
      let close_button = wrapper.querySelector('.n-modal__close');
      if (close_button) {
        close_button.dataset.closeSymbol = close_button.dataset.closeSymbol || close_symbol;
        close_button.ariaLabel = close_button.ariaLabel || close_label;
      }
    } else {
      wrapper = document.createElement("dialog");
      wrapper.insertAdjacentHTML("afterbegin", `<button class="n-modal__close" aria-label="${options.closeLabel || trigger?.dataset.closeLabel || close_label}" data-close-symbol="${options.closeSymbol || trigger?.dataset.closeSymbol || close_symbol}"></button><div class="n-modal__content"></div>`);
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
          if (content.classList.contains('n-modal__content')) {
            wrapper.lastChild.replaceWith(content);
            wrapper.attachedHiddenContent = true;
          } else {
            wrapper.dataset.existingAttachedContent = true;
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
    if (options.full) {
      wrapper.classList.add('n-modal--full');
    }
    wrapper.dataset.anim = animation;
    wrapper.classList.add("n-modal");
    wrapper.onclick = (e) => {
      let el = e.target.closest('.n-modal');
      let button = e.target.closest('.n-modal__close');
      if (button || (e.target.matches('.n-modal') && (e.offsetX < 0 || e.offsetY < 0 || (e.offsetX - 2) > el.getBoundingClientRect().width || (e.offsetY - 2) > el.getBoundingClientRect().height))) {
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
    // if (document.querySelectorAll(".n-modal").length === 1) {
    //   // Sole (first) modal
    //   wrapper.previousScrollX = window.scrollX;
    //   wrapper.previousScrollY = window.scrollY;
    // }
    // document.querySelector("html").classList.add("no-scroll");
    wrapper.animate(typeof animation === "string" ? JSON.parse(animation) : [{ transform: "translate3d(0,-100vh,0)" }, { transform: "translate3d(0,0,0)" }], {
      duration: animation_duration,
      easing: "ease-in-out",
    }).onfinish = () => {
      wrapper.addEventListener('close', removeModal);
      disableScrolling();
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
      fetch(link.split("#")[0]).then(response => response.text()).then(response => {
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
  let hash_modal = document.querySelector(`.n-modal${location.hash}.n-modal--uri`);
  if (location.hash && hash_modal) {
    openModal(hash_modal);
  }
  typeof registerComponent === "function" ? registerComponent("n-modal", init) : init(); // Is it a part of niui, or standalone?
  return { closeModal, openModal };
  /* Modal – end */
})();