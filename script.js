// 1️⃣ Firebase import ve initialize
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js";

// Firebase Web App config (senin verdiğin)
const firebaseConfig = {
  apiKey: "AIzaSyCNKVzX7zhjE3apEa76OQ3DszALj263BG4",
  authDomain: "todolistapp-7bf29.firebaseapp.com",
  projectId: "todolistapp-7bf29",
  storageBucket: "todolistapp-7bf29.firebasestorage.app",
  messagingSenderId: "876045465989",
  appId: "1:876045465989:web:a53f4dd30a6867e96f6cec",
};

// Firebase’i başlat
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Bildirim izni iste ve token al
Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    getToken(messaging, { vapidKey: "BGaIqWWI7NWxhc1ZejkIshmals6Cj6hKUEs26XwdTjq8VIOhIceNkn1-OjwCiQeKDuM_7HaZ9Cauf9pRIwBe328" })
      .then((currentToken) => {
        if (currentToken) {
          console.log("Device token:", currentToken);
          // Token'ı localStorage'a kaydet
          localStorage.setItem('firebaseToken', currentToken);
          console.log("✅ Firebase token kaydedildi!");
        } else {
          console.log("Token alınamadı!");
        }
      })
      .catch((err) => {
        console.log("Token alma hatası:", err);
      });
  }
});

