/**
 * Access gate — UDHR document; wax seal follows the cursor until stamped
 * on the golden circle. Skip also unlocks. Then reveals the main UNHRC site UI.
 */
(function () {
  var gate = document.getElementById("payment-gate");
  var siteApp = document.getElementById("site-app");
  if (!gate) return;

  var unlocked = false;
  var stamped = false;
  var timers = [];
  var onPointerMove = null;

  function clearTimers() {
    timers.forEach(function (id) {
      clearTimeout(id);
    });
    timers = [];
  }

  function stopCursorFollow() {
    if (onPointerMove) {
      window.removeEventListener("pointermove", onPointerMove);
      onPointerMove = null;
    }
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    clearTimers();
    stopCursorFollow();
    var msg = gate.querySelector("[data-pay-success]");
    if (msg) msg.hidden = false;
    timers.push(
      setTimeout(function () {
        gate.hidden = true;
        gate.setAttribute("aria-hidden", "true");
        document.body.classList.remove("payment-open");
        if (siteApp) {
          siteApp.hidden = false;
          siteApp.removeAttribute("aria-hidden");
        }
        window.scrollTo(0, 0);
      }, 1400)
    );
  }

  function stamp() {
    if (stamped || unlocked) return;
    stamped = true;
    stopCursorFollow();

    var btn = gate.querySelector("[data-seal-target]");
    var cursorSeal = gate.querySelector("[data-cursor-seal]");
    var stampSeal = gate.querySelector("[data-wax-seal]");
    var hint = gate.querySelector("[data-pay-hint]");
    var screen = gate.querySelector(".udhr-screen");

    if (screen) screen.classList.remove("is-cursor-seal");
    if (cursorSeal) {
      cursorSeal.hidden = true;
      cursorSeal.classList.remove("is-following", "is-visible");
    }
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-pressed", "true");
      btn.classList.add("is-stamped");
    }
    if (hint) hint.textContent = "Sealing the declaration…";

    if (stampSeal) {
      stampSeal.hidden = false;
      stampSeal.classList.remove("is-stamping");
      void stampSeal.offsetWidth;
      stampSeal.classList.add("is-stamping");
    }

    timers.push(
      setTimeout(function () {
        if (hint) hint.textContent = "Declaration sealed. Welcome.";
        unlock();
      }, 1600)
    );
  }

  function startCursorFollow(cursorSeal, screen) {
    stopCursorFollow();
    if (!cursorSeal || !screen) return;

    cursorSeal.hidden = false;
    cursorSeal.classList.add("is-following");
    screen.classList.add("is-cursor-seal");

    onPointerMove = function (e) {
      if (stamped || unlocked) return;
      cursorSeal.style.left = e.clientX + "px";
      cursorSeal.style.top = e.clientY + "px";
      cursorSeal.classList.add("is-visible");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  function render() {
    clearTimers();
    stopCursorFollow();
    stamped = false;

    gate.innerHTML =
      '<div class="gate-screen payment-screen udhr-screen" role="dialog" aria-labelledby="gate-title" aria-describedby="gate-desc">' +
      '<h2 id="gate-title">Delegate access</h2>' +
      '<p id="gate-desc" class="payment-desc">Affix the seal to the Universal Declaration of Human Rights.</p>' +
      '<div class="udhr-scene" data-scene>' +
      '<div class="udhr-frame">' +
      '<img class="udhr-doc" src="assets/gate/udhr.png?v=20260803e" alt="Universal Declaration of Human Rights" draggable="false">' +
      '<button type="button" class="udhr-seal-target" data-seal-target aria-label="Stamp the golden seal circle" aria-pressed="false"></button>' +
      '<img class="udhr-wax-seal" data-wax-seal src="assets/gate/wax-seal.png?v=20260803e" alt="" draggable="false" hidden>' +
      "</div>" +
      "</div>" +
      '<p class="payment-hint" data-pay-hint>Click the golden circle to stamp the seal</p>' +
      '<p class="payment-success" data-pay-success hidden>Sealed. Welcome to UNHRC.</p>' +
      '<button type="button" class="payment-skip" data-skip>Skip — enter without stamping</button>' +
      '<img class="udhr-cursor-seal" data-cursor-seal src="assets/gate/wax-seal.png?v=20260803e" alt="" draggable="false" hidden>' +
      "</div>";

    var cursorSeal = gate.querySelector("[data-cursor-seal]");
    var screen = gate.querySelector(".udhr-screen");
    startCursorFollow(cursorSeal, screen);

    gate.querySelector("[data-seal-target]").addEventListener("click", stamp);
    gate.querySelector("[data-skip]").addEventListener("click", function () {
      clearTimers();
      unlock();
    });
  }

  window.addEventListener("unhrc:show-payment", function () {
    if (!unlocked) render();
  });
})();
