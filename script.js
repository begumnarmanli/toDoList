// PWA Bildirim Sistemi - Firebase olmadan
console.log("🚀 PWA Bildirim Sistemi Başlatıldı");

// Bildirim izni kontrolü
if ("Notification" in window) {
  console.log("📱 Bildirim API destekleniyor");
  console.log("🔔 Mevcut bildirim durumu:", Notification.permission);
} else {
  console.log("❌ Bildirim API desteklenmiyor");
}

// PWA için basitleştirilmiş Service Worker kayıt sistemi
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none'
    })
    .then(registration => {
      console.log('✅ PWA Service Worker kayıt başarılı:', registration);
    })
    .catch(error => {
      console.log('❌ PWA Service Worker kayıt hatası:', error);
    });
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

  // PWA için basitleştirilmiş bildirim izni yönetimi - Firebase olmadan
  function requestNotificationPermission() {
    if ("Notification" in window) {
      console.log("📱 PWA Cihaz:", navigator.userAgent);
      console.log("🔔 PWA Bildirim durumu:", Notification.permission);

      // iPhone kontrolü
      const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      console.log("📱 Platform:", isIPhone ? "iPhone" : isAndroid ? "Android" : "Diğer");

      if (Notification.permission === "default") {
        console.log("📱 PWA için bildirim izni isteniyor...");
        
        // PWA'da hemen izin iste
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("✅ PWA'da bildirim izni verildi!");
            showWelcomeNotification();
            // Test bildirimi gönder
            setTimeout(() => {
              testPWA();
            }, 1000);
          } else {
            console.log("❌ PWA'da bildirim izni reddedildi");
            showPWANotificationGuide();
          }
        });
      } else if (Notification.permission === "granted") {
        console.log("✅ PWA bildirim izni zaten verilmiş");
        showWelcomeNotification();
        // Test bildirimi gönder
        setTimeout(() => {
          testPWA();
        }, 1000);
        
        // iPhone için özel uyarı
        if (isIPhone) {
          showIPhoneNotificationWarning();
        }
      } else if (Notification.permission === "denied") {
        console.log("❌ PWA bildirim izni reddedilmiş");
        showPWANotificationGuide();
      }
    } else {
      console.log("❌ PWA Notification API desteklenmiyor");
    }
  }
  
  // iPhone için özel uyarı
  function showIPhoneNotificationWarning() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    content.innerHTML = `
      <h3 style="color: #8b0000; margin-bottom: 20px;">📱 iPhone Bildirim Uyarısı</h3>
      <p style="margin-bottom: 20px; line-height: 1.6;">
        <strong>iPhone'da PWA bildirimleri sadece ekran açıkken çalışır.</strong>
        <br><br>
        Arka planda bildirim almak için:
        <br>• PWA'yı açık tutun
        <br>• Ekranı kapatmayın
        <br>• Veya Safari'de kullanın
      </p>
      <button id="closeIPhoneWarning" style="
        background: #8b0000;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
      ">Anladım</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('closeIPhoneWarning').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  // PWA test fonksiyonu - Android için optimize
  function testPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        // Önce anında test bildirimi gönder
        registration.active.postMessage({
          type: 'IMMEDIATE_NOTIFICATION'
        });
        console.log('✅ Anında test bildirimi gönderildi');
        
        // 3 saniye sonra normal test bildirimi
        setTimeout(() => {
          registration.active.postMessage({
            type: 'TEST_NOTIFICATION'
          });
          console.log('✅ Gecikmeli test bildirimi gönderildi');
        }, 3000);
      }).catch(error => {
        console.log('❌ Service Worker hazır değil:', error);
        // Alternatif test
        if (Notification.permission === "granted") {
          new Notification("Test Bildirimi", {
            body: "Tarayıcı bildirimi çalışıyor!",
            icon: "./to-do-list-128.png"
          });
        }
      });
    } else {
      console.log('❌ Service Worker desteklenmiyor');
      // Alternatif test
      if (Notification.permission === "granted") {
        new Notification("Test Bildirimi", {
          body: "Tarayıcı bildirimi çalışıyor!",
          icon: "./to-do-list-128.png"
        });
      }
    }
  }

  // PWA için bildirim rehberi
  function showPWANotificationGuide() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 450px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    content.innerHTML = `
      <h3 style="color: #8b0000; margin-bottom: 20px;">📱 PWA Bildirim Ayarları</h3>
      <p style="margin-bottom: 20px; line-height: 1.6;">
        PWA uygulamasında bildirimler için ayarlar:
      </p>
      <div style="
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        text-align: left;
        line-height: 1.8;
      ">
        <strong>Android PWA Ayarları:</strong>
        <br>1. Ayarlar → Uygulamalar → Görevler (PWA)
        <br>2. "Bildirimler" → "İzin ver"
        <br>3. "Arka planda çalışma" → "İzin ver"
        <br><br>
        <strong>Alternatif:</strong>
        <br>1. PWA'yı kapatın
        <br>2. Tarayıcıda siteyi açın
        <br>3. Bildirim izni verin
        <br>4. PWA'yı tekrar açın
      </div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="retryPWA" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        ">Tekrar Dene</button>
        <button id="closePWAGuide" style="
          background: #95a5a6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
        ">Kapat</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Tekrar dene butonu
    document.getElementById('retryPWA').addEventListener('click', () => {
      modal.remove();
      setTimeout(() => {
        requestNotificationPermission();
      }, 500);
    });

    // Kapat butonu
    document.getElementById('closePWAGuide').addEventListener('click', () => {
      modal.remove();
    });
  }

  // Bildirim izni modal'ı göster
  function showNotificationPermissionModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    content.innerHTML = `
      <h3 style="color: #8b0000; margin-bottom: 20px;">🔔 Bildirim İzni</h3>
      <p style="margin-bottom: 20px; line-height: 1.6;">
        Görev hatırlatıcıları alabilmek için bildirim iznine ihtiyacımız var.
        <br><br>
        <strong>Bu sayede:</strong>
        <br>• 1 gün önce hatırlatma
        <br>• 1 saat önce hatırlatma
        <br>• Manuel alarm bildirimleri
      </p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="allowNotifications" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        ">İzin Ver</button>
        <button id="skipNotifications" style="
          background: #95a5a6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
        ">Şimdilik Geç</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // İzin ver butonu
    document.getElementById('allowNotifications').addEventListener('click', () => {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("✅ Bildirim izni verildi!");
          showWelcomeNotification();
          modal.remove();
        } else {
          console.log("❌ Bildirim izni reddedildi");
          showNotificationSettingsGuide();
          modal.remove();
        }
      });
    });

    // Şimdilik geç butonu
    document.getElementById('skipNotifications').addEventListener('click', () => {
      modal.remove();
    });
  }

  // Bildirim ayarları rehberi
  function showNotificationSettingsGuide() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 450px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    const isChrome = navigator.userAgent.includes("Chrome");
    const isSafari = navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
    const isFirefox = navigator.userAgent.includes("Firefox");

    let instructions = '';
    if (isChrome) {
      instructions = `
        <strong>Chrome'da bildirim izni vermek için:</strong>
        <br>1. Adres çubuğundaki 🔒 simgesine tıklayın
        <br>2. "Bildirimler" seçeneğini "İzin ver" yapın
        <br>3. Sayfayı yenileyin
      `;
    } else if (isSafari) {
      instructions = `
        <strong>Safari'de bildirim izni vermek için:</strong>
        <br>1. Safari → Tercihler → Web siteleri
        <br>2. Bildirimler bölümünü bulun
        <br>3. Bu site için "İzin ver" seçin
      `;
    } else if (isFirefox) {
      instructions = `
        <strong>Firefox'ta bildirim izni vermek için:</strong>
        <br>1. Adres çubuğundaki 🔒 simgesine tıklayın
        <br>2. "Bildirimler" seçeneğini "İzin ver" yapın
        <br>3. Sayfayı yenileyin
      `;
    } else {
      instructions = `
        <strong>Bildirim izni vermek için:</strong>
        <br>1. Tarayıcı ayarlarına gidin
        <br>2. Site izinleri → Bildirimler
        <br>3. Bu site için izin verin
      `;
    }

    content.innerHTML = `
      <h3 style="color: #8b0000; margin-bottom: 20px;">⚙️ Bildirim Ayarları</h3>
      <p style="margin-bottom: 20px; line-height: 1.6;">
        Bildirim izni reddedildi. Manuel olarak ayarlamanız gerekiyor:
      </p>
      <div style="
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        text-align: left;
        line-height: 1.8;
      ">
        ${instructions}
      </div>
      <button id="closeGuide" style="
        background: #8b0000;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
      ">Anladım</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('closeGuide').addEventListener('click', () => {
      modal.remove();
    });
  }

  // Bildirim ayarları butonu
  const notificationSettingsBtn = document.getElementById("notificationSettings");
  const testNotificationBtn = document.getElementById("testNotification");
  
  // PWA'da bildirim ayarları butonunu göster
  if (window.matchMedia("(display-mode: standalone)").matches) {
    notificationSettingsBtn.style.display = "inline-block";
    testNotificationBtn.style.display = "inline-block";
    
    notificationSettingsBtn.addEventListener("click", () => {
      showNotificationSettingsGuide();
    });
    
    testNotificationBtn.addEventListener("click", () => {
      testPWA();
    });
  }

  // Sayfa yüklendiğinde bildirim izni iste
  setTimeout(() => {
    requestNotificationPermission();
  }, 2000);

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

  // Mobil cihazlar için güçlendirilmiş event listener'lar
  function openNewTaskModal() {
    console.log("Modal açılıyor...");
    taskModal.style.display = "block";
  }

  // Click event
  newTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Yeni görev butonuna tıklandı");
    openNewTaskModal();
  });
  
  // Touch events
  newTaskBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    console.log("Yeni görev butonuna dokunuldu");
    openNewTaskModal();
  });

  // Mouse events (mobil tarayıcılar için)
  newTaskBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    console.log("Yeni görev butonuna mouse down");
    openNewTaskModal();
  });

  // Pointer events (modern tarayıcılar için)
  newTaskBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    console.log("Yeni görev butonuna pointer down");
    openNewTaskModal();
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

  // PWA için basitleştirilmiş bildirim sistemi
  function schedulePushNotification(customer, message, delay) {
    console.log('PWA bildirim zamanlanıyor:', { customer: customer.name, message, delay });
    
    if ('serviceWorker' in navigator) {
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
        
        console.log('✅ PWA bildirim zamanlandı');
      }).catch(error => {
        console.log('❌ PWA bildirim hatası:', error);
      });
    } else {
      console.log('❌ Service Worker desteklenmiyor');
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