// Uygulama açıkken gelen bildirimleri yakala
onMessage(messaging, (payload) => {
  console.log("Bildirim alındı:", payload);
});
// Service Worker kayıt sistemi
if ('serviceWorker' in navigator) {
  // Firebase messaging service worker'ı kaydet
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => {
      console.log('Firebase Service Worker kayıt başarılı:', registration);
      
      // Ana service worker'ı da kaydet
      return navigator.serviceWorker.register('/service-worker.js');
    })
    .then(registration => {
      console.log('Ana Service Worker kayıt başarılı:', registration);
    })
    .catch(error => {
      console.log('Service Worker kayıt hatası:', error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const newTaskBtn = document.getElementById("newTaskBtn");
  const taskModal = document.getElementById("taskModal");
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const closeTaskModal = document.querySelector(".close");
  const detailModal = document.getElementById("detailModal");
  const closeDetailBtn = document.getElementById("closeDetailBtn");
  const addTodoBtn = document.getElementById("addTodoBtn");
  const newTodoInput = document.getElementById("newTodo");
  const closeDetailSpan = document.querySelector(".closeDetail");
  const todoListInModal = document.getElementById("todoList");
  // Ses dosyası olmadan da çalışacak alarm sistemi
  let audio = null;

  // Ses sistemi oluşturma fonksiyonu
  function createAudioSystem() {
    try {
      // Mobil cihazlarda daha iyi çalışır
      if ("AudioContext" in window || "webkitAudioContext" in window) {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

        audio = {
          play: () => {
            try {
              oscillator.start();
              setTimeout(() => oscillator.stop(), 500);
            } catch (e) {
              console.log("Ses çalma hatası:", e);
            }
          },
        };

        console.log("✅ Ses sistemi hazırlandı");
        return true;
      }
    } catch (e) {
      console.log("❌ Ses sistemi oluşturulamadı");
    }
    return false;
  }

  // Kullanıcı etkileşimi sonrasında ses sistemi oluştur
  document.addEventListener("click", () => {
    if (!audio) {
      createAudioSystem();
    }
  });

  const confirmModal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmYesBtn = document.getElementById("confirmDeleteBtn");
  const confirmCancelBtn = document.getElementById("confirmCancelBtn");

  // Yeni eklenen düzenleme modalı ve elemanları
  const editTaskModal = document.getElementById("editTaskModal");
  const closeEditModal = document.querySelector(".closeEdit");
  const editTaskForm = document.getElementById("editTaskForm");
  const editCustomerInput = document.getElementById("editCustomer");
  const editProjectInput = document.getElementById("editProject");
  const editPriorityInput = document.getElementById("editPriority");
  const editDeadlineInput = document.getElementById("editDeadline");
  const editAlarmTimeInput = document.getElementById("editAlarmTime");
  const editPriceInput = document.getElementById("editPrice");
  let currentEditIndex = null;

  // DOM elementlerinin yüklenip yüklenmediğini kontrol et
  console.log("DOM elementleri kontrol ediliyor:");
  console.log("editTaskModal:", editTaskModal);
  console.log("closeEditModal:", closeEditModal);
  console.log("editTaskForm:", editTaskForm);
  console.log("editCustomerInput:", editCustomerInput);
  console.log("editProjectInput:", editProjectInput);
  console.log("editPriorityInput:", editPriorityInput);
  console.log("editDeadlineInput:", editDeadlineInput);
  console.log("editAlarmTimeInput:", editAlarmTimeInput);
  console.log("editPriceInput:", editPriceInput);

  let customers = [];
  let currentTaskCard = null;

  // Kullanıcı etkileşimini takip et (titreşim için)
  window.userHasInteracted = false;

  // Kullanıcı etkileşimi olduğunda flag'i true yap
  document.addEventListener("click", () => {
    window.userHasInteracted = true;
  });

  document.addEventListener("touchstart", () => {
    window.userHasInteracted = true;
  });

  document.addEventListener("keydown", () => {
    window.userHasInteracted = true;
  });

  loadCustomers();

  // Service Worker zaten yukarıda kaydedildi

  // PWA Install Prompt
  let deferredPrompt;
  const installPWAButton = document.getElementById("installPWA");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPWAButton.style.display = "block";

    installPWAButton.addEventListener("click", () => {
      installPWAButton.style.display = "none";
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("✅ PWA başarıyla yüklendi!");
        } else {
          console.log("❌ PWA yükleme iptal edildi");
        }
        deferredPrompt = null;
      });
    });
  });

  // PWA zaten yüklüyse
  if (window.matchMedia("(display-mode: standalone)").matches) {
    console.log("✅ PWA zaten yüklü!");
    installPWAButton.style.display = "none";
  }

  // Bildirim izni iste ve mobil cihazlarda da çalışsın
  if ("Notification" in window) {
    console.log("Bildirim durumu:", Notification.permission);

    if (Notification.permission === "default") {
      // Hemen bildirim izni iste
      console.log("Bildirim izni isteniyor...");
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("✅ Bildirim izni verildi!");
          showWelcomeNotification();
        } else {
          console.log("❌ Bildirim izni reddedildi");
          // Kullanıcıya tekrar sor
          setTimeout(() => {
            if (
              confirm(
                "Alarm sistemi için bildirim izni gerekli! Tekrar denemek ister misiniz?"
              )
            ) {
              Notification.requestPermission();
            }
          }, 1000);
        }
      });
    } else if (Notification.permission === "granted") {
      console.log("✅ Bildirim izni zaten verilmiş");
      showWelcomeNotification();
    } else if (Notification.permission === "denied") {
      console.log("❌ Bildirim izni reddedilmiş");
      // Reddedilmişse tekrar iste
      setTimeout(() => {
        if (
          confirm(
            "Alarm sistemi için bildirim izni gerekli! Tarayıcı ayarlarından izin vermeniz gerekiyor. Tekrar denemek ister misiniz?"
          )
        ) {
          // Tarayıcı ayarlarını aç
          if (confirm("Tarayıcı ayarlarını açmak ister misiniz?")) {
            // Chrome için
            if (navigator.userAgent.includes("Chrome")) {
              alert(
                "Chrome ayarları → Gizlilik ve güvenlik → Site ayarları → Bildirimler → Bu site için izin ver"
              );
            }
          }
          // Tekrar izin iste
          Notification.requestPermission();
        }
      }, 2000);
    }
  }

  function showWelcomeNotification() {
    if (Notification.permission === "granted") {
      const notification = new Notification("Görev Takibi Başlatıldı!", {
        body: "Artık görev hatırlatıcılarını alacaksınız! 📱",
        icon: "/favicon.ico",
        requireInteraction: false,
      });

      setTimeout(() => notification.close(), 3000);
    }
  }

  // Mobil cihazlar için hem click hem touch event'leri ekle
  newTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Yeni görev butonuna tıklandı");
    taskModal.style.display = "block";
  });
  
  // Touch event'i de ekle
  newTaskBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    console.log("Yeni görev butonuna dokunuldu");
    taskModal.style.display = "block";
  });
  // Modal kapatma butonları için mobil optimizasyon
  closeTaskModal.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Modal kapatma butonuna tıklandı");
    taskModal.style.display = "none";
  });
  
  closeTaskModal.addEventListener("touchstart", (e) => {
    e.preventDefault();
    console.log("Modal kapatma butonuna dokunuldu");
    taskModal.style.display = "none";
  });

  // Düzenleme modalı kapatma butonu dinleyicisi
  if (closeEditModal) {
    closeEditModal.addEventListener("click", () => {
      editTaskModal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target == taskModal) {
      taskModal.style.display = "none";
    }
    if (event.target == detailModal) {
      detailModal.style.display = "none";
    }
    if (event.target == confirmModal) {
      confirmModal.style.display = "none";
    }
    // Düzenleme modalını da kapatacak dinleyici
    if (event.target == editTaskModal) {
      editTaskModal.style.display = "none";
    }
  });

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Form submit edildi");
    
    const customerName = document.getElementById("customer").value;
    const projectType = document.getElementById("project").value;
    const priority = document.getElementById("priority").value;
    const deadline = document.getElementById("deadline").value;
    const price = document.getElementById("price").value;
    const alarmTime = document.getElementById("alarmTime").value;

    console.log("Form değerleri:", { customerName, projectType, priority, deadline, price, alarmTime });

    if (!projectType || !priority) {
      alert("Lütfen proje türü ve aciliyet seçiniz.");
      return;
    }

    const newCustomer = {
      name: customerName,
      project: projectType,
      priority: priority,
      deadline: deadline,
      price: price,
      todos: [],
      alarmTime: alarmTime,
    };
    customers.push(newCustomer);
    saveCustomers();
    renderCustomers();
    taskModal.style.display = "none";
    taskForm.reset();

    document.querySelectorAll(".custom-select-trigger").forEach((trigger) => {
      if (trigger.dataset.type === "project") {
        trigger.textContent = "Proje Türü Seçin";
        document.getElementById("project").value = "";
      } else if (trigger.dataset.type === "priority") {
        trigger.textContent = "Aciliyet";
        document.getElementById("priority").value = "";
      }
    });
  });

  // Yeni eklenen düzenleme formunun submit olayı
  editTaskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const customer = customers[currentEditIndex];
    customer.name = editCustomerInput.value;
    customer.project = editProjectInput.value;
    customer.priority = editPriorityInput.value;
    customer.deadline = editDeadlineInput.value;
    customer.alarmTime = editAlarmTimeInput.value;
    customer.price = editPriceInput.value;

    saveCustomers();
    renderCustomers();
    editTaskModal.style.display = "none";
  });

  function renderCustomers() {
    taskList.innerHTML = "";
    customers.forEach((customer, index) => {
      const taskCard = createTaskCardElement(customer, index);
      taskList.appendChild(taskCard);
      setTaskAlarm(customer);
    });
  }

  function createTaskCardElement(customer, index) {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    taskCard.dataset.index = index;
    let priorityClass = "";
    if (customer.priority === "Yüksek") priorityClass = "priority-high";
    else if (customer.priority === "Orta") priorityClass = "priority-medium";
    else if (customer.priority === "Düşük") priorityClass = "priority-low";

    const alarmDisplay = customer.alarmTime
      ? `<p>Alarm: <span>${new Date(customer.alarmTime).toLocaleString(
          "tr-TR",
          { dateStyle: "short", timeStyle: "short" }
        )}</span></p>`
      : "";

    // "Düzenle" butonu eklenmiş hali
    taskCard.innerHTML = `
            <div class="task-card-header">
                <h3 class="editable customer-name">${customer.name}</h3>
                <div>
                    <button class="edit-task-btn">Düzenle</button>
                    <button class="delete-task-btn">Görevi sil</button>
                </div>
            </div>
            <p>Proje: <span class="editable project-type">${customer.project}</span></p>
            <p>Aciliyet: <span class="editable priority ${priorityClass}">${customer.priority}</span></p>
            <p>Son Teslim Tarihi: <span class="editable deadline">${customer.deadline}</span></p>
            ${alarmDisplay}
            <p>Fiyat: <span class="editable price">${customer.price}</span></p>
            <ul class="todo-list"></ul>
        `;

    taskCard.querySelectorAll(".editable").forEach((span) => {
      span.addEventListener("click", () => {
        const existingValue = span.textContent;
        const fieldName = span.classList.contains("customer-name")
          ? "name"
          : span.classList.contains("project-type")
          ? "project"
          : span.classList.contains("priority")
          ? "priority"
          : span.classList.contains("deadline")
          ? "deadline"
          : "price";

        span.style.display = "none";

        let editInput;
        if (fieldName === "priority") {
          editInput = document.createElement("select");
          editInput.classList.add("edit-todo-input");
          ["Yüksek", "Orta", "Düşük"].forEach((p) => {
            const option = document.createElement("option");
            option.value = p;
            option.textContent = p;
            if (p === existingValue) option.selected = true;
            editInput.appendChild(option);
          });
        } else if (fieldName === "deadline") {
          editInput = document.createElement("input");
          editInput.type = "date";
          editInput.value = existingValue;
          editInput.classList.add("edit-todo-input");
        } else if (fieldName === "price") {
          editInput = document.createElement("input");
          editInput.type = "number";
          editInput.value = existingValue;
          editInput.classList.add("edit-todo-input");
        } else {
          editInput = document.createElement("input");
          editInput.type = "text";
          editInput.value = existingValue;
          editInput.classList.add("edit-todo-input");
        }

        span.parentNode.insertBefore(editInput, span);
        editInput.focus();

        const saveEdit = () => {
          const newValue = editInput.value.trim();
          if (newValue) {
            customers[index][fieldName] = newValue;
            saveCustomers();
            renderCustomers();
          }
          editInput.remove();
          span.style.display = "block";
        };

        editInput.addEventListener("blur", saveEdit);
        editInput.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            saveEdit();
          }
        });
      });
    });

    const todoListInCard = taskCard.querySelector(".todo-list");
    customer.todos.forEach((todo, todoIndex) => {
      const todoItem = createTodoItemElement(todo, index, todoIndex, "card");
      todoListInCard.appendChild(todoItem);
    });

    // "Düzenle" butonu için olay dinleyicisi - Event delegation kullanarak
    const editTaskBtn = taskCard.querySelector(".edit-task-btn");
    if (editTaskBtn) {
      editTaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log("Düzenle butonuna tıklandı, index:", index);
        try {
          openEditModal(index);
        } catch (error) {
          console.error("Düzenle butonu hatası:", error);
        }
      });
    } else {
      console.error("Düzenle butonu bulunamadı!");
    }

    const deleteTaskBtn = taskCard.querySelector(".delete-task-btn");
    deleteTaskBtn.addEventListener("click", () => {
      showConfirmModal(
        "Bu görevi silmek istediğinizden emin misiniz?",
        () => {
          customers.splice(index, 1);
          saveCustomers();
          renderCustomers();
        },
        "Bu görevi sil"
      );
    });

    taskCard.addEventListener("click", (e) => {
      if (e.target.closest(".delete-task-btn")) {
        return;
      }
      // Düzenle butonuna tıklandığında detay modalını açmasını engeller
      if (e.target.closest(".edit-task-btn")) {
        console.log("Düzenle butonu tıklandı, detay modalı açılmayacak");
        return;
      }
      if (!e.target.closest(".todo-list") && !e.target.closest(".editable")) {
        openDetailModal(customer.name, taskCard);
      }
    });

    return taskCard;
  }

  // Yeni eklenen openEditModal fonksiyonu
  function openEditModal(index) {
    try {
      console.log("openEditModal çağrıldı, index:", index);
      const customer = customers[index];
      console.log("Customer:", customer);

      if (!customer) {
        console.error("Customer bulunamadı!");
        return;
      }

      currentEditIndex = index;

      // Modal başlığını güncelle
      const editModalTitle = document.getElementById("editModalTitle");
      if (editModalTitle) {
        editModalTitle.textContent = `${customer.name} - Düzenle`;
      }

      // Form alanlarını doldur
      if (editCustomerInput) editCustomerInput.value = customer.name || "";
      if (editProjectInput) editProjectInput.value = customer.project || "";
      if (editPriorityInput) editPriorityInput.value = customer.priority || "";
      if (editDeadlineInput) editDeadlineInput.value = customer.deadline || "";
      if (editAlarmTimeInput)
        editAlarmTimeInput.value = customer.alarmTime || "";
      if (editPriceInput) editPriceInput.value = customer.price || "";

      // Custom select trigger'ları güncelle
      const editProjectTrigger = document.querySelector(
        '.custom-select-trigger[data-type="editProject"]'
      );
      if (editProjectTrigger)
        editProjectTrigger.textContent = customer.project || "Proje Türü Seçin";

      const editPriorityTrigger = document.querySelector(
        '.custom-select-trigger[data-type="editPriority"]'
      );
      if (editPriorityTrigger)
        editPriorityTrigger.textContent = customer.priority || "Aciliyet";

      // Modalı aç
      if (editTaskModal) {
        console.log("Modal açılıyor...");
        editTaskModal.style.display = "block";
        console.log("Modal display:", editTaskModal.style.display);
      } else {
        console.error("editTaskModal bulunamadı!");
      }
    } catch (error) {
      console.error("openEditModal hatası:", error);
    }
  }

  function openDetailModal(customerName, taskCard) {
    currentTaskCard = taskCard;
    const customerIndex = taskCard.dataset.index;
    const customer = customers[customerIndex];
    document.getElementById(
      "detailTitle"
    ).textContent = `${customerName} - Yapılacaklar`;
    todoListInModal.innerHTML = "";
    customer.todos.forEach((todo, todoIndex) => {
      const todoItem = createTodoItemElement(
        todo,
        customerIndex,
        todoIndex,
        "modal"
      );
      todoListInModal.appendChild(todoItem);
    });
    detailModal.style.display = "block";
  }

  addTodoBtn.addEventListener("click", () => {
    const todoText = newTodoInput.value.trim();
    if (todoText && currentTaskCard) {
      const customerIndex = currentTaskCard.dataset.index;
      const customer = customers[customerIndex];
      const newTodo = { name: todoText, completed: false };
      customer.todos.push(newTodo);
      saveCustomers();
      renderCustomers();
      const newTodoItemInModal = createTodoItemElement(
        newTodo,
        customerIndex,
        customer.todos.length - 1,
        "modal"
      );
      todoListInModal.appendChild(newTodoItemInModal);
      newTodoInput.value = "";
    }
  });

  function createTodoItemElement(todo, customerIndex, todoIndex, location) {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    if (todo.completed) {
      li.classList.add("completed");
    }

    if (location === "card") {
      li.innerHTML = `
                <input type="checkbox" ${todo.completed ? "checked" : ""}>
                <span>${todo.name}</span>
                <button class="delete-btn">Sil</button>
            `;
      li.querySelector('input[type="checkbox"]').addEventListener(
        "change",
        (e) => {
          const isChecked = e.target.checked;
          customers[customerIndex].todos[todoIndex].completed = isChecked;
          saveCustomers();
          if (isChecked) {
            li.classList.add("completed");
          } else {
            li.classList.remove("completed");
          }
          checkAllTodosCompleted();
        }
      );
    } else if (location === "modal") {
      li.innerHTML = `
                <span>${todo.name}</span>
                <button class="delete-btn">Sil</button>
            `;
      const todoSpan = li.querySelector("span");

      todoSpan.addEventListener("click", () => {
        const existingText = todoSpan.textContent;
        todoSpan.style.display = "none";

        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = existingText;
        editInput.classList.add("edit-todo-input");
        li.insertBefore(editInput, todoSpan);
        editInput.focus();

        const saveEdit = () => {
          const newText = editInput.value.trim();
          if (newText) {
            customers[customerIndex].todos[todoIndex].name = newText;
            todoSpan.textContent = newText;
            saveCustomers();
            renderCustomers();
          }
          editInput.remove();
          todoSpan.style.display = "block";
        };

        editInput.addEventListener("blur", saveEdit);
        editInput.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            saveEdit();
          }
        });
      });
    }

    li.querySelector(".delete-btn").addEventListener("click", () => {
      showConfirmModal(
        "Bu görevi silmek istediğinizden emin misiniz?",
        () => {
          customers[customerIndex].todos.splice(todoIndex, 1);
          saveCustomers();
          renderCustomers();
          if (detailModal.style.display === "block") {
            openDetailModal(
              customers[customerIndex].name,
              document.querySelector(
                `.task-card[data-index='${customerIndex}']`
              )
            );
          }
          checkAllTodosCompleted();
        },
        "Bu görevi sil"
      );
    });

    return li;
  }

  function showConfirmModal(message, onConfirm, title = "Onay Gerekli") {
    document.getElementById("confirmTitle").textContent = title;
    confirmMessage.textContent = message;
    confirmModal.style.display = "block";

    confirmYesBtn.onclick = () => {
      onConfirm();
      confirmModal.style.display = "none";
    };
    confirmCancelBtn.onclick = () => {
      confirmModal.style.display = "none";
    };
  }

  closeDetailBtn.addEventListener("click", () => {
    detailModal.style.display = "none";
  });
  closeDetailSpan.addEventListener("click", () => {
    detailModal.style.display = "none";
  });

  function saveCustomers() {
    localStorage.setItem("customers", JSON.stringify(customers));
  }

  function loadCustomers() {
    const storedCustomers = localStorage.getItem("customers");
    if (storedCustomers) {
      customers = JSON.parse(storedCustomers);
      renderCustomers();
    }
  }

  function checkAllTodosCompleted() {
    let allCompleted = true;
    if (customers.length === 0) {
      allCompleted = false;
    } else {
      for (const customer of customers) {
        if (customer.todos.length === 0) {
          allCompleted = false;
          break;
        }
        for (const todo of customer.todos) {
          if (!todo.completed) {
            allCompleted = false;
            break;
          }
        }
        if (!allCompleted) break;
      }
    }
    if (allCompleted) {
      const confettiSettings = { target: "confetti-canvas" };
      const confetti = new ConfettiGenerator(confettiSettings);
      const body = document.body;

      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.zIndex = "998";
      body.appendChild(overlay);

      document.getElementById("confetti-canvas").style.zIndex = "999";

      confetti.render();

      setTimeout(() => {
        confetti.clear();
        overlay.remove();
        document.getElementById("confetti-canvas").style.zIndex = "auto";
      }, 5000);
    }
  }

  function setTaskAlarm(customer) {
    // Son teslim tarihi kontrolü
    if (customer.deadline) {
      const deadline = new Date(customer.deadline + "T23:59:59");
      const now = new Date();
      const timeToDeadline = deadline.getTime() - now.getTime();

      // Son teslim tarihinden 1 gün önce bildirim
      const oneDayBefore = deadline.getTime() - 24 * 60 * 60 * 1000;
      const timeToOneDayBefore = oneDayBefore - now.getTime();

      // Son teslim tarihinden 1 saat önce bildirim
      const oneHourBefore = deadline.getTime() - 60 * 60 * 1000;
      const timeToOneHourBefore = oneHourBefore - now.getTime();

      // 1 gün önce bildirim
      if (timeToOneDayBefore > 0) {
        setTimeout(() => {
          showDeadlineNotification(customer, "1 gün kaldı!");
          schedulePushNotification(customer, "1 gün kaldı!", oneDayBefore);
        }, timeToOneDayBefore);
      }

      // 1 saat önce bildirim
      if (timeToOneHourBefore > 0) {
        setTimeout(() => {
          showDeadlineNotification(customer, "1 saat kaldı!");
          schedulePushNotification(customer, "1 saat kaldı!", oneHourBefore);
        }, timeToOneHourBefore);
      }

      // Son teslim tarihi geçti mi kontrol et
      if (timeToDeadline < 0 && !customer.deadlinePassed) {
        customer.deadlinePassed = true;
        showDeadlineNotification(customer, "Son teslim tarihi geçti!");
        saveCustomers();
      }
    }

    // Manuel alarm zamanı kontrolü
    if (customer.alarmTime) {
      console.log("Alarm zamanı kontrol ediliyor:", customer.alarmTime);
      const alarmTime = new Date(customer.alarmTime);
      console.log("Alarm Date objesi:", alarmTime);

      if (isNaN(alarmTime.getTime())) {
        console.log("Geçersiz alarm zamanı!");
        return;
      }

      const now = new Date();
      const timeToAlarm = alarmTime.getTime() - now.getTime();
      console.log("Alarm zamanına kalan süre (ms):", timeToAlarm);

      if (timeToAlarm > 0) {
        console.log("Alarm kuruldu,", timeToAlarm, "ms sonra çalacak");
        setTimeout(() => {
          console.log("ALARM ÇALIYOR!");
          showDeadlineNotification(customer, "Manuel alarm!");
        }, timeToAlarm);
        
        // PWA kapalıyken de bildirim gönder
        schedulePushNotification(customer, "Manuel alarm!", timeToAlarm);
      } else {
        console.log("Alarm zamanı geçmiş!");
      }
    }
  }

  // PWA kapalıyken bildirim gönderme fonksiyonu
  function schedulePushNotification(customer, message, delay) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        // Service Worker'a mesaj gönder
        registration.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          data: {
            title: 'Görev Hatırlatıcı',
            body: `${customer.name} - ${customer.project}\n${message}`,
            delay: delay,
            customer: customer.name,
            project: customer.project
          }
        });
        
        // Firebase token varsa, sunucuya da bildirim gönderme isteği yapabilirsiniz
        const firebaseToken = localStorage.getItem('firebaseToken');
        if (firebaseToken) {
          console.log('Firebase token mevcut, sunucuya bildirim gönderilebilir');
          // Burada sunucuya POST isteği yaparak bildirim gönderebilirsiniz
          // Örnek: sendNotificationToServer(firebaseToken, customer, message, delay);
        }
      });
    }
  }

  function showDeadlineNotification(customer, message) {
    // Tarayıcı bildirimi
    if (Notification.permission === "granted") {
      const notification = new Notification("Görev Hatırlatıcı", {
        body: `${customer.name} - ${customer.project}\n${message}`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `deadline-${customer.name}`,
        requireInteraction: true,
      });

      // Bildirime tıklandığında sayfayı açması
      notification.onclick = function () {
        window.focus();
        notification.close();
      };
    }

    // Ses çal
    if (audio) {
      audio.play().catch((e) => console.log("Alarm çalma hatası:", e));
    }

    // Mobil cihazlarda titreşim (sadece kullanıcı etkileşimi sonrasında)
    if ("vibrate" in navigator && window.userHasInteracted) {
      try {
        navigator.vibrate([200, 100, 200, 100, 200]);
      } catch (e) {
        console.log("Titreşim hatası:", e);
      }
    }

    // Console'a log
    console.log(
      `🔔 ALARM: ${customer.name} - ${customer.project} - ${message}`
    );
  }

  document.querySelectorAll(".custom-select-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const options = trigger.parentNode.querySelector(".custom-options");
      trigger.classList.toggle("active");
      options.classList.toggle("active");
    });
  });

  document.querySelectorAll(".custom-options li").forEach((option) => {
    option.addEventListener("click", (e) => {
      const parentContainer = e.target.closest(".custom-select-container");
      const trigger = parentContainer.querySelector(".custom-select-trigger");
      const hiddenInput = parentContainer.querySelector(
        `#${trigger.dataset.type}`
      );

      trigger.textContent = e.target.textContent;
      hiddenInput.value = e.target.dataset.value;

      trigger.classList.remove("active");
      parentContainer
        .querySelector(".custom-options")
        .classList.remove("active");
    });
  });

  window.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-select-container")) {
      document.querySelectorAll(".custom-options.active").forEach((options) => {
        options.classList.remove("active");
        options.parentNode
          .querySelector(".custom-select-trigger")
          .classList.remove("active");
      });
    }
  });

  // Düzenleme modalındaki custom select'ler için event listener'lar
  document.addEventListener("click", (e) => {
    if (
      e.target.closest('.custom-select-trigger[data-type="editProject"]') ||
      e.target.closest('.custom-select-trigger[data-type="editPriority"]')
    ) {
      const trigger = e.target.closest(".custom-select-trigger");
      const options = trigger.parentNode.querySelector(".custom-options");
      trigger.classList.toggle("active");
      options.classList.toggle("active");
    }
  });

  document.addEventListener("click", (e) => {
    if (
      e.target.closest('.custom-options[data-type="editProject"] li') ||
      e.target.closest('.custom-options[data-type="editPriority"] li')
    ) {
      const option = e.target;
      const parentContainer = option.closest(".custom-select-container");
      const trigger = parentContainer.querySelector(".custom-select-trigger");
      const hiddenInput = parentContainer.querySelector(
        `#${trigger.dataset.type.replace("edit", "").toLowerCase()}`
      );

      trigger.textContent = option.textContent;
      hiddenInput.value = option.dataset.value;

      trigger.classList.remove("active");
      parentContainer
        .querySelector(".custom-options")
        .classList.remove("active");
    }
  });
});
