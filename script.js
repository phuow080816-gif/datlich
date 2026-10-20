
(() => {
  "use strict";

  // =========================
  // CẤU HÌNH EMAILJS
  // =========================

  const EMAILJS_PUBLIC_KEY = "uwWK4J53DW4Ig5pu4";
  const EMAILJS_SERVICE_ID = "service_ug836uw";
  const EMAILJS_TEMPLATE_ID = "template_slzrz0q";

  if (typeof emailjs !== "undefined") {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY,
      limitRate: {
        id: "date-invitation",
        throttle: 10000
      }
    });
  }

  // =========================
  // LẤY CÁC PHẦN TỬ HTML
  // =========================


  const screens = {
    intro: document.getElementById("introScreen"),
    question: document.getElementById("questionScreen"),
    plan: document.getElementById("planScreen"),
    complete: document.getElementById("completeScreen")
  };

  const openHeart = document.getElementById("openHeart");
  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");
  const answerButtons = document.getElementById("answerButtons");
  const teaseMessage = document.getElementById("teaseMessage");

  const dateForm = document.getElementById("dateForm");
  const dateInput = document.getElementById("dateInput");
  const timeInput = document.getElementById("timeInput");

  const placeGrid = document.getElementById("placeGrid");
  const customPlaceField = document.getElementById("customPlaceField");
  const customPlaceInput = document.getElementById("customPlaceInput");
  const charCount = document.getElementById("charCount");

  const formMessage = document.getElementById("formMessage");
  const confirmButton = document.getElementById("confirmButton");
  const backToPlans = document.getElementById("backToPlans");

  const bubbleLayer = document.getElementById("bubbleLayer");
  const toastHearts = document.getElementById("toastHearts");

  // =========================
  // DỮ LIỆU TRONG BỘ NHỚ
  // =========================

  const placeNames = {
    cafe: "☕ Đi uống cafe — Uống nước, ăn bánh và tâm sự.",
    movie: "🍽️ Đi ăn và đi lượn — còn nhiều món lắm ó!!",
    ocean: "💤 Đi ngủ — Tbox nhé!"
  };

  const noMessages = [
    "Hehe, đố bấm được đấy! ♡",
    "Ô cố lên xem nào!",
    "Hẹn hò với tớ đi mòo 💗",
    "Ơ kìa, chọn lại đi mà TT",
    "Đừngggg cát chi ma✨",
    "Chọn có diiii🥺",
    "Năn nỉ óooo"
  ];

  let selectedPlace = "";
  let isSubmitting = false;
  let noMessageIndex = 0;
  let bubbleTimer = null;

  // =========================
  // CHUYỂN MÀN HÌNH
  // =========================

  function showScreen(name) {
    Object.entries(screens).forEach(([key, screen]) => {
      const active = key === name;

      screen.classList.toggle("active", active);
      screen.setAttribute("aria-hidden", String(!active));
    });

    window.scrollTo({
      top: 0,
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches ? "auto" : "smooth"
    });
  }

  // =========================
  // NGÀY HIỆN TẠI
  // =========================

  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function setDateMinimum() {
  dateInput.min = "2026-10-21";
  dateInput.max = "2026-10-31";
}

  // =========================
  // HIỆU ỨNG BONG BÓNG
  // =========================

  function makeBubble() {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bubble = document.createElement("span");

    bubble.className = "bubble";

    const size = 7 + Math.random() * 17;
    const duration = 7 + Math.random() * 7;
    const drift = Math.round(Math.random() * 100 - 50);

    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.setProperty("--size", `${size}px`);
    bubble.style.setProperty("--duration", `${duration}s`);
    bubble.style.setProperty("--drift", `${drift}px`);

    bubbleLayer.appendChild(bubble);

    bubble.addEventListener(
      "animationend",
      () => bubble.remove(),
      { once: true }
    );
  }

  // =========================
  // HIỆU ỨNG TRÁI TIM BAY
  // =========================

  function floatHearts(amount = 12) {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    for (let i = 0; i < amount; i++) {
      window.setTimeout(() => {
        const heart = document.createElement("span");

        heart.className = "float-heart";
        heart.textContent = Math.random() > 0.35 ? "♥" : "♡";

        heart.style.left = `${8 + Math.random() * 84}%`;

        heart.style.setProperty(
          "--size",
          `${14 + Math.random() * 22}px`
        );

        heart.style.setProperty(
          "--duration",
          `${1.8 + Math.random() * 1.6}s`
        );

        heart.style.setProperty(
          "--drift",
          `${Math.round(Math.random() * 100 - 50)}px`
        );

        toastHearts.appendChild(heart);

        heart.addEventListener(
          "animationend",
          () => heart.remove(),
          { once: true }
        );
      }, i * 85);
    }
  }

  // =========================
  // MÀN HÌNH MỞ ĐẦU
  // =========================

  function openInvitation() {
    openHeart.disabled = true;

    floatHearts(15);

    window.setTimeout(() => {
      showScreen("question");
      openHeart.disabled = false;
    }, 260);
  }

  openHeart.addEventListener("click", openInvitation);

  // =========================
  // NÚT NO NÉ TRÁNH
  // =========================

  function moveNoButton() {
    const card = document.querySelector(".question-card");

    const yesRect = yesButton.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const message = noMessages[
      noMessageIndex % noMessages.length
    ];

    teaseMessage.textContent = message;
    noMessageIndex++;

    // Đưa nút NO ra khỏi luồng bố cục để di chuyển trong card.
    noButton.style.position = "absolute";
    noButton.style.zIndex = "3";

    // Tính tọa độ dựa trên card, không phải toàn bộ trang.
    const padding = 14;

    const buttonWidth = noButton.offsetWidth;
    const buttonHeight = noButton.offsetHeight;

    const maxX = Math.max(
      padding,
      card.clientWidth - buttonWidth - padding
    );

    const maxY = Math.max(
      100,
      card.clientHeight - buttonHeight - padding
    );

    const yesLeft = yesRect.left - cardRect.left;
    const yesTop = yesRect.top - cardRect.top;

    let x = padding;
    let y = Math.min(140, maxY);

    // Thử một số vị trí để nút NO không che nút YES.
    for (let attempt = 0; attempt < 20; attempt++) {
      x = padding + Math.random() * Math.max(0, maxX - padding);
      y = 85 + Math.random() * Math.max(0, maxY - 85);

      const overlapsYes = !(
        x + buttonWidth < yesLeft - 12 ||
        x > yesLeft + yesRect.width + 12 ||
        y + buttonHeight < yesTop - 12 ||
        y > yesTop + yesRect.height + 12
      );

      if (!overlapsYes) {
        break;
      }
    }

    noButton.style.left = `${x}px`;
    noButton.style.top = `${y}px`;

    const rotation = Math.random() * 10 - 5;

    noButton.style.transform = `rotate(${rotation}deg)`;
  }

  // Máy tính: di chuyển khi con trỏ tiến đến gần.
  noButton.addEventListener("pointerenter", moveNoButton);

  // Điện thoại: di chuyển ngay khi người dùng chạm.
  noButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    moveNoButton();
  });

  // Dự phòng cho thao tác click bằng bàn phím.
  noButton.addEventListener("click", (event) => {
    event.preventDefault();
    moveNoButton();
  });

  // =========================
  // NÚT YES
  // =========================

  yesButton.addEventListener("click", () => {
    setDateMinimum();
    showScreen("plan");
    floatHearts(8);
  });

  // =========================
  // CHỌN ĐỊA ĐIỂM
  // =========================

  function selectPlace(place) {
    selectedPlace = place;

    document.querySelectorAll(".place-option").forEach((button) => {
      const selected = button.dataset.place === place;

      button.setAttribute("aria-pressed", String(selected));
    });

    // Chỉ hiện ô nhập riêng khi chọn Your Idea.
    customPlaceField.hidden = place !== "idea";

    clearFormMessage();

    if (place === "idea") {
      customPlaceInput.focus({ preventScroll: true });
    }
  }

  placeGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".place-option");

    if (!button) {
      return;
    }

    selectPlace(button.dataset.place);
  });

  // =========================
  // Ô NHẬP ĐỊA ĐIỂM RIÊNG
  // =========================

  customPlaceInput.addEventListener("input", () => {
    // Giới hạn độ dài ngay khi người dùng nhập.
    if (customPlaceInput.value.length > 180) {
      customPlaceInput.value =
        customPlaceInput.value.slice(0, 180);
    }

    charCount.textContent =
      `${customPlaceInput.value.length}/180`;

    clearFormMessage();
  });

  // =========================
  // THÔNG BÁO TRÊN GIAO DIỆN
  // =========================

  function clearFormMessage() {
    formMessage.textContent = "";
    formMessage.classList.remove("success");
  }

  function showValidation(message) {
    formMessage.textContent = message;
    formMessage.classList.remove("success");
  }

  dateInput.addEventListener("change", () => {
  const selectedDate = dateInput.value;

  clearFormMessage();

  if (!selectedDate) return;

  if (
    selectedDate < "2026-10-21" ||
    selectedDate > "2026-10-31"
  ) {
    dateInput.value = "";

    showValidation(
      "Chỉ được chọn từ 21/10 đến 31/10/2026 nha"
    );

    return;
  }

  if (selectedDate >= "2026-10-27") {
    dateInput.value = "";

    showValidation(
      "Vì lịch quá xa, hệ thống không cho chọn. Hãy chọn lịch gần nhất nhé!"
    );

    return;
  }
});
  timeInput.addEventListener("change", clearFormMessage);

  // =========================
  // LẤY ĐỊA ĐIỂM ĐÃ CHỌN
  // =========================

  function getChosenPlace() {
    if (selectedPlace === "idea") {
      return customPlaceInput.value.trim();
    }

    return placeNames[selectedPlace] || "";
  }

  // =========================
  // KIỂM TRA BIỂU MẪU
  // =========================

  function validateForm() {
    setDateMinimum();

    if (
  dateInput.value < "2026-10-21" ||
  dateInput.value > "2026-10-31"
) {
  showValidation(
    "Chỉ được chọn từ 21/10 đến 31/10/2026 nha"
  );

  dateInput.focus();
  return false;
}

if (dateInput.value >= "2026-10-27") {
  showValidation(
    "Vì lịch quá xa, hệ thống không cho chọn. Hãy thử lại nhé!"
  );

  dateInput.value = "";
  dateInput.focus();
  return false;
}

    // So sánh theo ngày địa phương để tránh sai lệch múi giờ.
    if (dateInput.value < localDateString()) {
      showValidation(
        "Ngày hẹn không thể nằm trong quá khứ đâu nè 💗"
      );

      dateInput.focus();
      return false;
    }

    if (!timeInput.value) {
      showValidation("Mình hẹn nhau lúc mấy giờ nhỉ? 🕒");
      timeInput.focus();
      return false;
    }

    if (!selectedPlace) {
      showValidation(
        "Chọn một địa điểm cho buổi hẹn nhé 💌"
      );

      placeGrid.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      return false;
    }

    if (
      selectedPlace === "idea" &&
      !customPlaceInput.value.trim()
    ) {
      showValidation(
        "Bật mí địa điểm em thích cho tớ nha ♡"
      );

      customPlaceInput.focus();
      return false;
    }

    if (
      selectedPlace === "idea" &&
      customPlaceInput.value.trim().length > 180
    ) {
      showValidation(
        "Địa điểm chỉ được tối đa 180 ký tự nha."
      );

      customPlaceInput.focus();
      return false;
    }

    return true;
  }

  // =========================
  // ĐỊNH DẠNG NGÀY VÀ GIỜ
  // =========================

  function formatDate(value) {
    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  }

  function formatTime(value) {
    const [hours, minutes] = value.split(":");

    return `${hours}:${minutes}`;
  }

  // =========================
  // MÀN HÌNH HOÀN TẤT
  // =========================

  function completeDate() {
    const place = getChosenPlace();

    document.getElementById("summaryDate").textContent =
      formatDate(dateInput.value);

    document.getElementById("summaryTime").textContent =
      formatTime(timeInput.value);

    document.getElementById("summaryPlace").textContent =
      place;

    showScreen("complete");

    floatHearts(22);
  }

  // =========================
  
  // =========================
  // XÁC NHẬN VÀ GỬI LỊCH QUA EMAIL
  // =========================

  dateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Kiểm tra thư viện và cấu hình trước khi gửi.
    if (
      typeof emailjs === "undefined" ||
      !EMAILJS_PUBLIC_KEY ||
      EMAILJS_PUBLIC_KEY === "DAN_PUBLIC_KEY_VAO_DAY" ||
      !EMAILJS_SERVICE_ID ||
      EMAILJS_SERVICE_ID === "DAN_SERVICE_ID_VAO_DAY" ||
      !EMAILJS_TEMPLATE_ID ||
      EMAILJS_TEMPLATE_ID === "DAN_TEMPLATE_ID_VAO_DAY"
    ) {
      showValidation(
        "Email chưa được cấu hình xong. Bạn kiểm tra lại nhé 💌"
      );
      return;
    }

    isSubmitting = true;
    confirmButton.disabled = true;
    confirmButton.classList.add("loading");

    confirmButton.querySelector(".button-label").textContent =
      "Đang gửi lịch hẹn... 💌";

    clearFormMessage();

    try {
      const appointment = {
        date: formatDate(dateInput.value),
        time: formatTime(timeInput.value),
        place: getChosenPlace(),
        note: "Không có ghi chú"
      };

      // Gửi email bằng EmailJS.
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        appointment
      );

      // Chỉ hiện phiếu xác nhận sau khi gửi thành công.
      completeDate();

    } catch (error) {
      console.error("Không gửi được email:", error);

      showValidation(
        "Ôi, chưa gửi được lịch hẹn 🥺 " +
        "Bạn kiểm tra kết nối mạng rồi thử lại nhé!"
      );

    } finally {
      isSubmitting = false;
      confirmButton.disabled = false;
      confirmButton.classList.remove("loading");

      confirmButton.querySelector(".button-label").textContent =
        "Xác nhận buổi hẹn của chúng ta! 💗";
    }
  });

  // =========================
  // QUAY LẠI CHỈNH SỬA
  // =========================

  backToPlans.addEventListener("click", () => {
    showScreen("plan");

    formMessage.textContent =
      "Em có thể sửa lịch ở đây ♡";

    formMessage.classList.add("success");
  });

  // =========================
  // KHỞI TẠO WEBSITE
  // =========================

  setDateMinimum();

  // Tạo bong bóng liên tục nếu người dùng không bật giảm chuyển động.
  if (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    bubbleTimer = window.setInterval(makeBubble, 850);

    for (let i = 0; i < 8; i++) {
      window.setTimeout(makeBubble, i * 180);
    }
  }

  // Dọn bộ đếm khi rời khỏi trang.
  window.addEventListener("pagehide", () => {
    if (bubbleTimer) {
      window.clearInterval(bubbleTimer);
    }
  });

  /*
    Không sử dụng localStorage hoặc sessionStorage.
    Tải lại trang sẽ bắt đầu từ màn hình đầu tiên.
  */
})();